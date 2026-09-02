// api/r2/delete.js — Vercel Serverless Function
// Deletes an object from Cloudflare R2 by object key

import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { objectKey } = req.body || {};

    if (!objectKey) {
      return res.status(400).json({ error: 'objectKey is required' });
    }

    const accountId       = process.env.R2_ACCOUNT_ID;
    const accessKeyId     = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucketName      = process.env.R2_BUCKET_NAME || 'natpethunai';

    if (!accountId || !accessKeyId || !secretAccessKey) {
      return res.status(503).json({ error: 'R2 not configured', missingConfig: true });
    }

    const r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });

    await r2Client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: objectKey }));

    return res.status(200).json({ success: true, message: `Deleted: ${objectKey}` });
  } catch (err) {
    console.error('[R2 Delete Error]', err);
    return res.status(500).json({ error: err.message });
  }
}
