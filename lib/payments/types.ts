// Vendor-neutral payment contract for DeutschUp.
//
// api/payment.ts talks to THIS interface and to nothing else. No gateway URL,
// no gateway field name and no gateway credential may appear outside this
// folder. Swapping gateways is therefore: add one file next to this one,
// register it in ./index.ts, set PAYMENT_PROVIDER. See docs/PAYMENT.md.
//
// ============================================================================
// THE RULE THAT MAKES THIS SAFE — READ BEFORE IMPLEMENTING A PROVIDER
// ============================================================================
// A webhook body is a CLAIM, never proof. Anybody who learns the callback URL
// can POST anything to it, including {"status":"paid"}. Therefore:
//
//   * parseWebhook() MUST return the provider reference id and NOTHING ELSE.
//     It MUST NOT return, imply, or act on a status. Not "paid", not "success",
//     not a boolean, not a signature verdict that shortcuts verifyCharge.
//
//   * The payment status MUST come from verifyCharge(), which asks the gateway
//     over an authenticated, server-to-server channel using our own secret.
//
// That single rule is what makes a forged webhook worthless: the worst an
// attacker achieves by POSTing a fake body is making our server ask the gateway
// about an invoice — and the gateway answers "pending".
//
// Signature verification (HMAC, x-callback-token, signature_key ...) is a
// welcome SECOND lock, not a replacement for the first. Verify the signature if
// the gateway offers one, then still call verifyCharge. lib/payments/index.ts
// rebuilds the parseWebhook result field by field, so a provider that returns a
// status anyway simply has it dropped.
// ============================================================================

/** Normalised lifecycle of a single payment attempt. */
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'expired';

/**
 * Everything a provider needs in order to open a charge. All of it is decided
 * by the application (price, plan, URLs) — never by the gateway, and never by
 * the browser: api/payment.ts derives the identity from a verified Bearer token
 * and the price from server-side constants.
 */
export interface CreateChargeInput {
  /** Whole rupiah. Integer. Never a float — money is not a float. */
  amount: number;
  /** Product plan being bought, e.g. 'pro'. Stored on the order row. */
  planType: string;
  /** Human-readable line item shown by the gateway to the payer. */
  description: string;
  customerName: string;
  customerEmail: string;
  /** Absolute https URL the gateway should call when something happens. */
  callbackUrl: string;
  /** Absolute https URL the payer is sent back to after paying. */
  redirectUrl: string;
  /**
   * Optional gateway-specific channel hint ('qris', 'va', ...). Providers pick
   * their own default when this is omitted; the application does not need to
   * know a gateway's channel vocabulary.
   */
  paymentMethod?: string;
}

/**
 * Extra, purely presentational payload for flows that cannot be completed by
 * redirecting to a hosted page (static QRIS + manual confirmation, bank
 * transfer instructions). The API handler passes this straight through to the
 * client under the `payment` key; the UI decides how to render it.
 *
 * Providers with a hosted checkout page (Bayar.gg, Midtrans Snap, ...) leave
 * this undefined and the API response shape stays exactly as it always was.
 */
export interface ChargeDisplay {
  /** Discriminator for the UI, e.g. 'manual_transfer'. */
  mode: string;
  /** URL of a QR image to <img> directly. */
  qrImageUrl?: string;
  /** Short label of the destination account, e.g. 'QRIS a.n. DeutschUp'. */
  accountLabel?: string;
  /** Where the payer sends proof of payment (WhatsApp / email). */
  contact?: string;
  /** Ordered, ready-to-render Indonesian instructions. */
  instructions?: string[];
  /** One-line honest caveat, e.g. "aktivasi manual, maksimal 1x24 jam". */
  note?: string;
}

export interface CreateChargeResult {
  /**
   * The gateway's identifier for this charge, and the primary key of our local
   * order row. Either the gateway mints it (Bayar.gg returns invoice_id) or the
   * provider mints it before calling the gateway (Midtrans requires the
   * merchant to supply order_id). Either way the provider returns it, and it
   * must be unique and unguessable — never a sequential counter.
   */
  providerRef: string;
  /** Hosted checkout page to send the payer to, when the gateway has one. */
  payUrl?: string;
  /** Raw EMVCo QRIS payload, when the gateway returns one instead of a page. */
  qrString?: string;
  /** ISO 8601. Advisory only unless the gateway itself enforces it. */
  expiresAt?: string;
  /** Echo of the requested amount, so the caller stores what it charged. */
  amount: number;
  /** Channel actually opened ('qris', 'qris_manual', ...). Stored on the order. */
  paymentMethod?: string;
  /** See ChargeDisplay. Undefined for ordinary redirect-to-gateway flows. */
  display?: ChargeDisplay;
}

export interface VerifyChargeResult {
  /**
   * The ONLY authoritative status in the whole system. Map conservatively:
   * anything you do not positively recognise as settled is 'pending'.
   */
  status: PaymentStatus;
  /**
   * Amount the gateway says was actually paid, in whole rupiah, or undefined
   * when the gateway does not report it. The caller compares this against the
   * amount stored on the order and refuses to fulfil on a mismatch, so DO NOT
   * echo our own stored amount back here — that fakes a verification that never
   * happened.
   */
  amount?: number;
  /** ISO 8601 settlement time as reported by the gateway. */
  paidAt?: string;
  /** Gateway/acquirer reference (RRN, transaction id) for reconciliation. */
  reference?: string;
  /**
   * The gateway's own status word, verbatim, FOR LOGGING ONLY. Never branch on
   * it — branch on `status`.
   */
  rawStatus?: string;
}

