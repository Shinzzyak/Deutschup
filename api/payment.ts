import type { ApiRequest, ApiResponse } from '../lib/http-types.js';
import { getDb, getVerifiedIdentity } from '../lib/api-utils.js';
import { notifyDiscord } from './webhook-notify.js';
import {
  getPaymentProvider,
  isPaymentProviderError,
  readWebhookMetadata,
  readWebhookRef,
} from '../lib/payments/index.js';
import type {
  CreateChargeResult,
  PaymentProvider,
  VerifyChargeResult,
  WebhookRequest,
} from '../lib/payments/index.js';

// This handler is gateway-agnostic. Every vendor detail — endpoint, payload
// shape, response field names, credentials — lives behind the PaymentProvider
// interface in lib/payments/. Switching gateways touches that folder and the
// PAYMENT_PROVIDER env var, never this file. See docs/PAYMENT.md.
//
// The security model, unchanged and non-negotiable:
//   1. Identity comes from a verified Bearer token, never from the body.
//   2. The price comes from constants below, never from the body.
//   3. A callback body may only supply an id. The status is fetched from the
//      gateway by provider.verifyCharge(), server to server.
//   4. Fulfilment is idempotent: an order already 'paid' is never processed
//      twice, and the verified amount must match the stored amount.
//
// Callbacks may carry malformed JSON or a wrong content-type, so this endpoint
// parses the body itself (readJsonBody) instead of trusting the runtime parser.

// Simple in-memory rate limiter (per-IP, resets on cold start)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string, maxRequests = 20, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count++;
  return entry.count <= maxRequests;
}

export function getWebhookPayload(body: unknown): Record<string, unknown> | null {
  return body && typeof body === 'object' && !Array.isArray(body)
    ? body as Record<string, unknown>
    : null;
}

interface ReadBodyResult {
  /** Parsed JSON, or null when absent/unparseable. */
  parsed: unknown;
  /**
   * Byte-exact body when the runtime exposed it. Needed by any future provider
   * that verifies an HMAC signature — see WebhookRequest.rawBody.
   */
  raw?: string;
}

async function readJsonBody(req: ApiRequest): Promise<ReadBodyResult> {
  // A runtime that pre-parsed the body may also hand us the original text.
  const maybeRaw = (req as any).rawBody;
  const preRaw = typeof maybeRaw === 'string' ? maybeRaw : undefined;
  if (req.body !== undefined) {
    return {
      parsed: req.body,
      raw: preRaw ?? (typeof req.body === 'string' ? req.body : undefined),
    };
  }
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 64 * 1024) throw new Error('Request body too large');
    chunks.push(Buffer.from(chunk));
  }
  const text = Buffer.concat(chunks).toString('utf8').trim();
  if (!text) return { parsed: null, raw: text };
  try { return { parsed: JSON.parse(text), raw: text }; } catch { return { parsed: null, raw: text }; }
}

/**
 * Plans the server is willing to sell. The browser sends planType, so it is
 * input: anything unrecognised falls back to 'pro' rather than being written
 * verbatim into orders.plan_type and later into profiles.tier.
 */
const SELLABLE_PLANS = new Set(['pro']);

function normalizePlanType(value: unknown): string {
  return typeof value === 'string' && SELLABLE_PLANS.has(value) ? value : 'pro';
}

