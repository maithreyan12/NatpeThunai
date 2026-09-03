// api/r2/data.js  – Vercel Serverless Function
// Handles GET/POST/DELETE for JSON data files stored in Cloudflare R2
// Collections: members | memories | posts | events
// Each stored as:  data/{collection}.json  in the R2 bucket

import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

function getR2Client() {
  const accountId       = process.env.R2_ACCOUNT_ID;
  const accessKeyId     = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('R2 credentials not configured in environment variables.');
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

const ALLOWED = new Set(['members', 'memories', 'posts', 'events', 'journey', 'spiral', 'reels']);
const BUCKET = process.env.R2_BUCKET_NAME || 'natpethunai';




// Read a JSON file from R2
async function readData(client, collection) {
  try {
    const resp = await client.send(new GetObjectCommand({
      Bucket: BUCKET,
      Key: `data/${collection}.json`,
    }));
    const body = await resp.Body.transformToString('utf-8');
    return JSON.parse(body);
  } catch (err) {
    if (err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) {
      return null; // Not yet seeded
    }
    throw err;
  }
}

// Write a JSON file to R2
async function writeData(client, collection, data) {
  await client.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: `data/${collection}.json`,
    Body: JSON.stringify(data),
    ContentType: 'application/json',
    CacheControl: 'no-cache, no-store, must-revalidate',
  }));
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const client = getR2Client();

    // ── GET: read collection ─────────────────────────────────────────
    if (req.method === 'GET') {
      const collection = req.query?.collection;
      if (!collection || !ALLOWED.has(collection)) {
        return res.status(400).json({ error: `Invalid collection. Must be one of: ${[...ALLOWED].join(', ')}` });
      }
      const data = await readData(client, collection);
      if (data === null) {
        return res.status(404).json({ data: null, seeded: false });
      }
      return res.status(200).json({ data });
    }

    // ── POST: write/update full collection or append one item ────────
    if (req.method === 'POST') {
      const body = req.body || {};
      const { collection, action, data, item, id } = body;

      if (!collection || !ALLOWED.has(collection)) {
        return res.status(400).json({ error: `Invalid collection. Must be one of: ${[...ALLOWED].join(', ')}` });
      }

      if (action === 'seed') {
        const existing = await readData(client, collection);
        if (existing !== null) {
          return res.status(200).json({ message: 'Already seeded', data: existing });
        }
        await writeData(client, collection, data);
        return res.status(200).json({ message: 'Seeded successfully', data });
      }

      if (action === 'set') {
        await writeData(client, collection, data);
        return res.status(200).json({ message: 'Collection saved', data });
      }

      if (action === 'upsert') {
        const existing = await readData(client, collection) || [];
        const list = Array.isArray(existing) ? existing : [];
        const idx = list.findIndex(i => i.id === item.id);
        if (idx >= 0) {
          list[idx] = { ...list[idx], ...item };
        } else {
          list.unshift(item);
        }
        await writeData(client, collection, list);
        return res.status(200).json({ message: 'Upserted', data: list });
      }

      if (action === 'delete') {
        const existing = await readData(client, collection) || [];
        const list = (Array.isArray(existing) ? existing : []).filter(i => i.id !== id);
        await writeData(client, collection, list);
        return res.status(200).json({ message: 'Deleted', data: list });
      }

      return res.status(400).json({ error: 'Unknown action. Use: seed | set | upsert | delete' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[R2 Data API Error]', err);
    return res.status(500).json({ error: err.message });
  }
}
