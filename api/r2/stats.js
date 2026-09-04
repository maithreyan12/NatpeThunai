// api/r2/stats.js — Vercel Serverless Function
// Live Cloudflare R2 bucket usage, total storage, file counts, and breakdown

import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const accountId       = process.env.R2_ACCOUNT_ID;
    const accessKeyId     = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucketName      = process.env.R2_BUCKET_NAME || 'natpethunai';
    const publicDomain    = (process.env.R2_PUBLIC_DOMAIN || process.env.VITE_R2_PUBLIC_DOMAIN || 'https://pub-5eb58baa7fba49158317c089031c3d49.r2.dev').replace(/\/$/, '');

    if (!accountId || !accessKeyId || !secretAccessKey) {
      return res.status(503).json({ error: 'R2 not configured', missingConfig: true });
    }

    const r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });

    const listResp = await r2Client.send(new ListObjectsV2Command({
      Bucket: bucketName,
      MaxKeys: 1000
    }));

    const rawObjects = listResp.Contents || [];
    const totalObjects = rawObjects.length;
    const totalBytes = rawObjects.reduce((acc, o) => acc + (o.Size || 0), 0);

    const R2_FREE_TIER_BYTES = 10 * 1024 * 1024 * 1024; // 10 GB
    const percentUsed = Math.min(100, parseFloat(((totalBytes / R2_FREE_TIER_BYTES) * 100).toFixed(3)));

    const categories = {
      photos:   { count: 0, bytes: 0, formatted: '0 B' },
      memories: { count: 0, bytes: 0, formatted: '0 B' },
      members:  { count: 0, bytes: 0, formatted: '0 B' },
      data:     { count: 0, bytes: 0, formatted: '0 B' },
      other:    { count: 0, bytes: 0, formatted: '0 B' }
    };

    const objects = rawObjects
      .map(obj => {
        const key = obj.Key || '';
        const size = obj.Size || 0;
        const prefix = key.split('/')[0] || 'other';

        if (categories[prefix]) {
          categories[prefix].count += 1;
          categories[prefix].bytes += size;
        } else {
          categories.other.count += 1;
          categories.other.bytes += size;
        }

        return {
          key,
          size,
          sizeFormatted: formatBytes(size),
          lastModified: obj.LastModified ? obj.LastModified.toISOString() : null,
          url: `${publicDomain}/${key}`,
          category: categories[prefix] ? prefix : 'other'
        };
      })
      .sort((a, b) => new Date(b.lastModified || 0) - new Date(a.lastModified || 0));

    Object.keys(categories).forEach(cat => {
      categories[cat].formatted = formatBytes(categories[cat].bytes);
    });

    return res.status(200).json({
      success: true,
      bucket: bucketName,
      publicDomain,
      totalObjects,
      totalBytes,
      totalFormatted: formatBytes(totalBytes),
      totalMB: parseFloat((totalBytes / (1024 * 1024)).toFixed(2)),
      totalGB: parseFloat((totalBytes / (1024 * 1024 * 1024)).toFixed(4)),
      freeTierLimit: '10 GB',
      freeTierBytes: R2_FREE_TIER_BYTES,
      remainingBytes: Math.max(0, R2_FREE_TIER_BYTES - totalBytes),
      remainingFormatted: formatBytes(Math.max(0, R2_FREE_TIER_BYTES - totalBytes)),
      percentUsed,
      categories,
      objects,
      fetchedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('[R2 Stats Error]', err);
    return res.status(500).json({ error: err.message });
  }
}