function normalizeText(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', 'https://deutschup.sintec.my.id');
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  const action = req.query.action;

  try {
    const bodyResult: ReadBodyResult = req.method === 'POST'
      ? await readJsonBody(req)
      : { parsed: undefined };
    // === action=create (POST, auth required) ===
    if (action === 'create') {
      if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

      // H3 FIX: Never trust userId/email from body — extract from verified identity.
      const identity = await getVerifiedIdentity(req);
      const userId = identity?.internalId;
      const email = identity?.email;
      if (!userId) return res.status(401).json({ error: 'Unauthorized — token required' });

      // Rate limit on create (M2 fix)
      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown';
      if (!checkRateLimit(clientIp, 5, 60000)) {
        return res.status(429).json({ error: 'Too many requests' });
      }

      const APP_URL = process.env.APP_URL || process.env.VITE_APP_URL || 'https://deutschup.sintec.my.id';

      const createBody: Record<string, unknown> = getWebhookPayload(bodyResult.parsed) || {};
      const planType = normalizePlanType(createBody.planType);
      const name = normalizeText(createBody.name);

      // WARNING: TEST_PAYMENT_MODE is wired into the PRODUCTION deploy workflow
      // (.github/workflows/cf-pages-deploy.yml re-applies it as a secret, and
      // defaults it to 'true' when the GitHub secret is unset). While it is
      // 'true' the Pro plan sells for Rp1.000 instead of Rp49.000 in production.
      const isTestMode = process.env.TEST_PAYMENT_MODE === 'true';
      const DEBUG = process.env.DEBUG_PAYMENTS === 'true';
      if (DEBUG) console.log('[payment/create] started, test mode:', isTestMode);
      // NOTE: Do not log API key length, full payloads, or raw gateway responses in production.
      const TEST_PRICE = 1000;
      const PROD_PRICE = 49000;
      const price = isTestMode ? TEST_PRICE : PROD_PRICE;
      if (DEBUG) console.log('[payment/create] price:', price);

      const callbackUrl = `${APP_URL}/api/payment?action=callback`;
      const redirectUrl = `${APP_URL}/dashboard?payment=success`;

      if (DEBUG) console.log('[payment/create] callback_url:', callbackUrl);

      let charge: CreateChargeResult;
      try {
        const provider = getPaymentProvider();
        charge = await provider.createCharge({
          amount: price,
          planType,
          description: `DeutschUp ${planType.toUpperCase()} Subscription`,
          customerName: name || 'Student',
          customerEmail: email || 'student@example.com',
          callbackUrl,
          redirectUrl,
        });
      } catch (err) {
        // Same HTTP contract the Bayar.gg-specific code always returned.
        if (isPaymentProviderError(err)) {
          if (err.kind === 'rejected') {
            return res.status(400).json({ error: 'Payment gateway error' });
          }
          if (err.kind === 'unavailable') {
            return res.status(502).json({ error: 'Payment gateway unavailable' });
          }
          if (err.kind === 'misconfigured') {
            return res.status(500).json({ error: 'Payment gateway misconfigured' });
          }
        }
        throw err; // network failures keep falling through to the outer catch
      }

      const { error } = await getDb()
        .from('orders')
        .insert({
          id: charge.providerRef,
          user_id: userId,
          plan_type: planType,
          status: 'pending',
          amount: charge.amount,
          payment_method: charge.paymentMethod || 'qris',
          created_at: new Date().toISOString(),
        });

      if (error) {
        // The charge now exists at the gateway but not locally. The reconciliation
        // routine in docs/PAYMENT.md §4 is what catches this case.
        console.error('[payment/create] DB insert error:', error);
        return res.status(500).json({ error: 'Failed to save order', details: error.message });
      }

      return res.json({
        url: charge.payUrl,
        // `invoice_id` is the public response field the client already reads.
        // Kept under that name regardless of provider — renaming it would break
        // src/pages/Pricing.tsx for no benefit.
        invoice_id: charge.providerRef,
        amount: charge.amount,
        expires_at: charge.expiresAt,
        // Only present for providers without a hosted checkout page (static
        // QRIS + manual confirmation). Absent for redirect flows, so the
        // response shape is unchanged for Bayar.gg.
        ...(charge.display ? { payment: { ...charge.display, qr_string: charge.qrString } } : {}),
      });
    }

    // === action=callback (POST — called by the payment gateway) ===
    if (action === 'callback') {
      if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

      // Rate limit check
      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown';
      if (!checkRateLimit(clientIp, 20, 60000)) {
        console.warn('[payment/callback] Rate limit exceeded for IP:', clientIp);
        return res.status(429).json({ error: 'Too many requests' });
      }

      // The callback body is a claim, not proof. Bayar.gg does not even sign it
      // ("Body callback tidak ditandatangani" per their docs), and a signature
      // would not change the rule anyway:
      //
      //   read the id from the body  ->  ask the gateway what really happened
      //
      // Nothing below branches on a status that came from the request.

      const webhookPayload = getWebhookPayload(bodyResult.parsed);
      if (!webhookPayload) {
        return res.status(400).json({ error: 'Invalid webhook payload' });
      }

      let provider: PaymentProvider;
      try {
        provider = getPaymentProvider();
      } catch {
        return res.status(500).json({ error: 'Payment gateway misconfigured' });
      }

      const webhookReq: WebhookRequest = {
        headers: req.headers,
        body: webhookPayload,
        rawBody: bodyResult.raw,
      };

      // readWebhookRef returns the reference id and nothing else — by
      // construction, not by convention. See lib/payments/index.ts.
      const providerRef = readWebhookRef(provider, webhookReq);
      if (!providerRef) {
        return res.status(200).json({ success: true, message: 'Ignored' });
      }

      // Local guard first: only verify invoices we created. This prevents fake
      // callbacks from turning this endpoint into an outbound gateway probe.
      const { data: localOrder, error: orderLookupError } = await getDb()
        .from('orders')
        .select('*')
        .eq('id', providerRef)
        .maybeSingle();

      if (orderLookupError) {
        console.error('[payment/callback] Order lookup error:', orderLookupError);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (!localOrder) {
        console.warn('[payment/callback] Unknown order reference, ignoring:', providerRef.slice(0, 24));
        return res.status(202).json({ success: true, message: 'Not paid yet' });
      }

      if (localOrder.status === 'paid') {
        console.log('[payment/callback] Already paid, idempotent skip:', providerRef);
        return res.json({ success: true, message: 'Already processed' });
      }

      // Verify payment status via the gateway's own API (never trust body status)
      let verification: VerifyChargeResult;
      try {
        verification = await provider.verifyCharge(providerRef);
      } catch (err) {
        if (isPaymentProviderError(err)) {
          if (err.kind === 'misconfigured') {
            return res.status(500).json({ error: 'Payment gateway misconfigured' });
          }
          if (err.kind === 'unreachable' || err.kind === 'unavailable') {
            return res.status(502).json({ error: 'Failed to verify payment with gateway' });
          }
        }
        throw err;
      }

      if (verification.status !== 'paid') {
        console.log('[payment/callback] Payment not confirmed by API, status:', verification.rawStatus);
        return res.status(202).json({ success: true, message: 'Not paid yet' });
      }

      // API confirmed paid — safe to process
      {
        const order = localOrder;

        // Cosmetic bookkeeping only (settlement time, channel, acquirer ref).
        // Never an input to any decision below.
        const metadata = readWebhookMetadata(provider, webhookReq);

        // Verify the amount the gateway says was paid against the amount we
        // stored when the order was created — never against anything in the
        // request. undefined means the gateway did not report it.
        const verifiedAmount = verification.amount;
        if (verifiedAmount !== undefined && Number(verifiedAmount) !== Number(order.amount)) {
          console.error('[payment/callback] Amount mismatch: order=', order.amount, 'gateway=', verifiedAmount);
          return res.status(400).json({ error: 'Amount verification failed' });
        }

        const now = new Date();
        const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

        // Update profile with subscription + legacy tier fields
        const { error: profileError } = await getDb()
          .from('profiles')
          .update({
            tier: order.plan_type,
            tier_expiry: expiry,
            subscription: order.plan_type,
            pro_expires_at: expiry,
          })
          .eq('id', order.user_id);

        if (profileError) {
          console.error('[payment/callback] Profile update error:', profileError);
          return res.status(500).json({ error: 'Failed to update profile' });
        }

        const { error: updateOrderError } = await getDb()
          .from('orders')
          .update({
            status: 'paid',
            paid_at: metadata.paidAt || verification.paidAt || new Date().toISOString(),
            payment_method: metadata.paymentMethod || order.payment_method,
            paid_reff_num: metadata.reference || verification.reference || null,
          })
          .eq('id', providerRef);

        if (updateOrderError) {
          console.error('[payment/callback] Order update error:', updateOrderError);
        }

        console.log('[payment/callback] Payment processed successfully for user:', order.user_id);

        // Discord webhook notification (non-blocking, never affects payment flow)
        notifyDiscord({
          title: '💸 Payment Success',
          description: `Plan: ${order.plan_type} | User: ${order.user_id.slice(0, 8)}...`,
          color: 'success',
          fields: [
            { name: 'Invoice', value: providerRef, inline: true },
            { name: 'Method', value: metadata.paymentMethod || 'QRIS', inline: true },
            { name: 'Plan', value: order.plan_type, inline: true },
          ],
          event: 'payment.success',
        }).catch(e => console.error('[webhook] Discord notify failed:', e));
      }

      return res.json({ success: true });
    }

    // Unknown action — no debug info leaked
    return res.status(404).json({ error: 'Payment endpoint not found' });
  } catch (e: any) {
    console.error('[payment] Unhandled error:', e);
    // Discord webhook for payment errors (non-blocking)
    notifyDiscord({
      title: '⚠️ Payment Error',
      description: e.message || 'Unknown error',
      color: 'warning',
      event: 'payment.error',
    }).catch(err => console.error('[webhook] Discord notify failed:', err));
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
