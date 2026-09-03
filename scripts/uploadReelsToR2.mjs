import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync } from 'fs';
import { join } from 'path';

const ACCOUNT_ID     = '532c279940b51da44badb2552562afac';
const ACCESS_KEY_ID  = '272bece220c3f820fbf9e3a20814de57';
const SECRET_KEY     = '69a72ef00d651999fe5d1f30ef74a350a5204117af0366d70842793d7239b9b5';
const BUCKET_NAME    = 'natpethunai';
const PUBLIC_DOMAIN  = 'https://pub-5eb58baa7fba49158317c089031c3d49.r2.dev';

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_KEY,
  },
});

const files = [
  { name: 'reel-1.mp4', type: 'video/mp4' },
  { name: 'reel-2.mp4', type: 'video/mp4' },
  { name: 'reel-3.webm', type: 'video/webm' },
  { name: 'reel-4.mp4', type: 'video/mp4' },
];

async function main() {
  console.log('Uploading reel videos to Cloudflare R2 cloud storage...');
  for (const f of files) {
    const filePath = join(process.cwd(), 'public', 'videos', f.name);
    const buffer = readFileSync(filePath);
    const key = `reels/${f.name}`;
    console.log(`Uploading ${key} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)...`);
    await r2.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: f.type,
      CacheControl: 'public, max-age=31536000, immutable',
    }));
    console.log(`Uploaded: ${PUBLIC_DOMAIN}/${key}`);
  }
  console.log('All reels successfully uploaded to Cloudflare R2 cloud!');
}

main().catch(console.error);
