// api/r2/presign.js — Vercel Serverless Function
// Generates a presigned PUT URL for direct browser → Cloudflare R2 upload

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { filename, mimeType, sizeBytes, category = 'members' } = req.body || {};

    const accountId       = process.env.R2_ACCOUNT_ID;
    const accessKeyId     = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucketName      = process.env.R2_BUCKET_NAME || 'natpethunai';
    const publicDomain    = (process.env.R2_PUBLIC_DOMAIN || '').replace(/\/$/, '');

    if (!accountId || !accessKeyId || !secretAccessKey) {
      return res.status(503).json({
        error: 'Cloudflare R2 is not configured on this server.',
        missingConfig: true
      });
    }

    const r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });

    const datePrefix  = new Date().toISOString().slice(0, 7);
    const uniqueToken = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const safeName    = (filename || 'photo.jpg').replace(/[^a-zA-Z0-9._-]/g, '_');
    const objectKey   = `${category}/${datePrefix}/${uniqueToken}_${safeName}`;
    const contentType = mimeType || (filename?.match(/\.(mp4|webm|mov)$/i) ? 'video/mp4' : 'image/jpeg');

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    });

    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 600 });
    const publicUrl = publicDomain
      ? `${publicDomain}/${objectKey}`
      : uploadUrl.split('?')[0];

    return res.status(200).json({
      success: true,
      uploadUrl,
      publicUrl,
      objectKey,
      fileType: contentType.startsWith('video/') ? 'video' : 'image',
    });
  } catch (err) {
    console.error('[R2 Presign Error]', err);
    return res.status(500).json({ error: err.message });
  }
}
