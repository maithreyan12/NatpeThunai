import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { loadEnv } from 'vite';

/**
 * Vite plugin that serves serverless-style API endpoints:
 * - POST /api/r2/presign : Generates presigned PUT URLs for Cloudflare R2
 * - POST /api/r2/delete  : Deletes objects from Cloudflare R2
 */
export function r2DevServerPlugin() {
  let env = {};

  return {
    name: 'vite-plugin-r2-handler',
    configResolved(config) {
      env = loadEnv(config.mode, process.cwd(), '');
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.method === 'POST' && req.url === '/api/r2/presign') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const { filename, mimeType, sizeBytes, category = 'memories' } = JSON.parse(body || '{}');

              const accountId = env.R2_ACCOUNT_ID || process.env.R2_ACCOUNT_ID;
              const accessKeyId = env.R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID;
              const secretAccessKey = env.R2_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY;
              const bucketName = env.R2_BUCKET_NAME || process.env.R2_BUCKET_NAME || 'natpethunai-media';
              const publicDomain = (env.R2_PUBLIC_DOMAIN || process.env.R2_PUBLIC_DOMAIN || '').replace(/\/$/, '');

              if (!accountId || !accessKeyId || !secretAccessKey) {
                res.statusCode = 503;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({
                  error: 'Cloudflare R2 is not configured in .env.local.',
                  missingConfig: true
                }));
              }

              const r2Client = new S3Client({
                region: 'auto',
                endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
                credentials: {
                  accessKeyId,
                  secretAccessKey,
                },
              });

              const datePrefix = new Date().toISOString().slice(0, 7); // '2026-08'
              const uniqueToken = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
              const safeName = (filename || 'media.bin').replace(/[^a-zA-Z0-9.-]/g, '_');
              const objectKey = `${category}/${datePrefix}/${uniqueToken}_${safeName}`;

              const command = new PutObjectCommand({
                Bucket: bucketName,
                Key: objectKey,
                ContentType: mimeType || 'application/octet-stream',
                CacheControl: 'public, max-age=31536000, immutable',
              });

              // 10 minutes expiry
              const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 600 });
              const publicUrl = publicDomain ? `${publicDomain}/${objectKey}` : uploadUrl.split('?')[0];

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: true,
                uploadUrl,
                publicUrl,
                objectKey,
                fileType: (mimeType || '').startsWith('video/') ? 'video' : 'image',
              }));
            } catch (err) {
              console.error('[R2 Presign Error]:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        if (req.method === 'POST' && req.url === '/api/r2/delete') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const { objectKey } = JSON.parse(body || '{}');

              const accountId = env.R2_ACCOUNT_ID || process.env.R2_ACCOUNT_ID;
              const accessKeyId = env.R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID;
              const secretAccessKey = env.R2_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY;
              const bucketName = env.R2_BUCKET_NAME || process.env.R2_BUCKET_NAME || 'natpethunai-media';

              if (!accountId || !accessKeyId || !secretAccessKey || !objectKey) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ error: 'Missing configuration or objectKey.' }));
              }

              const r2Client = new S3Client({
                region: 'auto',
                endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
                credentials: {
                  accessKeyId,
                  secretAccessKey,
                },
              });

              await r2Client.send(new DeleteObjectCommand({
                Bucket: bucketName,
                Key: objectKey,
              }));

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: 'Deleted from R2' }));
            } catch (err) {
              console.error('[R2 Delete Error]:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}
