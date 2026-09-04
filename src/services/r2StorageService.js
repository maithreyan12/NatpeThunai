// ═══════════════════════════════════════════════════════════════════
//  R2 STORAGE SERVICE — Direct browser → Cloudflare R2 uploads
//  No Firebase dependency. Works in production via Vercel API routes.
// ═══════════════════════════════════════════════════════════════════

export const R2_BUDGET_LIMITS = {
  MAX_STORAGE_BYTES: 9 * 1024 * 1024 * 1024, // 9 GB safe ceiling
  MAX_IMAGE_BYTES:   15 * 1024 * 1024,        // 15 MB per image
  MAX_AUDIO_BYTES:   60 * 1024 * 1024,        // 60 MB per song / audio
  MAX_VIDEO_BYTES:   100 * 1024 * 1024,       // 100 MB per video
};

const ALLOWED_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/svg+xml', 'image/heic', 'image/heif'],
  video: ['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg'],
  audio: ['audio/mpeg', 'audio/mp3', 'audio/m4a', 'audio/x-m4a', 'audio/wav', 'audio/aac', 'audio/ogg', 'audio/webm', 'audio/flac'],
};

/**
 * Upload an image, audio, or video file to Cloudflare R2.
 * Automatically converts iPhone HEIC/HEIF to universally supported JPEG.
 * Requests a presigned URL from /api/r2/presign, then streams the file directly.
 *
 * @param {File} file         - Browser File object
 * @param {string} category   - 'members' | 'memories' | 'posts' | 'reels' | 'music'
 * @param {Function} onProgress - Callback(percentage 0-100)
 * @returns {Promise<{publicUrl, objectKey, fileType, sizeBytes}>}
 */
export async function uploadToR2WithGuardrails(file, category = 'members', onProgress = null) {
  if (!file) throw new Error('No file provided.');

  let activeFile = file;

  // ── Auto-convert Apple HEIC/HEIF photos to high-definition JPEG ──
  const isHeic = file.name?.toLowerCase().endsWith('.heic') || 
                 file.name?.toLowerCase().endsWith('.heif') || 
                 file.type === 'image/heic' || 
                 file.type === 'image/heif';

  if (isHeic) {
    try {
      if (onProgress) onProgress(3);
      const heic2any = (await import('heic2any')).default;
      const convertedBlob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.90,
      });
      const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
      const newName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
      activeFile = new File([blob], newName, { type: 'image/jpeg' });
    } catch (conversionErr) {
      console.warn('[R2 Storage] HEIC conversion warning:', conversionErr);
    }
  }

  const isAudio = ALLOWED_TYPES.audio.includes(activeFile.type) || 
                  activeFile.type.startsWith('audio/') || 
                  /\.(mp3|m4a|wav|aac|ogg|flac)$/i.test(activeFile.name);
  const isImage = ALLOWED_TYPES.image.includes(activeFile.type) || activeFile.type.startsWith('image/') || isHeic;
  const isVideo = ALLOWED_TYPES.video.includes(activeFile.type) || activeFile.type.startsWith('video/');

  if (!isImage && !isVideo && !isAudio) {
    throw new Error(`Unsupported file type: ${activeFile.type || 'unknown'}. Only images, audio, and videos are allowed.`);
  }

  let fileType = 'image';
  let maxSize = R2_BUDGET_LIMITS.MAX_IMAGE_BYTES;
  if (isAudio) {
    fileType = 'audio';
    maxSize = R2_BUDGET_LIMITS.MAX_AUDIO_BYTES;
  } else if (isVideo) {
    fileType = 'video';
    maxSize = R2_BUDGET_LIMITS.MAX_VIDEO_BYTES;
  }

  if (activeFile.size > maxSize) {
    const maxMB  = (maxSize / (1024 * 1024)).toFixed(0);
    const fileMB = (activeFile.size / (1024 * 1024)).toFixed(2);
    throw new Error(`File too large: ${fileMB} MB. Maximum ${maxMB} MB for ${fileType}s.`);
  }


  if (onProgress) onProgress(5);

  // ── Step 1: Get presigned URL from server ──────────────────────────
  let uploadUrl, publicUrl, objectKey;
  try {
    const presignRes = await fetch('/api/r2/presign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: activeFile.name,
        mimeType: activeFile.type || (isAudio ? 'audio/mpeg' : (isImage ? 'image/jpeg' : 'video/mp4')),
        sizeBytes: activeFile.size,
        category,
      }),
    });

    if (!presignRes.ok) {
      const errData = await presignRes.json().catch(() => ({}));
      if (errData.missingConfig || presignRes.status === 503) {
        console.warn('[R2] Server credentials not configured — using local data URL.');
        return await fallbackToDataUrl(activeFile, fileType);
      }
      throw new Error(errData.error || `Presign failed (${presignRes.status})`);
    }

    const result = await presignRes.json();
    uploadUrl = result.uploadUrl;
    publicUrl = result.publicUrl;
    objectKey = result.objectKey;
  } catch (err) {
    console.warn('[R2] Presign request failed, using local fallback:', err.message);
    return await fallbackToDataUrl(activeFile, fileType);
  }

  if (onProgress) onProgress(15);

  // ── Step 2: Stream file directly to Cloudflare R2 ─────────────────
  await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl, true);
    xhr.setRequestHeader('Content-Type', activeFile.type || 'application/octet-stream');
    xhr.setRequestHeader('Cache-Control', 'public, max-age=31536000, immutable');

    if (onProgress && xhr.upload) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress(15 + Math.round((e.loaded / e.total) * 80));
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        if (onProgress) onProgress(100);
        resolve();
      } else {
        reject(new Error(`R2 upload failed: HTTP ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error('Network error uploading to Cloudflare R2.'));
    xhr.send(activeFile);
  });

  return { publicUrl, objectKey, fileType, sizeBytes: activeFile.size };

}

/**
 * Delete a media object from Cloudflare R2.
 */
export async function deleteFromR2(objectKey) {
  if (!objectKey) return false;
  try {
    const res = await fetch('/api/r2/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ objectKey }),
    });
    return res.ok;
  } catch (err) {
    console.warn('[R2 Delete Error]:', err.message);
    return false;
  }
}

// Fallback: convert file to base64 data URL (offline / dev only)
function fallbackToDataUrl(file, fileType) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve({
      publicUrl: e.target.result,
      objectKey: null,
      fileType,
      sizeBytes: file.size,
      isFallback: true,
    });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Stub exports to keep backward compatibility with any remaining imports
export const checkAndReserveR2Quota = async () => ({ allowed: true });
export const recordR2UploadSuccess = async () => {};
export const recordR2DeletionInFirestore = async () => 0;
export const getR2MonthlyUsage = async () => ({
  storageBytes: 0, storageGB: '0.00', storagePercent: '0.0', classAOps: 0, isWarning: false
});
export const getCurrentMonthKey = () => new Date().toISOString().slice(0, 7);
