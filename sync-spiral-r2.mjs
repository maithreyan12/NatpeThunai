#!/usr/bin/env node
// sync-spiral-r2.mjs
// Seeds or updates all 14 squad members with calibrated face framing in R2 spiral.json

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync } from 'fs';

const envContent = readFileSync('.env', 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const [key, ...rest] = line.split('=');
  if (key && !key.startsWith('#')) env[key.trim()] = rest.join('=').trim();
}

const ACCOUNT_ID = env.R2_ACCOUNT_ID;
const ACCESS_KEY = env.R2_ACCESS_KEY_ID;
const SECRET_KEY = env.R2_SECRET_ACCESS_KEY;
const BUCKET     = env.R2_BUCKET_NAME || 'natpethunai';
const PUBLIC_URL = (env.R2_PUBLIC_DOMAIN || 'https://pub-5eb58baa7fba49158317c089031c3d49.r2.dev').replace(/\/$/, '');

const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
});

const r2Photo = (name) => `${PUBLIC_URL}/photos/${name}`;

const SPIRAL_ITEMS = [
  { id: 'spiral-kafil',      src: r2Photo('kafil.jpg'),      alt: 'Kafil',          title: 'Kafil · Creative Soul',          objectPosition: 'center 18%', positionY: 18, scale: 1, objectFit: 'cover', updatedAt: new Date().toISOString() },
  { id: 'spiral-haniya',     src: r2Photo('hanuu.jpg'),      alt: 'Haniya',         title: 'Haniya · The Chill Sloth',       objectPosition: 'center 20%', positionY: 20, scale: 1, objectFit: 'cover', updatedAt: new Date().toISOString() },
  { id: 'spiral-grace',      src: r2Photo('Gracee.jpg'),     alt: 'Grace',          title: 'Grace · The Spark & Creative',   objectPosition: 'center 16%', positionY: 16, scale: 1, objectFit: 'cover', updatedAt: new Date().toISOString() },
  { id: 'spiral-jaffreen',   src: r2Photo('jaffreen.jpg'),   alt: 'Jaffreen',       title: 'Jaffreen · The Sweet Heart',     objectPosition: 'center 16%', positionY: 16, scale: 1, objectFit: 'cover', updatedAt: new Date().toISOString() },
  { id: 'spiral-farish',     src: r2Photo('farish.jpg'),     alt: 'Farish Sharif',  title: 'Farish · The Mastermind',        objectPosition: 'center 15%', positionY: 15, scale: 1, objectFit: 'cover', updatedAt: new Date().toISOString() },
  { id: 'spiral-divyaaa',    src: r2Photo('Divyaa.jpg'),     alt: 'Divyaaa',        title: 'Divyaaa · The Sunshine',         objectPosition: 'center 22%', positionY: 22, scale: 1.05, objectFit: 'cover', updatedAt: new Date().toISOString() },
  { id: 'spiral-heenuuu',    src: r2Photo('Heenuuu.jpg'),    alt: 'Heenuuu',        title: 'Heenuuu · The Spark & Heart',    objectPosition: 'center 20%', positionY: 20, scale: 1.05, objectFit: 'cover', updatedAt: new Date().toISOString() },
  { id: 'spiral-puppy',      src: r2Photo('Puppy.jpg'),      alt: 'Puppy',          title: 'Puppy · The Chill Vibe',         objectPosition: 'center 28%', positionY: 28, scale: 1, objectFit: 'cover', updatedAt: new Date().toISOString() },
  { id: 'spiral-afnaan',     src: r2Photo('affu.jpg'),       alt: 'Afnaaan',        title: 'Afnaan · The Energy Dynamo',     objectPosition: 'center 22%', positionY: 22, scale: 1, objectFit: 'cover', updatedAt: new Date().toISOString() },
  { id: 'spiral-meshak',     src: r2Photo('meshak.jpg'),     alt: 'Meshak',         title: 'Meshak · The Silent Strength',   objectPosition: '62% 30%',    positionY: 30, scale: 1, objectFit: 'cover', updatedAt: new Date().toISOString() },
  { id: 'spiral-samuel',     src: r2Photo('samuel.jpg'),     alt: 'Samuel',         title: 'Samuel · The Joyful Soul',       objectPosition: 'center 24%', positionY: 24, scale: 1, objectFit: 'cover', updatedAt: new Date().toISOString() },
  { id: 'spiral-harshitha',  src: r2Photo('harshuuu.jpg'),   alt: 'Harshitha',      title: 'Harshitha · Radiant Sunshine',   objectPosition: 'center 24%', positionY: 24, scale: 1, objectFit: 'cover', updatedAt: new Date().toISOString() },
  { id: 'spiral-maithreyan', src: r2Photo('maithreyan.jpg'), alt: 'Maithreyan',     title: 'Maithreyan · Tech & Vibe Pilot', objectPosition: 'center 35%', positionY: 35, scale: 1, objectFit: 'cover', updatedAt: new Date().toISOString() },
  { id: 'spiral-gopika',     src: r2Photo('gopika.jpg'),     alt: 'Gopika',         title: 'Gopika · The Graceful Heart',    objectPosition: 'center 28%', positionY: 28, scale: 1, objectFit: 'cover', updatedAt: new Date().toISOString() },
];

async function main() {
  const key = 'data/spiral.json';
  await R2.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: JSON.stringify(SPIRAL_ITEMS, null, 2),
    ContentType: 'application/json',
    CacheControl: 'no-cache, no-store, must-revalidate',
  }));
  console.log(`✅ Successfully updated ${key} (${SPIRAL_ITEMS.length} items) in R2 bucket!`);
}

main().catch(err => {
  console.error('Update error:', err);
  process.exit(1);
});