/**
 * What a provider receives when a callback arrives. The HTTP body has already
 * been read once by the handler (a request body can only be consumed once), so
 * it is handed over pre-parsed.
 */
export interface WebhookRequest {
  /** Lower-cased header names, as produced by the Pages adapter. */
  headers: Record<string, string | string[] | undefined>;
  /** Parsed JSON body, or null when the body was absent/unparseable. */
  body: unknown;
  /**
   * Byte-exact request body, when the runtime made it available.
   *
   * REQUIRED for HMAC signature verification: hash the raw bytes, never
   * JSON.parse() -> JSON.stringify(), because re-serialising changes whitespace
   * and key order and the signature will never match. Compare digests in
   * constant time (crypto.subtle / timingSafeEqual), never with ===.
   *
   * On Cloudflare Pages this is currently undefined on the fast path — see the
   * "Verifikasi signature" section of docs/PAYMENT.md for the one-line adapter
   * change needed before shipping a signature-verifying provider.
   */
  rawBody?: string;
}

/**
 * The reference id extracted from a callback. Deliberately a one-field object:
 * there is nothing else a callback body is allowed to tell us.
 *
 * If you are about to add `status` here — that is the exact mistake this
 * codebase is built to prevent. Add it to VerifyChargeResult instead.
 */
export interface ParsedWebhook {
  providerRef: string;
}

/**
 * Cosmetic bookkeeping lifted from the UNVERIFIED callback body: the settlement
 * timestamp and reference the payer's bank printed on the receipt. Stored on
 * the order row for support and reconciliation, shown to humans, and NEVER used
 * to decide whether access is granted or whether the amount was correct.
 */
export interface WebhookMetadata {
  paidAt?: string;
  paymentMethod?: string;
  reference?: string;
}

export interface PaymentProvider {
  /** Registry key, must match the value of PAYMENT_PROVIDER. */
  readonly id: string;

  /**
   * Open a charge. Throw PaymentProviderError for anything that must map to a
   * specific HTTP status; let genuine network failures propagate untouched so
   * the handler's outer catch reports them as a server error.
   */
  createCharge(input: CreateChargeInput): Promise<CreateChargeResult>;

  /**
   * Ask the gateway what really happened, over an authenticated channel, using
   * our own credential. THIS IS THE ONLY SOURCE OF TRUTH FOR STATUS.
   *
   * Fail closed: on any doubt (unparseable answer, HTTP error, unknown status
   * word) return 'pending'. Never 'paid'.
   */
  verifyCharge(providerRef: string): Promise<VerifyChargeResult>;

  /**
   * Pull the provider reference id out of a callback body. Return null when
   * there is no usable id — the handler answers 200 "Ignored", which is the
   * correct reply to noise: a non-200 only makes the gateway retry.
   *
   * MUST NOT return a status. See the header of this file.
   */
  parseWebhook(req: WebhookRequest): ParsedWebhook | null;

  /**
   * OPTIONAL. Cosmetic display fields from the callback body — see
   * WebhookMetadata. Omit it and the handler falls back to safe defaults
   * (settlement time = now, method = whatever the order already had).
   */
  readWebhookMetadata?(req: WebhookRequest): WebhookMetadata;
}

/**
 * Why a provider could not do its job, in terms the HTTP layer can map without
 * knowing anything about the gateway.
 *
 *  misconfigured — a credential or setting we control is missing/invalid.
 *                  Our fault. Fix the environment. -> HTTP 500
 *  unavailable   — the gateway answered with something unusable (HTML error
 *                  page, non-JSON, garbage). Their fault. -> HTTP 502
 *  rejected      — the gateway understood us and explicitly refused to create
 *                  the charge. -> HTTP 400
 *  unreachable   — network-level failure: DNS, timeout, connection refused.
 *                  -> HTTP 502
 */
export type PaymentErrorKind = 'misconfigured' | 'unavailable' | 'rejected' | 'unreachable';

export class PaymentProviderError extends Error {
  readonly kind: PaymentErrorKind;

  constructor(kind: PaymentErrorKind, message: string) {
    super(message);
    this.name = 'PaymentProviderError';
    this.kind = kind;
  }
}

/** instanceof survives bundling badly; check the shape instead. */
export function isPaymentProviderError(e: unknown): e is PaymentProviderError {
  return !!e && typeof e === 'object' && (e as { name?: unknown }).name === 'PaymentProviderError';
}

/** Narrow an unknown JSON body to a plain object, or null. */
export function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

/** Format whole rupiah without depending on Intl, which edge runtimes trim. */
export function formatIdr(amount: number): string {
  const digits = Math.trunc(Math.abs(amount)).toString();
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${amount < 0 ? '-' : ''}Rp${grouped}`;
}
