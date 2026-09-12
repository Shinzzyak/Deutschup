// SumoPod callback fan-out for the delivery bot.
//
// A SumoPod merchant project has exactly ONE webhook_url, and this account's
// belongs to Deutschup. The delivery bot charges through the same merchant
// account, so its callbacks arrive here too and are currently dropped as an
// unknown order. These helpers recognise the bot's callbacks and mirror them
// onward.
//
// Kept in its own module, away from the route table, so the routing decision can
// be unit-tested without constructing a Pages runtime.

/** Order ids the delivery bot generates. See pelerproxy/services/fulfillment.py. */
export const BOT_ORDER_PREFIX = 'VRB-';

/**
 * Where the bot's listener lives.
 *
 * MUST be a hostname, never an IP literal: Cloudflare Workers refuse subrequests
 * to bare IPs with `error code: 1003` (Direct IP Access Not Allowed), so
 * `http://150.109.12.245/...` fails inside the Worker even though it answers
 * fine from a normal client. Verified: the literal returned 403/1003 while the
 * same host over a hostname returned 200.
 *
 * `bot.sintec.my.id` is a DNS-only (grey cloud) A record pointing straight at the
 * VPS, with Caddy terminating TLS using a Let's Encrypt cert. Do NOT flip that
 * record to proxied: Cloudflare's edge would then sit between the relay and the
 * bot, and the Worker would be calling an origin by IP.
 *
 * Override with BOT_CALLBACK_URL (Pages env) if the host ever moves.
 */
export function botCallbackUrl(env?: Record<string, unknown> | null): string {
  const override = env && env.BOT_CALLBACK_URL;
  return typeof override === 'string' && override
    ? override
    : 'https://bot.sintec.my.id/sumopod/callback';
}

/**
 * True when a webhook body belongs to the delivery bot.
 *
 * Reads the parsed `order_id` field — never a substring of the raw text — so a
 * Deutschup payment whose description merely quotes the prefix cannot be
 * hijacked by the relay. Anything unparseable is not a bot order.
 */
export function isBotOrder(raw: string): boolean {
  try {
    const parsed = JSON.parse(raw);
    const data =
      parsed && typeof parsed.data === 'object' && parsed.data ? parsed.data : parsed;
    const oid = data && (data.order_id ?? data.orderId);
    return typeof oid === 'string' && oid.startsWith(BOT_ORDER_PREFIX);
  } catch {
    return false;
  }
}

/**
 * Headers the bot's listener authenticates on. Everything else is dropped: this
 * is a relay for one known endpoint, not a general-purpose proxy.
 */
const FORWARD_HEADERS = [
  'x-webhook-token',
  'content-type',
  'x-webhook-signature',
  'svix-id',
  'svix-timestamp',
  'svix-signature',
];

/**
 * The SumoPod project's stored webhook URL posts to `/api/payment/callback`,
 * but the payment handler dispatches on the `?action=` query. That mismatch is
 * why every gateway delivery has been answered 404 "Payment endpoint not found"
 * and no Deutschup payment ever settled from a callback.
 *
 * Return the equivalent URL that reaches the real handler, or null when the
 * request already carries an action and needs no help.
 */
export function callbackAliasUrl(requestUrl: string, parts: string[]): string | null {
  if ((parts[1] || '').toLowerCase() !== 'callback') return null;
  const url = new URL(requestUrl);
  if (url.searchParams.has('action')) return null;
  url.searchParams.set('action', 'callback');
  return url.toString();
}

/**
 * POST the callback to the bot and answer the gateway.
 *
 * Always returns 200. This endpoint's delivery record is shared with
 * Deutschup's own payments, so a bot-side failure must not surface as a webhook
 * error here. The bot is idempotent, and the dashboard's webhook log can resend.
 */
export async function mirrorToBot(
  raw: string,
  request: Request,
  env?: Record<string, unknown> | null,
): Promise<Response> {
  const headers = new Headers();
  for (const h of FORWARD_HEADERS) {
    const v = request.headers.get(h);
    if (v) headers.set(h, v);
  }

  let botStatus = 0;
  let error = '';
  let botBody = '';
  try {
    const r = await fetch(botCallbackUrl(env), { method: 'POST', headers, body: raw });
    botStatus = r.status;
    if (botStatus !== 200) {
      botBody = (await r.text()).slice(0, 200);
      console.error('[sumopod-relay] bot rejected callback', botStatus, botBody);
    }
  } catch (e: any) {
    error = e?.message || 'bot unreachable';
    console.error('[sumopod-relay] bot unreachable', error);
  }

  // A non-200 from the bot is the interesting case: the gateway always gets a
  // 200 from us, so without echoing the upstream status a broken hop looks like
  // a silent success from the dashboard. Body is echoed only on failure, and
  // truncated — it is the bot's own JSON, never a credential.
  return new Response(
    JSON.stringify({
      ok: true,
      relayed: true,
      bot_status: botStatus,
      ...(error ? { error } : {}),
      ...(botBody ? { bot_body: botBody } : {}),
    }),
    { status: 200, headers: { 'content-type': 'application/json' } },
  );
}
