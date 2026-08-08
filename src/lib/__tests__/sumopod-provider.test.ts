// Self-check for the SumoPod provider: token auth, status mapping, create
// payload shape. Run: npx vitest run src/lib/__tests__/sumopod-provider.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Import after env setup — the provider reads env lazily inside calls, so
// importing the module first is fine.
import { sumoPodProvider } from '../../../lib/payments/sumopod.js';
import type { CreateChargeInput, WebhookRequest } from '../../../lib/payments/types.js';

function makeInput(): CreateChargeInput {
  return {
    amount: 49000,
    planType: 'pro',
    description: 'DeutschUp PRO Subscription',
    customerName: 'Test',
    customerEmail: 'test@example.com',
    callbackUrl: 'https://deutschup.sintec.my.id/api/payment?action=callback',
    redirectUrl: 'https://deutschup.sintec.my.id/dashboard?payment=success',
  };
}

const input = makeInput();

beforeEach(() => {
  vi.stubEnv('SUMOPOD_API_KEY', 'sp_live_testkey');
  vi.stubEnv('SUMOPOD_WEBHOOK_TOKEN', 'whtok_testtoken');
});

describe('sumopod createCharge', () => {
  it('posts to api-pay with X-Api-Key and maps the response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        payment_id: '2f72d53d-d4c4-4e67-9efc-ecb452b9df49',
        order_id: 'abc123',
        amount: 49000,
        fee: 1813,
        net_amount: 47187,
        payment_link_url: 'https://checkout.pymnt.app/payment-links/b52673af',
        status: 'pending',
        expires_at: '2026-08-09T07:53:48Z',
      }), { status: 201 })
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await sumoPodProvider.createCharge(input);

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('api-pay.sumopod.com/api/v1/payments');
    expect((init as RequestInit).headers).toMatchObject({ 'X-Api-Key': 'sp_live_testkey' });
    const body = JSON.parse(String((init as RequestInit).body));
    expect(body.amount).toBe(49000);
    expect(body.currency).toBe('IDR');
    expect(body.payment_method_type_code).toBe('QRIS');
    expect(typeof body.order_id).toBe('string');
    expect(body.order_id.length).toBeGreaterThanOrEqual(10);

    expect(result.providerRef).toBe('2f72d53d-d4c4-4e67-9efc-ecb452b9df49');
    expect(result.payUrl).toContain('checkout.pymnt.app');
    expect(result.amount).toBe(49000);
    expect(result.paymentMethod).toBe('qris');
  });

  it('throws rejected on 4xx gateway error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: 'minimum payment amount is Rp 10.000', code: 'INVALID_INPUT' }), { status: 400 })
    ));
    await expect(sumoPodProvider.createCharge(input)).rejects.toMatchObject({ kind: 'rejected' });
  });

  it('throws misconfigured when API key missing', async () => {
    vi.stubEnv('SUMOPOD_API_KEY', '');
    await expect(sumoPodProvider.createCharge(input)).rejects.toMatchObject({ kind: 'misconfigured' });
  });
});

describe('sumopod parseWebhook + verifyCharge', () => {
  it('rejects a webhook with a wrong token', () => {
    const req: WebhookRequest = {
      headers: { 'x-webhook-token': 'whtok_wrong' },
      body: { event_type: 'payment.completed', data: { payment_id: 'p-1' } },
      rawBody: '{"event_type":"payment.completed","data":{"payment_id":"p-1"}}',
    };
    expect(sumoPodProvider.parseWebhook(req)).toBeNull();
  });

  it('accepts a token-authenticated webhook and records the status', async () => {
    const req: WebhookRequest = {
      headers: { 'x-webhook-token': 'whtok_testtoken' },
      body: {
        event_type: 'payment.completed',
        data: {
          payment_id: 'p-paid-1',
          order_id: 'abc123',
          amount: 49000,
          status: 'completed',
          payment_method: 'qris',
          completed_at: '2026-06-18T12:00:00Z',
        },
      },
      rawBody: '{"event_type":"payment.completed","data":{"payment_id":"p-paid-1","order_id":"abc123","amount":49000,"status":"completed"}}',
    };
    const parsed = sumoPodProvider.parseWebhook(req);
    expect(parsed).toEqual({ providerRef: 'p-paid-1' });

    // verifyCharge reads the recorded (authenticated) status.
    const verification = await sumoPodProvider.verifyCharge('p-paid-1');
    expect(verification.status).toBe('paid');
    expect(verification.amount).toBe(49000);
  });

  it('fails closed for an unknown reference', async () => {
    const verification = await sumoPodProvider.verifyCharge('p-never-seen');
    expect(verification.status).toBe('pending');
  });

  it('maps failed and expired events conservatively', () => {
    const mk = (status: string) => ({
      headers: { 'x-webhook-token': 'whtok_testtoken' },
      body: { event_type: 'payment.' + status, data: { payment_id: 'p-' + status, status } },
      rawBody: '{}',
    });
    sumoPodProvider.parseWebhook(mk('failed'));
    sumoPodProvider.parseWebhook(mk('expired'));
    return Promise.all([
      sumoPodProvider.verifyCharge('p-failed').then((v) => expect(v.status).toBe('failed')),
      sumoPodProvider.verifyCharge('p-expired').then((v) => expect(v.status).toBe('expired')),
    ]);
  });
});
