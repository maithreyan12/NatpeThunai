// ═══════════════════════════════════════════════════════════════════
//  CLOUDFLARE R2 — STATIC ASSET BASE URL
//  All static squad photos are served from R2 CDN.
//  To update: change this single constant.
// ═══════════════════════════════════════════════════════════════════

export const R2_BASE = 'https://pub-5eb58baa7fba49158317c089031c3d49.r2.dev';

/**
 * Returns the full R2 CDN URL for a photo stored in the R2 /photos/ folder.
 * Example: r2Photo('farish.jpg')
 *          → 'https://pub-5eb58baa7fba49158317c089031c3d49.r2.dev/photos/farish.jpg'
 *
 * @param {string} filename - Just the filename, e.g. 'farish.jpg'
 */
export const r2Photo = (filename) => `${R2_BASE}/photos/${filename}`;
