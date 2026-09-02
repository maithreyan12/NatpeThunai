// ═══════════════════════════════════════════════════════════════════
//  R2 STORAGE SERVICE — Direct browser → Cloudflare R2 uploads
//  No Firebase dependency. Works in production via Vercel API routes.
// ═══════════════════════════════════════════════════════════════════

export const R2_BUDGET_LIMITS = {
  MAX_STORAGE_BYTES: 9 * 1024 * 1024 * 1024, // 9 GB safe ceiling
  MAX_IMAGE_BYTES:   10 * 1024 * 1024,        // 10 MB per image
  MAX_VIDEO_BYTES:   100 * 1024 * 1024,        // 100 MB per video
};

const ALLOWED_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/svg+xml'],
  video: ['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg'],
};

/**
 * Upload an image or video file to Cloudflare R2.
 * Requests a presigned URL from /api/r2/presign, then streams the file directly.
 *
 * @param {File} file         - Browser File object
 * @param {string} category   - 'members' | 'memories' | 'posts'
 * @param {Function} onProgress - Callback(percentage 0-100)
 * @returns {Promise<{publicUrl, objectKey, fileType, sizeBytes}>}
 */
export async function uploadToR2WithGuardrails(file, category = 'members', onProgress = null) {
  if (!file) throw new Error('No file provided.');

  const isImage = ALLOWED_TYPES.image.includes(file.type) || file.type.startsWith('image/');
  const isVideo = ALLOWED_TYPES.video.includes(file.type) || file.type.startsWith('video/');

  if (!isImage && !isVideo) {
    throw new Error(`Unsupported file type: ${file.type}. Only images and videos are allowed.`);
  }

  const fileType = isImage ? 'image' : 'video';
  const maxSize  = isImage ? R2_BUDGET_LIMITS.MAX_IMAGE_BYTES : R2_BUDGET_LIMITS.MAX_VIDEO_BYTES;

  if (file.size > maxSize) {
    const maxMB  = (maxSize / (1024 * 1024)).toFixed(0);
    const fileMB = (file.size / (1024 * 1024)).toFixed(2);
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
        filename: file.name,
        mimeType: file.type || (isImage ? 'image/jpeg' : 'video/mp4'),
        sizeBytes: file.size,
        category,
      }),
    });

    if (!presignRes.ok) {
      const errData = await presignRes.json().catch(() => ({}));
      if (errData.missingConfig || presignRes.status === 503) {
        console.warn('[R2] Server credentials not configured — using local data URL.');
        return await fallbackToDataUrl(file, fileType);
      }
      throw new Error(errData.error || `Presign failed (${presignRes.status})`);
    }

    const result = await presignRes.json();
    uploadUrl = result.uploadUrl;
    publicUrl = result.publicUrl;
    objectKey = result.objectKey;
  } catch (err) {
    console.warn('[R2] Presign request failed, using local fallback:', err.message);
    return await fallbackToDataUrl(file, fileType);
  }

  if (onProgress) onProgress(15);

  // ── Step 2: Stream file directly to Cloudflare R2 ─────────────────
  await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl, true);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
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
    xhr.send(file);
  });

  return { publicUrl, objectKey, fileType, sizeBytes: file.size };
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
