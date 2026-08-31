import { db } from '../firebase';
import {
  doc,
  runTransaction,
  serverTimestamp,
  increment,
  updateDoc,
  setDoc,
  getDoc
} from 'firebase/firestore';

// Free-Tier Safe Budget Limits (Cloudflare R2)
export const R2_BUDGET_LIMITS = {
  MAX_STORAGE_BYTES: 9 * 1024 * 1024 * 1024, // 9.0 GB (10 GB free ceiling)
  MAX_CLASS_A_OPS: 800000,                   // 800,000 ops (1M ceiling)
  MAX_CLASS_B_OPS: 8000000,                  // 8,000,000 ops (10M ceiling)
  MAX_IMAGE_BYTES: 10 * 1024 * 1024,         // 10 MB per image
  MAX_VIDEO_BYTES: 100 * 1024 * 1024         // 100 MB per video
};

export const getCurrentMonthKey = () => new Date().toISOString().slice(0, 7); // 'YYYY-MM'

/**
 * Atomic Quota Check & Reservation via Firestore Transaction
 * Ensures concurrent uploads never exceed the 9.0 GB safe threshold.
 */
export async function checkAndReserveR2Quota(sizeBytes) {
  if (!db) {
    return { allowed: true, currentStorageBytes: 0, remainingStorageBytes: R2_BUDGET_LIMITS.MAX_STORAGE_BYTES };
  }

  const monthKey = getCurrentMonthKey();
  const aggregateRef = doc(db, 'r2_monthly_aggregates', monthKey);

  try {
    return await runTransaction(db, async (transaction) => {
      const aggregateDoc = await transaction.get(aggregateRef);

      let currentStorage = 0;
      let currentClassA = 0;
      let isLocked = false;

      if (aggregateDoc.exists()) {
        const data = aggregateDoc.data();
        currentStorage = data.totalStorageBytes || 0;
        currentClassA = data.classAOperations || 0;
        isLocked = data.isLocked || false;
      }

      if (isLocked) {
        return {
          allowed: false,
          reason: 'R2 monthly uploads are currently locked to prevent accidental billing.'
        };
      }

      if (currentStorage + sizeBytes > R2_BUDGET_LIMITS.MAX_STORAGE_BYTES) {
        return {
          allowed: false,
          reason: `Storage quota threshold reached (9.0 GB limit). Current usage: ${(currentStorage / (1024 ** 3)).toFixed(2)} GB.`
        };
      }

      if (currentClassA + 1 > R2_BUDGET_LIMITS.MAX_CLASS_A_OPS) {
        return {
          allowed: false,
          reason: 'Monthly Class A operations limit reached (800,000 / 1M ops).'
        };
      }

      // Reserve 1 Class A operation for this upload
      if (!aggregateDoc.exists()) {
        transaction.set(aggregateRef, {
          totalStorageBytes: 0,
          classAOperations: 1,
          classBOperations: 0,
          isLocked: false,
          updatedAt: serverTimestamp()
        });
      } else {
        transaction.update(aggregateRef, {
          classAOperations: increment(1),
          updatedAt: serverTimestamp()
        });
      }

      return {
        allowed: true,
        currentStorageBytes: currentStorage,
        remainingStorageBytes: R2_BUDGET_LIMITS.MAX_STORAGE_BYTES - (currentStorage + sizeBytes)
      };
    });
  } catch (err) {
    console.warn('[R2 Quota Transaction Warning]:', err.message);
    // If Firestore fails or is in test mode/offline, allow with local fallback
    return { allowed: true, fallback: true };
  }
}

/**
 * Record Upload Success in Firestore
 */
export async function recordR2UploadSuccess(objectKey, fileType, mimeType, sizeBytes) {
  if (!db) return;

  const monthKey = getCurrentMonthKey();
  const logId = objectKey.replace(/[\/\.]/g, '_');
  const logRef = doc(db, 'r2_usage_logs', logId);
  const aggregateRef = doc(db, 'r2_monthly_aggregates', monthKey);

  try {
    await setDoc(logRef, {
      objectKey,
      fileType,
      mimeType,
      sizeBytes,
      monthYear: monthKey,
      isDeleted: false,
      createdAt: serverTimestamp()
    });

    await updateDoc(aggregateRef, {
      totalStorageBytes: increment(sizeBytes),
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    console.warn('[R2 Log Error]:', err.message);
  }
}

/**
 * Record File Deletion in Firestore (Reclaims storage and logs 1 Class A op)
 */
export async function recordR2DeletionInFirestore(objectKey) {
  if (!db) return 0;

  const monthKey = getCurrentMonthKey();
  const logId = objectKey.replace(/[\/\.]/g, '_');
  const logRef = doc(db, 'r2_usage_logs', logId);
  const aggregateRef = doc(db, 'r2_monthly_aggregates', monthKey);

  try {
    const logSnap = await getDoc(logRef);
    if (!logSnap.exists() || logSnap.data().isDeleted) {
      return 0;
    }

    const { sizeBytes } = logSnap.data();

    await updateDoc(logRef, {
      isDeleted: true,
      deletedAt: serverTimestamp()
    });

    await updateDoc(aggregateRef, {
      totalStorageBytes: increment(-sizeBytes),
      classAOperations: increment(1),
      updatedAt: serverTimestamp()
    });

    return sizeBytes;
  } catch (err) {
    console.warn('[R2 Deletion Log Error]:', err.message);
    return 0;
  }
}

/**
 * Get current monthly storage and operations metrics
 */
export async function getR2MonthlyUsage() {
  if (!db) {
    return { storageBytes: 0, storageGB: '0.00', storagePercent: '0.0', classAOps: 0, isWarning: false };
  }

  const monthKey = getCurrentMonthKey();
  const aggregateRef = doc(db, 'r2_monthly_aggregates', monthKey);

  try {
    const snap = await getDoc(aggregateRef);
    if (!snap.exists()) {
      return { storageBytes: 0, storageGB: '0.00', storagePercent: '0.0', classAOps: 0, isWarning: false };
    }

    const data = snap.data();
    const storageBytes = Math.max(0, data.totalStorageBytes || 0);
    const storageGB = (storageBytes / (1024 ** 3)).toFixed(2);
    const storagePercent = Math.min(100, (storageBytes / R2_BUDGET_LIMITS.MAX_STORAGE_BYTES) * 100).toFixed(1);
    const isWarning = parseFloat(storagePercent) >= 80;

    return {
      storageBytes,
      storageGB,
      storagePercent,
      classAOps: data.classAOperations || 0,
      isWarning
    };
  } catch (err) {
    console.warn('[R2 Usage Fetch Error]:', err.message);
    return { storageBytes: 0, storageGB: '0.00', storagePercent: '0.0', classAOps: 0, isWarning: false };
  }
}
