import type { ApiRequest, ApiResponse } from '../lib/http-types.js';
import { getDb } from '../lib/api-utils.js';

// Public fire-and-forget error report endpoint.
// No auth: captures browser crashes from any device. Rate-limited by size + count.
export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', 'https://deutschup.sintec.my.id');
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body: any = {};
  try {
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {});
    body = JSON.parse(raw);
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const message = String(body.message || '').slice(0, 500);
  const stack = String(body.stack || '').slice(0, 2000);
  const url = String(body.url || '').slice(0, 300);
  const ua = String(body.ua || '').slice(0, 300);
  const kind = String(body.kind || 'window.error').slice(0, 40);
  if (!message && !stack) {
    return res.status(200).json({ ok: true }); // nothing useful, still 200
  }

  // Fire-and-forget insert; never fail the response on DB hiccup.
  try {
    await getDb().from('app_errors').insert({
      message,
      stack,
      url,
      ua,
      kind,
      created_at: new Date().toISOString(),
    });
  } catch (e: any) {
    console.error('[error-report] insert failed:', e?.message);
  }

  return res.status(200).json({ ok: true });
}
