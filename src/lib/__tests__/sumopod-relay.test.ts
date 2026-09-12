// Routing gate for the SumoPod callback fan-out.
//
// This merchant account has exactly one webhook_url and it points at Deutschup.
// The delivery bot charges through the same account, so the relay must send the
// bot's callbacks onward and leave every other callback on the untouched
// original path. Wrong in one direction drops the bot's paid orders; wrong in
// the other breaks Deutschup's payments.
import { describe, expect, it, vi, afterEach } from 'vitest';
import { BOT_ORDER_PREFIX, botCallbackUrl, isBotOrder, mirrorToBot } from '../../../functions/lib/sumopod-relay';

const botPayload = (orderId: string) =>
  JSON.stringify({
    data: {
      fee: 300,
      amount: 49000,
      status: 'paid',
      order_id: orderId,
      net_amount: 48700,
      payment_id: '019f72e5-9500-4764-94b6-4a846b10b735',
      payment_method: 'qris',
    },
    event_type: 'payment.success',
  });

describe('isBotOrder', () => {
  it('claims the delivery bot order prefix', () => {
    expect(isBotOrder(botPayload('VRB-6aa49649-e12cbff074'))).toBe(true);
  });

  it('leaves Deutschup orders on the original path', () => {
    expect(isBotOrder(botPayload('msk9hse37nwrujnb'))).toBe(false);
  });

  it('reads the parsed field, not a substring of the raw text', () => {
    // A Deutschup order whose description merely quotes the prefix must not be
    // stolen by the relay.
    const decoy = JSON.stringify({
      data: {
        order_id: 'msk9hse37nwrujnb',
        description: 'top-up for VRB-6aa49649-e12cbff074',
        status: 'paid',
      },
      event_type: 'payment.success',
    });
    expect(isBotOrder(decoy)).toBe(false);
  });

  it('handles an unwrapped payload', () => {
    expect(isBotOrder(JSON.stringify({ order_id: 'VRB-abc' }))).toBe(true);
    expect(isBotOrder(JSON.stringify({ order_id: 'msk-abc' }))).toBe(false);
  });

  it('never throws on junk', () => {
    for (const junk of ['', 'not json', '[]', 'null', '{"data":null}', '{"data":"x"}']) {
      expect(isBotOrder(junk)).toBe(false);
    }
  });

  it('ignores a non-string order_id', () => {
    expect(isBotOrder(JSON.stringify({ data: { order_id: 12345 } }))).toBe(false);
    expect(isBotOrder(JSON.stringify({ data: { order_id: { $ne: null } } }))).toBe(false);
  });

  it('does not claim a lookalike prefix', () => {
    expect(isBotOrder(botPayload('VRB'))).toBe(false);
    expect(isBotOrder(botPayload('vrb-lowercase'))).toBe(false);
    expect(isBotOrder(botPayload('XVRB-abc'))).toBe(false);
  });

  it('the prefix constant matches the bot generator', () => {
    // pelerproxy/services/fulfillment.py: f"VRB-{int(time.time()):x}-{secrets.token_hex(5)}"
    expect(BOT_ORDER_PREFIX).toBe('VRB-');
  });
});

describe('botCallbackUrl', () => {
  it('defaults to the delivery bot listener', () => {
    expect(botCallbackUrl(null)).toContain('/sumopod/callback');
  });

  it('never defaults to a bare IP — Workers answer those with 1003', () => {
    // Cloudflare Workers refuse subrequests to IP literals. A regression here
    // is invisible from a normal client and only shows up in production.
    expect(botCallbackUrl(null)).not.toMatch(/^https?:\/\/\d+\.\d+\.\d+\.\d+/);
  });

  it('honours an env override', () => {
    expect(botCallbackUrl({ BOT_CALLBACK_URL: 'http://example.test/hook' })).toBe(
      'http://example.test/hook',
    );
  });

  it('ignores a non-string override', () => {
    expect(botCallbackUrl({ BOT_CALLBACK_URL: 42 })).toContain('/sumopod/callback');
  });
});

describe('mirrorToBot', () => {
  afterEach(() => vi.unstubAllGlobals());

  const req = (headers: Record<string, string>) =>
    new Request('https://deutschup.sintec.my.id/api/payment/callback', {
      method: 'POST',
      headers,
      body: botPayload('VRB-abc'),
    });

  it('forwards only the auth headers the bot needs', async () => {
    const seen: any = {};
    vi.stubGlobal('fetch', async (url: string, init: any) => {
      seen.url = url;
      seen.headers = Object.fromEntries(new Headers(init.headers).entries());
      seen.body = init.body;
      return new Response('{"ok":true}', { status: 200 });
    });

    const res = await mirrorToBot(
      botPayload('VRB-abc'),
      req({
        'x-webhook-token': 'whtok_test',
        'content-type': 'application/json',
        cookie: 'session=secret',
        authorization: 'Bearer secret',
      }),
      null,
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, relayed: true, bot_status: 200 });
    expect(seen.headers['x-webhook-token']).toBe('whtok_test');
    expect(seen.headers['content-type']).toBe('application/json');
    // credentials that belong to Deutschup must not leak to the bot
    expect(seen.headers.cookie).toBeUndefined();
    expect(seen.headers.authorization).toBeUndefined();
    expect(seen.body).toBe(botPayload('VRB-abc'));
  });

  it('still answers the gateway 200 when the bot is unreachable', async () => {
    vi.stubGlobal('fetch', async () => {
      throw new Error('connect ECONNREFUSED');
    });
    const res = await mirrorToBot(botPayload('VRB-abc'), req({}), null);
    const out = await res.json();
    expect(res.status).toBe(200);
    expect(out).toMatchObject({ ok: true, relayed: true, bot_status: 0 });
    expect(out.error).toContain('ECONNREFUSED');
  });

  it('surfaces a non-200 from the bot without failing the gateway', async () => {
    vi.stubGlobal('fetch', async () => new Response('{"ok":false}', { status: 401 }));
    const res = await mirrorToBot(botPayload('VRB-abc'), req({}), null);
    expect(res.status).toBe(200);
    // the upstream status AND body must survive, or a broken hop reads as success
    expect(await res.json()).toMatchObject({
      relayed: true, bot_status: 401, bot_body: '{"ok":false}',
    });
  });
});
