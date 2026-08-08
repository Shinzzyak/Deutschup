// SumoPod provider — managed payment gateway (LIVE).
//
// Endpoints (verified live 2026-08-08 against the SumoPod dashboard docs):
//   POST https://api-pay.sumopod.com/api/v1/payments   (X-Api-Key)  -> create payment link
//     201 -> { payment_id, order_id, amount, fee, net_amount, payment_link_url, status, expires_at }
//     min amount Rp 10.000 (error: {"error":"minimum payment amount is Rp 10.000","code":"INVALID_INPUT"})
//   Webhook events (POST to configured URL): payment.completed / payment.failed / payment.expired
//     payload: { event_type, data: { payment_id, order_id, amount, status, payment_method, completed_at } }
//     auth: X-Webhook-Token header (our secret, sent by SumoPod's server) and/or Svix
//     HMAC signature headers (svix-id, svix-timestamp, svix-signature).
//
// SECURITY MODEL — deviation from the "status must come from a separate
// verifyCharge() call" rule in ./types.ts, made deliberately:
//   * SumoPod exposes NO public status-GET endpoint (verified: /api/v1/payments/{id}
//     and variants all 404). The webhook IS the only server-to-server channel.
//   * The webhook arrives over an authenticated channel carrying OUR secret
//     (X-Webhook-Token, constant-time compared). That satisfies the same
//     property the rule exists to enforce: a forged body cannot fabricate a
//     payment, because the forger does not know the token.
//   * parseWebhook() therefore records the (authenticated) status into a short-
//     lived cache, and verifyCharge() reads it back. The caller's
//     "verify before fulfil" flow is preserved unchanged.
//   ponytail: switch verifyCharge() to a real GET-status call the day SumoPod
//   ships one. Until then the token is the authenticity proof.

import type {
  CreateChargeInput,
  CreateChargeResult,
  ParsedWebhook,
  PaymentProvider,
  PaymentStatus,
  VerifyChargeResult,
  WebhookMetadata,
  WebhookRequest,
} from './types.js';
import { PaymentProviderError, asRecord } from './types.js';

const SUMOPOD_BASE_URL = 'https://api-pay.sumopod.com';
const DEFAULT_METHOD = 'QRIS';

function debugEnabled(): boolean {
  return process.env.DEBUG_PAYMENTS === 'true';
}

function getSecret(key: 'SUMOPOD_API_KEY' | 'SUMOPOD_WEBHOOK_TOKEN'): string {
  const v = process.env[key] || '';
  if (!v) {
    console.error(`[payment/sumopod] CRITICAL: ${key} not set`);
    throw new PaymentProviderError('misconfigured', 'Payment gateway misconfigured');
  }
  return v;
}

/** Constant-time compare, never === (avoids timing side-channels on secrets). */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Map SumoPod webhook status words onto ours. Anything unknown stays pending. */
function mapStatus(raw: unknown): PaymentStatus {
  if (raw === 'completed' || raw === 'paid' || raw === 'success') return 'paid';
  if (raw === 'failed' || raw === 'cancelled' || raw === 'canceled') return 'failed';
  if (raw === 'expired') return 'expired';
  return 'pending';
}

/** Header value, normalised from string | string[] | undefined. */
function first(v: string | string[] | undefined): string | undefined {
  return typeof v === 'string' ? v : Array.isArray(v) ? v[0] : undefined;
}

/** Webhook-verified statuses, keyed by payment_id. 10-minute TTL. */
const CACHE_TTL_MS = 10 * 60 * 1000;
const statusCache = new Map<
  string,
  { status: PaymentStatus; amount?: number; paidAt?: string; reference?: string; rawStatus?: string; at: number }
>();

function cacheGet(paymentId: string) {
  const e = statusCache.get(paymentId);
  if (!e) return undefined;
  if (Date.now() - e.at > CACHE_TTL_MS) {
    statusCache.delete(paymentId);
    return undefined;
  }
  return e;
}

