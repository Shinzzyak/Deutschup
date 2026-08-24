// Manual provider — static QRIS + human confirmation.
//
// This is the honest "payment is temporarily not automated" path. It does not
// pretend to be a payment gateway and it grants nothing on its own.
//
// WHY IT EXISTS
// -------------
// A static QRIS sticker carries no order id, no payer identity and no callback
// channel. Every payer scans the same code and the acquirer only records
// (amount, timestamp, payer name, RRN). There is no field anywhere in the EMVCo
// payload that could say "this Rp49.000 belongs to account X". Automatic
// reconciliation is therefore not "hard" here, it is impossible — and rewriting
// the QR payload to inject a nominal (the qris-statis-to-dinamis trick) does not
// change that one bit. See docs/PAYMENT.md §6.
//
// So this provider does the only correct thing: it creates a pending order,
// hands the payer instructions, and waits for a human to confirm.
//
// HOW CONFIRMATION WORKS
// ----------------------
//   1. Payer scans the static QRIS and sends proof + their order code.
//   2. Admin checks the real mutation in the bank/wallet app.
//   3. Admin writes the acquirer reference into orders.paid_reff_num for that
//      order id — that write IS the authorisation, and only someone with
//      database access can perform it.
//   4. Anyone (admin, a cron, the payer's own retry) pokes the callback
//      endpoint with the order id; verifyCharge sees the marker and reports
//      'paid'; the normal fulfilment path grants 30 days.
//
// The marker lives in the database, so poking the callback with a guessed order
// id achieves nothing: an unmarked order verifies as 'pending' forever.
//
// The full runbook, including the exact SQL and curl, is in docs/PAYMENT.md §5.

import { getDb } from '../api-utils.js';
import type {
  CreateChargeInput,
  CreateChargeResult,
  ParsedWebhook,
  PaymentProvider,
  VerifyChargeResult,
  WebhookRequest,
} from './types.js';
import { PaymentProviderError, asRecord, formatIdr } from './types.js';

const DEFAULT_WINDOW_HOURS = 24;

