// r2QuotaService.js — Lightweight quota stubs (no Firebase)
// Quota is enforced server-side by file size limits only

export const R2_BUDGET_LIMITS = {
  MAX_STORAGE_BYTES: 9 * 1024 * 1024 * 1024,
  MAX_CLASS_A_OPS: 800000,
  MAX_CLASS_B_OPS: 8000000,
  MAX_IMAGE_BYTES: 10 * 1024 * 1024,
  MAX_VIDEO_BYTES: 100 * 1024 * 1024,
};

export const getCurrentMonthKey = () => new Date().toISOString().slice(0, 7);

export async function checkAndReserveR2Quota(sizeBytes) {
  if (sizeBytes > R2_BUDGET_LIMITS.MAX_STORAGE_BYTES) {
    return { allowed: false, reason: 'File exceeds 9 GB storage limit.' };
  }
  return { allowed: true, currentStorageBytes: 0, remainingStorageBytes: R2_BUDGET_LIMITS.MAX_STORAGE_BYTES - sizeBytes };
}

export async function recordR2UploadSuccess() {}
export async function recordR2DeletionInFirestore() { return 0; }

export async function getR2MonthlyUsage() {
  return { storageBytes: 0, storageGB: '0.00', storagePercent: '0.0', classAOps: 0, isWarning: false };
}
