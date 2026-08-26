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

  // Strip control chars + angle brackets before any of these touch the DB.
  // Prevents stored XSS if log rows are ever rendered in an admin UI, and
  // log-injection via CR/LF when tailing the table in a text viewer.
  const sanitize = (s: string) =>
    s
      .replace(/[\u0000-\u001f\u007f]+/g, ' ') // control chars (CRLF, NUL, etc.)
      .replace(/[<>]/g, '')                  // angle brackets
      .trim();
  const message = sanitize(String(body.message || '')).slice(0, 500);
  const stack = sanitize(String(body.stack || '')).slice(0, 2000);
  const url = sanitize(String(body.url || '')).slice(0, 300);
  const ua = sanitize(String(body.ua || '')).slice(0, 300);
  const kind = sanitize(String(body.kind || 'window.error')).slice(0, 40);
  if (!message && !stack) {
    return res.status(200).json({ ok: true }); // nothing useful, still 200
  }

  // Rate limit: DB-backed per-IP (60 req / 60s). In-memory maps don't work on
  // CF Pages (multi-worker, stateless) — the audit flood test proved it.
  // TOCTOU between count-check and insert is closed by the DB trigger
  // trg_rl_check_before_insert (atomic, raises 23505 past the cap).
  // ponytail: move to CF Rate Limiting binding if scale demands.
  // Identifier MUST be CF-Connecting-IP: X-Forwarded-For is client-controlled
  // (audit N1: spoofing XFF bypassed the limiter entirely).
  const ip = (req.headers['cf-connecting-ip'] as string)?.trim()
    || (req.headers['x-real-ip'] as string)?.trim()
    || 'unknown';
  const minuteAgo = new Date(Date.now() - 60_000).toISOString();
  try {
    const { count } = await getDb()
      .from('rate_limit_log')
      .select('*', { count: 'exact', head: true })
      .eq('identifier', ip)
      .eq('endpoint', 'error-report')
      .gte('created_at', minuteAgo);
    if ((count || 0) >= 60) {
      return res.status(429).json({ ok: false, error: 'Too many error reports' });
    }
    await getDb().from('rate_limit_log').insert({
      identifier: ip,
      endpoint: 'error-report',
      ip_address: ip,
      created_at: new Date().toISOString(),
    });
  } catch (e: any) {
    // The DB trigger (23505 duplicate/limit) firing means the limit was hit
    // concurrently — respond 429, don't fail open. Other DB errors (network,
    // misconfig) fail open: error reporting must never block the app.
    const msg = typeof e?.message === 'string' ? e.message : String(e?.message ?? e);
    if (/23505|duplicate key|rate limit exceeded/i.test(msg)) {
      return res.status(429).json({ ok: false, error: 'Too many error reports' });
    }
    console.error('[error-report] rate limit check failed:', msg);
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
