import type { ApiRequest, ApiResponse } from '../lib/http-types.js';
import { getDb } from '../lib/api-utils.js';
import { notifyDiscord } from './webhook-notify.js';
import { classifyNoise, isAppFaultKind } from '../lib/error-noise-filter.js';

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

  // === NOISE CLASSIFICATION (see lib/error-noise-filter.ts) ===
  //
  // Third-party scripts blocked by adblockers (Cloudflare Web Analytics beacon,
  // and anything else outside our bundle) fire a window.error + a
  // script-load-error pair on every affected page load. Both used to reach
  // Discord as a red "App Error", which is how a handful of real events looked
  // like a flood. Noise is dropped HERE — before the DB insert and before the
  // notify — so it never lands anywhere.
  //
  // The disambiguator for the locationless `file:?:?` signature is whether this
  // page load ALSO reported that the app never booted. A blocked beacon and a
  // white screen produce identical window.error payloads; only mount-timeout /
  // ErrorBoundary / chunk-load evidence tells them apart.
  //
  // ponytail: 60s window keyed on (ip, url) instead of a real page-load id —
  // the reporters send all their events within milliseconds of each other, so
  // the window only needs to be wider than the burst. Add a session id to the
  // reporter payloads if a future case needs exact grouping.
  let hasRealAppFault = isAppFaultKind(kind);
  if (!hasRealAppFault) {
    try {
      const windowStart = new Date(Date.now() - 60_000).toISOString();
      const { count } = await getDb()
        .from('app_errors')
        .select('*', { count: 'exact', head: true })
        .eq('url', url)
        .gte('created_at', windowStart)
        .in('kind', ['mount-timeout', 'error-boundary', 'unhandledrejection']);
      hasRealAppFault = (count || 0) > 0;
    } catch (e: any) {
      // Fail OPEN: if we cannot tell, treat the report as actionable. Losing a
      // real crash alert is far worse than one extra Discord message.
      hasRealAppFault = true;
      console.error('[error-report] app-fault probe failed:', e?.message);
    }
  }

  const verdict = classifyNoise(kind, message, stack, { hasRealAppFault });
  if (verdict.noise) {
    // 200 + ok: the client's fire-and-forget sender must see success either way.
    return res.status(200).json({ ok: true, filtered: verdict.reason });
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

  // Discord admin notification (fire-and-forget via waitUntil bridge).
  try {
    await notifyDiscord({
      title: '🔴 App Error',
      description: message.slice(0, 300),
      fields: [
        { name: 'Kind', value: kind, inline: true },
        { name: 'URL', value: (url || '-').slice(0, 120), inline: true },
      ],
      color: 'error',
    });
  } catch (e: any) {
    console.error('[error-report] discord notify failed:', e?.message);
  }

  return res.status(200).json({ ok: true });
}
