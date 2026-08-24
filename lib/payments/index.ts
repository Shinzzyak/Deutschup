// Provider registry + the guardrails every provider is forced through.
//
// Adding a gateway is three lines here (import, registry entry, done) plus one
// new file next to this one. Nothing in api/ changes. See docs/PAYMENT.md §3.

import type { PaymentProvider, WebhookMetadata, WebhookRequest } from './types.js';
import { PaymentProviderError } from './types.js';
import { bayarGgProvider } from './bayargg.js';
import { manualProvider } from './manual.js';
import { sumoPodProvider } from './sumopod.js';

export * from './types.js';
export { bayarGgProvider } from './bayargg.js';
export { manualProvider } from './manual.js';
export { sumoPodProvider } from './sumopod.js';

/** Used when PAYMENT_PROVIDER is unset — i.e. what production runs today. */
export const DEFAULT_PAYMENT_PROVIDER = 'bayargg';

/**
 * A provider reference id longer than this is not a reference, it is an attempt
 * at something. Bayar.gg ids are ~25 chars, UUID-based ones 43.
 */
export const MAX_PROVIDER_REF_LENGTH = 128;

const REGISTRY: Record<string, PaymentProvider> = {
  bayargg: bayarGgProvider,
  manual: manualProvider,
  sumopod: sumoPodProvider,
};

/** Spellings that people actually type into an env var. */
const ALIASES: Record<string, string> = {
  'bayar.gg': 'bayargg',
  'bayar_gg': 'bayargg',
  'bayar-gg': 'bayargg',
  'bayargg.com': 'bayargg',
  'qris-manual': 'manual',
  'qris_manual': 'manual',
  'offline': 'manual',
};

export function listPaymentProviders(): string[] {
  return Object.keys(REGISTRY);
}

/**
 * Resolve the active provider.
 *
 * An unknown name is a hard error, never a silent fallback: if someone sets
 * PAYMENT_PROVIDER=midtrans before the Midtrans file exists, quietly charging
 * through Bayar.gg instead would be far worse than a 500.
 */
export function getPaymentProvider(name?: string): PaymentProvider {
  const requested = (name ?? process.env.PAYMENT_PROVIDER ?? '').trim().toLowerCase();
  const key = requested ? (ALIASES[requested] || requested) : DEFAULT_PAYMENT_PROVIDER;
  const provider = REGISTRY[key];
  if (!provider) {
    console.error(
      `[payment] Unknown PAYMENT_PROVIDER "${requested}". Known: ${listPaymentProviders().join(', ')}`
    );
    throw new PaymentProviderError('misconfigured', 'Payment gateway misconfigured');
  }
  return provider;
}

/**
 * Extract the provider reference from a callback — the ONLY thing a callback is
 * allowed to tell us.
 *
 * The result is rebuilt field by field on purpose. A provider that returns
 * `{ providerRef, status: 'paid' }` — by mistake, by copy-paste from a vendor
 * sample, or because someone "just needed it quickly" — has that status dropped
 * here, structurally. The rule in types.ts is thus enforced by code and not only
 * by a comment nobody read.
 *
 * Returns null for anything unusable; the caller answers 200 so the gateway
 * stops retrying noise.
 */
export function readWebhookRef(provider: PaymentProvider, req: WebhookRequest): string | null {
  const parsed = provider.parseWebhook(req);
  if (!parsed) return null;

  const ref = (parsed as { providerRef?: unknown }).providerRef;
  if (typeof ref !== 'string' || !ref || ref.length > MAX_PROVIDER_REF_LENGTH) {
    console.warn('[payment/callback] Invalid provider reference shape, ignoring');
    return null;
  }
  return ref;
}

/**
 * Cosmetic callback fields, or an empty object when the provider does not offer
 * them. Never a decision input — see WebhookMetadata in ./types.ts.
 */
export function readWebhookMetadata(provider: PaymentProvider, req: WebhookRequest): WebhookMetadata {
  if (typeof provider.readWebhookMetadata !== 'function') return {};
  try {
    return provider.readWebhookMetadata(req) || {};
  } catch (e: any) {
    console.warn('[payment/callback] readWebhookMetadata failed:', e?.message || e);
    return {};
  }
}
