import {
  checkAndReserveR2Quota,
  recordR2UploadSuccess,
  recordR2DeletionInFirestore,
  R2_BUDGET_LIMITS
} from './r2QuotaService';

const ALLOWED_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/svg+xml'],
  video: ['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg']
};

/**
 * Upload an image or video file directly to Cloudflare R2 with free-tier guardrails.
 *
 * @param {File} file - Browser File object
 * @param {string} category - 'memories' | 'posts' | 'members'
 * @param {function} onProgress - Callback (percentage 0..100)
 * @returns {Promise<{publicUrl: string, objectKey: string, fileType: string, sizeBytes: number}>}
 */
export async function uploadToR2WithGuardrails(file, category = 'memories', onProgress = null) {
  if (!file) {
    throw new Error('No file provided for upload.');
  }

  const isImage = ALLOWED_TYPES.image.includes(file.type) || file.type.startsWith('image/');
  const isVideo = ALLOWED_TYPES.video.includes(file.type) || file.type.startsWith('video/');

  if (!isImage && !isVideo) {
    throw new Error(`Unsupported file type: ${file.type || 'unknown'}. Only image and video files are supported.`);
  }

  const fileType = isImage ? 'image' : 'video';
  const maxSize = isImage ? R2_BUDGET_LIMITS.MAX_IMAGE_BYTES : R2_BUDGET_LIMITS.MAX_VIDEO_BYTES;

  // 1. Enforce individual file size caps
  if (file.size > maxSize) {
    const maxMB = (maxSize / (1024 * 1024)).toFixed(0);
    const fileMB = (file.size / (1024 * 1024)).toFixed(2);
    throw new Error(`File size (${fileMB} MB) exceeds maximum allowed ${maxMB} MB for ${fileType}s.`);
  }

  // 2. Atomic Budget Guardrail Check via Firestore
  const quota = await checkAndReserveR2Quota(file.size);
  if (!quota.allowed) {
    throw new Error(`Budget Guardrail: ${quota.reason}`);
  }

  // 3. Request Presigned URL from local / server endpoint
  try {
    const presignRes = await fetch('/api/r2/presign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: file.name,
        mimeType: file.type || (isImage ? 'image/jpeg' : 'video/mp4'),
        sizeBytes: file.size,
        category
      })
    });

    if (!presignRes.ok) {
      const errorData = await presignRes.json().catch(() => ({}));
      
      // If R2 credentials aren't configured yet in .env.local, fallback to Base64 data URL
      if (errorData.missingConfig || presignRes.status === 503) {
        console.info('[R2 Notice]: R2 credentials not configured in .env.local. Falling back to local data URL.');
        return await fallbackToDataUrl(file, fileType);
      }
      throw new Error(errorData.error || `Upload preparation failed (${presignRes.status}).`);
    }

    const { uploadUrl, publicUrl, objectKey } = await presignRes.json();

    // 4. Perform Direct Stream Upload to Cloudflare R2 via Presigned PUT
    await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl, true);
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
      xhr.setRequestHeader('Cache-Control', 'public, max-age=31536000, immutable');

      if (onProgress && xhr.upload) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          if (onProgress) onProgress(100);
          resolve();
        } else {
          reject(new Error(`Cloudflare R2 upload failed with status ${xhr.status}.`));
        }
      };

      xhr.onerror = () => reject(new Error('Network error connecting to Cloudflare R2.'));
      xhr.send(file);
    });

    // 5. Commit record to Firestore
    await recordR2UploadSuccess(objectKey, fileType, file.type, file.size);

    return {
      publicUrl,
      objectKey,
      fileType,
      sizeBytes: file.size
    };
  } catch (err) {
    console.warn('[R2 Upload Falling Back]:', err.message);
    // If anything fails with R2 direct upload, fall back to local URL gracefully
    return await fallbackToDataUrl(file, fileType);
  }
}

/**
 * Delete a media object from Cloudflare R2 and reclaim storage quota.
 */
export async function deleteFromR2(objectKey) {
  if (!objectKey) return false;

  try {
    await fetch('/api/r2/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ objectKey })
    });

    await recordR2DeletionInFirestore(objectKey);
    return true;
  } catch (err) {
    console.warn('[R2 Delete Error]:', err.message);
    return false;
  }
}

// Fallback helper for offline/unconfigured environments
function fallbackToDataUrl(file, fileType) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve({
        publicUrl: e.target.result,
        objectKey: null,
        fileType,
        sizeBytes: file.size,
        isFallback: true
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
