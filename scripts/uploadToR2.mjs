import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const R2_ACCOUNT_ID = '532c279940b51da44badb2552562afac';
const R2_ACCESS_KEY_ID = '272bece220c3f820fbf9e3a20814de57';
const R2_SECRET_ACCESS_KEY = '69a72ef00d651999fe5d1f30ef74a350a5204117af0366d70842793d7239b9b5';
const R2_BUCKET_NAME = 'natpethunai';

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY
  }
});

const photosDir = path.resolve(__dirname, '../public/photos');

async function uploadAll() {
  console.log('--- Listing existing objects in R2 ---');
  try {
    const listRes = await s3.send(new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      Prefix: 'photos/'
    }));
    const existing = (listRes.Contents || []).map(c => c.Key);
    console.log('Existing in R2:', existing);
  } catch (err) {
    console.warn('Could not list bucket:', err.message);
  }

  const files = fs.readdirSync(photosDir).filter(f => !f.startsWith('.'));
  console.log('\n--- Uploading photos from public/photos ---');

  for (const file of files) {
    const filePath = path.join(photosDir, file);
    const fileBuffer = fs.readFileSync(filePath);
    const key = `photos/${file}`;

    console.log(`Uploading ${file} (${fileBuffer.length} bytes) to ${key}...`);
    try {
      await s3.send(new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: 'image/jpeg',
        CacheControl: 'public, max-age=31536000, immutable'
      }));
      console.log(`✅ Uploaded: ${key}`);
    } catch (err) {
      console.error(`❌ Failed ${key}:`, err.message);
    }
  }
  console.log('\nAll done!');
}

uploadAll();
