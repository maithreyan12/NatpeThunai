/**
 * One-shot script: Upload all local /public/photos/ images to Cloudflare R2
 * Run with: node upload-photos-to-r2.mjs
 */

import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

// ── Config from .env (inline for script use) ──────────────────────────────────
const ACCOUNT_ID     = '532c279940b51da44badb2552562afac';
const ACCESS_KEY_ID  = '272bece220c3f820fbf9e3a20814de57';
const SECRET_KEY     = '69a72ef00d651999fe5d1f30ef74a350a5204117af0366d70842793d7239b9b5';
const BUCKET_NAME    = 'natpethunai';
const PUBLIC_DOMAIN  = 'https://pub-5eb58baa7fba49158317c089031c3d49.r2.dev';

const PHOTOS_DIR = join(process.cwd(), 'public', 'photos');
const R2_FOLDER  = 'photos'; // stored as photos/<filename> in R2

const MIME_MAP = {
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.webp': 'image/webp',
  '.gif':  'image/gif',
  '.avif': 'image/avif',
  '.svg':  'image/svg+xml',
};

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_KEY,
  },
});

async function alreadyExists(key) {
  try {
    await r2.send(new HeadObjectCommand({ Bucket: BUCKET_NAME, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function uploadFile(filename) {
  const ext = extname(filename).toLowerCase();
  const mimeType = MIME_MAP[ext];
  if (!mimeType) {
    console.log(`  ⏭  Skipping ${filename} (unsupported type)`);
    return null;
  }

  const objectKey = `${R2_FOLDER}/${filename}`;
  const publicUrl = `${PUBLIC_DOMAIN}/${objectKey}`;

  const exists = await alreadyExists(objectKey);
  if (exists) {
    console.log(`  ✓  Already uploaded: ${filename} → ${publicUrl}`);
    return { filename, objectKey, publicUrl, skipped: true };
  }

  const filePath = join(PHOTOS_DIR, filename);
  const fileBuffer = readFileSync(filePath);
  const sizeKB = (fileBuffer.length / 1024).toFixed(1);

  await r2.send(new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: objectKey,
    Body: fileBuffer,
    ContentType: mimeType,
    CacheControl: 'public, max-age=31536000, immutable',
  }));

  console.log(`  ✅ Uploaded: ${filename} (${sizeKB} KB) → ${publicUrl}`);
  return { filename, objectKey, publicUrl, skipped: false };
}

async function main() {
  console.log('\n🚀 Uploading local photos to Cloudflare R2...\n');

  const files = readdirSync(PHOTOS_DIR).filter(f => {
    const ext = extname(f).toLowerCase();
    return Object.keys(MIME_MAP).includes(ext) && statSync(join(PHOTOS_DIR, f)).isFile();
  });

  if (files.length === 0) {
    console.log('No image files found in public/photos/');
    return;
  }

  const results = [];
  for (const file of files) {
    const result = await uploadFile(file);
    if (result) results.push(result);
  }

  console.log('\n\n── MAPPING: Old path → R2 URL ──────────────────────────────────────────────');
  for (const r of results) {
    console.log(`  /photos/${r.filename}`);
    console.log(`  → ${r.publicUrl}\n`);
  }

  console.log('\n📋 Code replacement map (copy to use in your source files):');
  console.log('─────────────────────────────────────────────────────────────────');
  for (const r of results) {
    console.log(`/photos/${r.filename}  →  ${r.publicUrl}`);
  }
  console.log('\n✨ Done! All photos are now on Cloudflare R2.');
}

main().catch(err => {
  console.error('❌ Upload failed:', err.message);
  process.exit(1);
});
