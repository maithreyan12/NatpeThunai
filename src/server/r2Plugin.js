import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { loadEnv } from 'vite';

const ALLOWED = new Set(['members', 'memories', 'posts', 'events', 'journey', 'spiral', 'reels']);



/**
 * Vite plugin that serves serverless-style API endpoints:
 * - POST /api/r2/presign          : Generates presigned PUT URLs for media files
 * - POST /api/r2/delete           : Deletes media objects from Cloudflare R2
 * - GET  /api/r2/data?collection= : Reads a JSON data file from R2
 * - POST /api/r2/data             : Writes / mutates a JSON data file in R2
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

        // ── Helper: parse request body ────────────────────────────
        const readBody = () => new Promise((resolve) => {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => { try { resolve(JSON.parse(body || '{}')); } catch { resolve({}); } });
        });

        // ── Helper: build R2 client ───────────────────────────────
        const getClient = () => {
          const accountId       = env.R2_ACCOUNT_ID || process.env.R2_ACCOUNT_ID;
          const accessKeyId     = env.R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID;
          const secretAccessKey = env.R2_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY;
          if (!accountId || !accessKeyId || !secretAccessKey) {
            return { client: null, missing: true };
          }
          return {
            client: new S3Client({
              region: 'auto',
              endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
              credentials: { accessKeyId, secretAccessKey },
            }),
            bucket: env.R2_BUCKET_NAME || process.env.R2_BUCKET_NAME || 'natpethunai',
            publicDomain: (env.R2_PUBLIC_DOMAIN || process.env.R2_PUBLIC_DOMAIN || '').replace(/\/$/, ''),
          };
        };

        const json = (statusCode, data) => {
          res.statusCode = statusCode;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify(data));
        };

        // ── GET /api/r2/data?collection=members ───────────────────
        if (req.method === 'GET' && req.url?.startsWith('/api/r2/data')) {
          const url = new URL(req.url, 'http://localhost');
          const collection = url.searchParams.get('collection');
          if (!collection || !ALLOWED.has(collection)) {
            return json(400, { error: 'Invalid collection' });
          }
          const { client, bucket, missing } = getClient();
          if (missing) return json(503, { error: 'R2 not configured', missingConfig: true });
          try {
            const { GetObjectCommand } = await import('@aws-sdk/client-s3');
            const resp = await client.send(new GetObjectCommand({ Bucket: bucket, Key: `data/${collection}.json` }));
            const body = await resp.Body.transformToString('utf-8');
            return json(200, { data: JSON.parse(body) });
          } catch (err) {
            if (err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) {
              return json(404, { data: null, seeded: false });
            }
            return json(500, { error: err.message });
          }
        }

        // ── POST /api/r2/data  ────────────────────────────────────
        if (req.method === 'POST' && req.url === '/api/r2/data') {
          const body = await readBody();
          const { collection, action, data, item, id } = body;
          if (!collection || !ALLOWED.has(collection)) {
            return json(400, { error: 'Invalid collection' });
          }
          const { client, bucket, missing } = getClient();
          if (missing) return json(503, { error: 'R2 not configured', missingConfig: true });

          const { GetObjectCommand } = await import('@aws-sdk/client-s3');

          const readData = async () => {
            try {
              const resp = await client.send(new GetObjectCommand({ Bucket: bucket, Key: `data/${collection}.json` }));
              return JSON.parse(await resp.Body.transformToString('utf-8'));
            } catch { return null; }
          };

          const writeData = async (payload) => {
            await client.send(new PutObjectCommand({
              Bucket: bucket,
              Key: `data/${collection}.json`,
              Body: JSON.stringify(payload),
              ContentType: 'application/json',
              CacheControl: 'no-cache, no-store, must-revalidate',
            }));
          };

          try {
            if (action === 'seed') {
              const existing = await readData();
              if (existing !== null) return json(200, { message: 'Already seeded', data: existing });
              await writeData(data);
              return json(200, { message: 'Seeded', data });
            }
            if (action === 'set') {
              await writeData(data);
              return json(200, { message: 'Saved', data });
            }
            if (action === 'upsert') {
              const list = (await readData()) || [];
              const arr = Array.isArray(list) ? list : [];
              const idx = arr.findIndex(i => i.id === item.id);
              if (idx >= 0) arr[idx] = { ...arr[idx], ...item };
              else arr.unshift(item);
              await writeData(arr);
              return json(200, { message: 'Upserted', data: arr });
            }
            if (action === 'delete') {
              const list = ((await readData()) || []).filter(i => i.id !== id);
              await writeData(list);
              return json(200, { message: 'Deleted', data: list });
            }
            return json(400, { error: 'Unknown action' });
          } catch (err) {
            return json(500, { error: err.message });
          }
        }

        // ── POST /api/r2/presign ──────────────────────────────────
        if (req.method === 'POST' && req.url === '/api/r2/presign') {
          const { filename, mimeType, sizeBytes, category = 'memories' } = await readBody();
          const { client, bucket, publicDomain, missing } = getClient();
          if (missing) return json(503, { error: 'R2 not configured', missingConfig: true });

          try {
            const datePrefix  = new Date().toISOString().slice(0, 7);
            const uniqueToken = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
            const safeName    = (filename || 'media.bin').replace(/[^a-zA-Z0-9.-]/g, '_');
            const objectKey   = `${category}/${datePrefix}/${uniqueToken}_${safeName}`;

            const command = new PutObjectCommand({
              Bucket: bucket, Key: objectKey,
              ContentType: mimeType || 'application/octet-stream',
              CacheControl: 'public, max-age=31536000, immutable',
            });
            const uploadUrl = await getSignedUrl(client, command, { expiresIn: 600 });
            const publicUrl = publicDomain ? `${publicDomain}/${objectKey}` : uploadUrl.split('?')[0];
            return json(200, { success: true, uploadUrl, publicUrl, objectKey });
          } catch (err) {
            return json(500, { error: err.message });
          }
        }

        // ── POST /api/r2/delete ───────────────────────────────────
        if (req.method === 'POST' && req.url === '/api/r2/delete') {
          const { objectKey } = await readBody();
          const { client, bucket, missing } = getClient();
          if (missing || !objectKey) return json(400, { error: 'Missing config or objectKey' });
          try {
            await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: objectKey }));
            return json(200, { success: true });
          } catch (err) {
            return json(500, { error: err.message });
          }
        }

        next();
      });
    }
  };
}