/** Unguessable local reference. Never a counter — order ids leak volume. */
function newManualRef(): string {
  const c: any = (globalThis as any).crypto;
  if (c?.randomUUID) return `MANUAL-${c.randomUUID()}`;
  if (c?.getRandomValues) {
    const bytes = c.getRandomValues(new Uint8Array(16));
    let hex = '';
    for (const b of bytes) hex += b.toString(16).padStart(2, '0');
    return `MANUAL-${hex}`;
  }
  // Last resort. Math.random is not a CSPRNG; this branch should never run on
  // Cloudflare Workers or Node 18+, both of which ship WebCrypto globally.
  return `MANUAL-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function windowHours(): number {
  const raw = Number(process.env.MANUAL_PAYMENT_WINDOW_HOURS);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_WINDOW_HOURS;
}

export const manualProvider: PaymentProvider = {
  id: 'manual',

  async createCharge(input: CreateChargeInput): Promise<CreateChargeResult> {
    const qrImageUrl = process.env.MANUAL_QRIS_IMAGE_URL?.trim();
    const qrString = process.env.MANUAL_QRIS_PAYLOAD?.trim();
    const contact = process.env.MANUAL_PAYMENT_CONTACT?.trim();
    const accountLabel = process.env.MANUAL_PAYMENT_ACCOUNT?.trim() || 'QRIS DeutschUp';

    // Fail loudly rather than showing the payer an empty box or a dead end.
    if (!qrImageUrl && !qrString) {
      console.error('[payment/create] manual provider: MANUAL_QRIS_IMAGE_URL / MANUAL_QRIS_PAYLOAD not set');
      throw new PaymentProviderError('misconfigured', 'Payment gateway misconfigured');
    }
    if (!contact) {
      console.error('[payment/create] manual provider: MANUAL_PAYMENT_CONTACT not set');
      throw new PaymentProviderError('misconfigured', 'Payment gateway misconfigured');
    }

    const providerRef = newManualRef();
    const hours = windowHours();

    return {
      providerRef,
      amount: input.amount,
      // No hosted checkout exists. payUrl stays undefined on purpose: the UI
      // must render the instructions below instead of redirecting anywhere.
      payUrl: undefined,
      qrString: qrString || undefined,
      // Advisory only. Nothing expires this order automatically — there is no
      // gateway holding a timer. Treat it as the promise shown to the payer.
      expiresAt: new Date(Date.now() + hours * 60 * 60 * 1000).toISOString(),
      paymentMethod: 'qris_manual',
      display: {
        mode: 'manual_transfer',
        qrImageUrl,
        accountLabel,
        contact,
        instructions: [
          'Buka aplikasi e-wallet atau m-banking kamu, lalu scan kode QRIS di atas.',
          `Masukkan nominal tepat ${formatIdr(input.amount)}. Nominal yang berbeda tidak bisa kami proses otomatis.`,
          `Simpan bukti pembayaran, lalu kirim ke ${contact} beserta kode pesanan di bawah.`,
          `Kode pesanan kamu: ${providerRef}`,
          `Admin akan mengaktifkan akun Pro kamu secara manual, maksimal ${hours} jam setelah bukti diterima.`,
        ],
        note: `Pembayaran ini dikonfirmasi manual oleh admin, bukan otomatis. Akses Pro aktif setelah kami mencocokkan bukti kamu (maksimal ${hours} jam).`,
      },
    };
  },

  async verifyCharge(providerRef: string): Promise<VerifyChargeResult> {
    // Source of truth for this provider is our own order row, because there is
    // no gateway to ask. The row is only reachable with the service-role key,
    // and only an admin can set the marker, so this is still a server-side check
    // against something the payer cannot influence.
    let row: { status?: string | null; paid_at?: string | null; paid_reff_num?: string | null } | null = null;
    try {
      const { data, error } = await getDb()
        .from('orders')
        .select('status, paid_at, paid_reff_num')
        .eq('id', providerRef)
        .maybeSingle();
      if (error) {
        console.error('[payment/callback] manual verify lookup error:', error.message);
        return { status: 'pending' }; // fail closed
      }
      row = data;
    } catch (e: any) {
      console.error('[payment/callback] manual verify threw:', e?.message || e);
      return { status: 'pending' }; // fail closed
    }

    if (!row) return { status: 'pending' };

    const marker = typeof row.paid_reff_num === 'string' ? row.paid_reff_num.trim() : '';
    const alreadyPaid = row.status === 'paid';

    if (!marker && !alreadyPaid) {
      return { status: 'pending', rawStatus: row.status || undefined };
    }

    return {
      status: 'paid',
      // Deliberately undefined: there is no independent amount to compare
      // against. Echoing back the order's own amount would manufacture a
      // "verification" that never happened. The admin's eyes are the amount
      // check in this flow — see docs/PAYMENT.md §5.
      amount: undefined,
      paidAt: row.paid_at || undefined,
      reference: marker || undefined,
      rawStatus: row.status || undefined,
    };
  },

  parseWebhook(req: WebhookRequest): ParsedWebhook | null {
    // There is no gateway, therefore there is no real webhook. This endpoint is
    // only a "poke": it says WHICH order to re-check, never WHETHER it is paid.
    // A stranger poking a guessed id gets 202 "Not paid yet", because the actual
    // decision is made by verifyCharge reading the admin-set marker.
    const body = asRecord(req.body);
    if (!body) return null;

    const ref = body.invoice_id ?? body.order_id;
    if (!ref) return null;
    return { providerRef: ref as string };
  },

  // No readWebhookMetadata: nothing in a manual poke body is worth recording.
  // paid_at / paid_reff_num come from verifyCharge, i.e. from what the admin
  // actually wrote after looking at the real mutation.
};
