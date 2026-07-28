// Bayar.gg provider — PT BAYAR GLOBAL GATEWAY.
//
// This file is a straight extraction of the gateway-specific half of the old
// api/payment.ts. Endpoints, payload shape, response field names, log lines and
// failure branches are byte-for-byte the behaviour that has been running in
// production; nothing was "improved" during the move. Cross-checked against the
// official integration repo in docs/PAYMENT-BAYARGG-CROSSCHECK-2026-07-03.md.
//
// Notes on this gateway specifically:
//  * The callback body is NOT signed. Bayar.gg's own docs say so, and say to
//    re-check via the API. There is therefore no signature layer to implement
//    here — the entire security of the flow rests on verifyCharge().
//  * check-payment.php is the source of truth: pending | paid | expired |
//    cancelled.
//  * payment_url in the create payload is a REQUIRED constant, not our app URL.
//    Omitting it is how incident PAY-001 happened.

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

const BAYAR_GG_BASE_URL = 'https://www.bayar.gg/api';

/** Constant required by the gateway on create — see incident PAY-001. */
const BAYAR_GG_PAY_PAGE = 'https://www.bayar.gg/pay';

const DEFAULT_METHOD = 'qris';

function debugEnabled(): boolean {
  return process.env.DEBUG_PAYMENTS === 'true';
}

/**
 * Map the gateway's status word onto ours.
 *
 * Case-sensitive on purpose. Only the exact string documented as settled may
 * unlock a subscription; "PAID", "Paid" or anything unrecognised stays pending
 * rather than being guessed into a grant.
 */
function mapStatus(raw: unknown): PaymentStatus {
  if (raw === 'paid') return 'paid';
  if (raw === 'expired') return 'expired';
  if (raw === 'cancelled' || raw === 'canceled' || raw === 'failed') return 'failed';
  return 'pending';
}

export const bayarGgProvider: PaymentProvider = {
  id: 'bayargg',

  async createCharge(input: CreateChargeInput): Promise<CreateChargeResult> {
    // The _FALLBACK alias exists because Cloudflare Pages has dropped plain-text
    // project vars on deploy before. Kept exactly as it was.
    const apiKey = process.env.BAYAR_GG_API_KEY || process.env.BAYAR_GG_API_KEY_FALLBACK;
    const DEBUG = debugEnabled();

    const payload = {
      amount: input.amount,
      description: input.description,
      customer_name: input.customerName,
      customer_email: input.customerEmail,
      callback_url: input.callbackUrl,
      redirect_url: input.redirectUrl,
      payment_method: input.paymentMethod || DEFAULT_METHOD,
      payment_url: BAYAR_GG_PAY_PAGE,
    };

    // Network-level failures are deliberately NOT caught: they propagate to the
    // handler's outer catch, which is where they have always been reported.
    const bayarRes = await fetch(`${BAYAR_GG_BASE_URL}/create-payment.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey!,
      },
      body: JSON.stringify(payload),
    });

    if (DEBUG) console.log('[payment/create] gateway status:', bayarRes.status);

    const raw = await bayarRes.text();

    let bayarData: any;
    try {
      bayarData = JSON.parse(raw);
    } catch {
      // NOTE: never log the raw body in full — it can echo back request data.
      console.error('[payment/create] Non-JSON gateway response:', {
        status: bayarRes.status,
        contentType: bayarRes.headers.get('content-type'),
        preview: raw.slice(0, 200),
      });
      throw new PaymentProviderError('unavailable', 'Payment gateway unavailable');
    }

    if (DEBUG) console.log('[payment/create] gateway response keys:', Object.keys(bayarData));

    if (bayarData.success && bayarData.data?.invoice_id) {
      return {
        providerRef: bayarData.data.invoice_id,
        payUrl: bayarData.data.payment_url,
        expiresAt: bayarData.data.expires_at,
        amount: input.amount,
        paymentMethod: bayarData.data.payment_method,
      };
    }

    console.error('[BAYARGG ERROR]', JSON.stringify(bayarData, null, 2));
    throw new PaymentProviderError('rejected', 'Payment gateway error');
  },

  async verifyCharge(providerRef: string): Promise<VerifyChargeResult> {
    // Note: no _FALLBACK alias on this path, matching the original. Verification
    // must never silently succeed on a half-configured environment, so a missing
    // key is a hard misconfiguration rather than a "not paid yet".
    const apiKey = process.env.BAYAR_GG_API_KEY;
    if (!apiKey) {
      console.error('[payment/callback] CRITICAL: BAYAR_GG_API_KEY not set — cannot verify webhook');
      throw new PaymentProviderError('misconfigured', 'Payment gateway misconfigured');
    }

    const DEBUG = debugEnabled();

    let checkRes: Response;
    let checkText: string;
    try {
      checkRes = await fetch(
        `${BAYAR_GG_BASE_URL}/check-payment.php?invoice=${encodeURIComponent(providerRef)}`,
        { headers: { 'X-API-Key': apiKey, 'Accept': 'application/json' } }
      );
      checkText = await checkRes.text();
    } catch (verifyErr) {
      // Network error (timeout, DNS, connection refused) — genuinely unreachable.
      console.error('[payment/callback] Network error verifying payment:', verifyErr);
      throw new PaymentProviderError('unreachable', 'Failed to verify payment with gateway');
    }

    let verifyData: any;
    try {
      verifyData = JSON.parse(checkText);
    } catch {
      // Non-JSON response from gateway — treat as "not paid".
      console.error('[payment/callback] Non-JSON gateway response:', checkText.slice(0, 200));
      return { status: 'pending' };
    }

    // HTTP 404 or success=false from gateway → invoice not found → not paid.
    if (!checkRes.ok || verifyData?.success === false) {
      console.log('[payment/callback] Invoice not found or not paid:', providerRef);
      return { status: 'pending' };
    }

    if (DEBUG) console.log('[payment/callback] check-payment status:', verifyData?.status);

    const rawStatus = verifyData?.status;
    const finalAmount = verifyData?.final_amount;

    return {
      status: mapStatus(rawStatus),
      // Falsy (absent / 0 / null) means "the gateway did not tell us", which the
      // caller treats as "amount check not possible", exactly as before.
      amount: finalAmount ? Number(finalAmount) : undefined,
      paidAt: typeof verifyData?.paid_at === 'string' ? verifyData.paid_at : undefined,
      reference: typeof verifyData?.paid_reff_num === 'string' ? verifyData.paid_reff_num : undefined,
      rawStatus: typeof rawStatus === 'string' ? rawStatus : undefined,
    };
  },

  parseWebhook(req: WebhookRequest): ParsedWebhook | null {
    const body = asRecord(req.body);
    if (!body) return null;

    // ONLY the id. body.status is deliberately not read here and must never be:
    // the body is unsigned, so its status is an attacker-controlled string.
    const invoiceId = body.invoice_id;

    if (debugEnabled()) console.log('[payment/callback] received invoice_id:', invoiceId);

    if (!invoiceId) return null;

    // Shape is validated centrally in ./index.ts (readWebhookRef), so a wrong
    // type lands there and is logged once, in one place, for every provider.
    return { providerRef: invoiceId as string };
  },

  readWebhookMetadata(req: WebhookRequest): WebhookMetadata {
    const body = asRecord(req.body) || {};
    const str = (v: unknown) => (typeof v === 'string' && v ? v : undefined);
    return {
      paidAt: str(body.paid_at),
      paymentMethod: str(body.payment_method),
      reference: str(body.paid_reff_num),
    };
  },
};