export const sumoPodProvider: PaymentProvider = {
  id: 'sumopod',

  async createCharge(input: CreateChargeInput): Promise<CreateChargeResult> {
    const apiKey = getSecret('SUMOPOD_API_KEY');
    const DEBUG = debugEnabled();

    // order_id is what our order row is keyed on at the gateway: unique and
    // unguessable (never sequential).
    const orderId = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
    const payload = {
      order_id: orderId,
      amount: input.amount,
      currency: 'IDR',
      expires_in_hours: 24,
      success_return_url: input.redirectUrl,
      cancel_return_url: input.redirectUrl,
      payment_method_type_code: input.paymentMethod || DEFAULT_METHOD,
    };

    const res = await fetch(`${SUMOPOD_BASE_URL}/api/v1/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': apiKey },
      body: JSON.stringify(payload),
    });
    if (DEBUG) console.log('[payment/sumopod/create] gateway status:', res.status);

    const raw = await res.text();
    let data: any;
    try {
      data = JSON.parse(raw);
    } catch {
      console.error('[payment/sumopod/create] Non-JSON gateway response:', {
        status: res.status,
        preview: raw.slice(0, 200),
      });
      throw new PaymentProviderError('unavailable', 'Payment gateway unavailable');
    }
    if (DEBUG) console.log('[payment/sumopod/create] response keys:', Object.keys(data));

    if (data.payment_id && data.payment_link_url) {
      return {
        providerRef: data.payment_id,
        payUrl: data.payment_link_url,
        expiresAt: data.expires_at,
        amount: input.amount,
        paymentMethod: String(data.payment_channel_used || input.paymentMethod || DEFAULT_METHOD).toLowerCase(),
      };
    }

    // 4xx with a JSON error body (e.g. INVALID_INPUT) = gateway understood us
    // and refused. 5xx / garbage = their fault.
    if (res.status >= 400 && res.status < 500) {
      console.error('[payment/sumopod/create] Gateway rejected:', JSON.stringify(data));
      throw new PaymentProviderError('rejected', 'Payment gateway error');
    }
    console.error('[payment/sumopod/create] Unexpected response:', JSON.stringify(data).slice(0, 400));
    throw new PaymentProviderError('unavailable', 'Payment gateway unavailable');
  },

  async verifyCharge(providerRef: string): Promise<VerifyChargeResult> {
    // Status recorded by parseWebhook() from the token-authenticated webhook
    // (the only server-to-server channel SumoPod exposes — see header note).
    const cached = cacheGet(providerRef);
    if (cached) {
      return {
        status: cached.status,
        amount: cached.amount,
        paidAt: cached.paidAt,
        reference: cached.reference,
        rawStatus: cached.rawStatus,
      };
    }
    // Unknown / expired reference: fail closed, never 'paid'.
    return { status: 'pending' };
  },

  parseWebhook(req: WebhookRequest): ParsedWebhook | null {
    const body = asRecord(req.body);
    if (!body) return null;

    // Authenticate the channel: X-Webhook-Token is OUR secret, sent by
    // SumoPod's server on every webhook (their docs: "direct comparison, no
    // signature computation needed"). Constant-time compare.
    let expectedToken: string;
    try {
      expectedToken = getSecret('SUMOPOD_WEBHOOK_TOKEN');
    } catch {
      return null; // misconfigured env -> ignore rather than crash the handler
    }
    const receivedToken = first(req.headers['x-webhook-token']);
    if (!receivedToken || !constantTimeEqual(expectedToken, receivedToken)) {
      console.warn('[payment/sumopod/callback] Invalid webhook token, ignoring');
      return null;
    }

    const data = asRecord(body.data) || body;
    const paymentId = data.payment_id ?? body.payment_id;
    if (typeof paymentId !== 'string' || !paymentId) return null;

    // Record the (now authenticated) status for verifyCharge().
    statusCache.set(paymentId, {
      status: mapStatus(data.status ?? body.status),
      amount: typeof data.amount === 'number' ? data.amount : undefined,
      paidAt: typeof data.completed_at === 'string' ? data.completed_at : undefined,
      reference: typeof data.reference === 'string' ? data.reference : undefined,
      rawStatus: typeof data.status === 'string' ? data.status : undefined,
      at: Date.now(),
    });

    // ONLY the id leaves here. Status flows via the cache, not the return.
    return { providerRef: paymentId };
  },

  readWebhookMetadata(req: WebhookRequest): WebhookMetadata {
    const body = asRecord(req.body) || {};
    const data = asRecord(body.data) || body;
    const str = (v: unknown) => (typeof v === 'string' && v ? v : undefined);
    return {
      paidAt: str(data.completed_at),
      paymentMethod: str(data.payment_method),
      reference: str(data.reference),
    };
  },
};
