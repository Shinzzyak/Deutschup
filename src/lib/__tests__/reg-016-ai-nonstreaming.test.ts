import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// REG-016: AI JSON endpoints must ask the router for a NON-streaming body.
//
// Root cause (2026-09-29): the custom-provider client sent no `stream` field
// from generateJson(). The router then streams (text/event-stream) for roughly
// half of all requests — measured 4 runs: 2 SSE, 2 JSON — and
// `await response.json()` in generateJson() throws on the first `data: ` line.
// Every JSON action (check-answer, vocab-examples, koreksi-kalimat,
// generate-exercises, generate-study-plan) returned
// "Herr Deutsch mengalami gangguan teknis" as a 500.
//
// The test drives the REAL client factory with a stubbed Supabase and a stubbed
// fetch, then asserts the outgoing request body — not the happy-path output.

const providerRow = {
  id: '9router',
  enabled: true,
  base_url: 'https://router.sintec.my.id/v1',
  chat_endpoint: '/chat/completions',
  auth_type: 'bearer',
  config: {},
};
const keyRow = { api_key: 'sk-test-key' };
const modelRow = {
  id: '9router-combo',
  provider_id: '9router',
  name: 'combo/smart-fallback',
  model_id: 'combo/smart-fallback',
  display_name: 'DeepSeek V4 Flash (VansRouter)',
  enabled: true,
  is_primary: true,
  is_fallback: true,
  config: {},
};

// Supabase query builder: chainable, resolves on .single().
function chain(result: unknown) {
  const b: any = {};
  for (const m of ['select', 'eq', 'order', 'limit']) b[m] = () => b;
  b.single = async () => ({ data: result, error: null });
  b.maybeSingle = async () => ({ data: result, error: null });
  return b;
}

const sentBodies: Array<Record<string, any>> = [];

function jsonResponse(content: string, contentType = 'application/json') {
  return {
    ok: true,
    status: 200,
    headers: { get: () => contentType },
    json: async () => {
      if (contentType.includes('event-stream')) {
        throw new SyntaxError('Unexpected token d in JSON at position 0'); // what the app does
      }
      return { choices: [{ message: { content } }] };
    },
    text: async () => content,
  } as unknown as Response;
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: (table: string) => {
      if (table === 'custom_providers') return chain(providerRow);
      if (table === 'custom_provider_keys') return chain(keyRow);
      return chain(null);
    },
    rpc: async () => ({ data: null, error: null }),
  }),
}));

describe('REG-016: custom provider requests are non-streaming', () => {
  beforeEach(() => {
    sentBodies.length = 0;
    vi.resetModules();
    vi.stubGlobal('fetch', async (_url: string, init?: RequestInit) => {
      sentBodies.push(JSON.parse(String(init?.body)));
      return jsonResponse('{"ok":true}');
    });
    process.env.SUPABASE_URL = 'https://test.local.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  async function makeClient() {
    const mod = await import('../../../lib/ai-router');
    return mod.createProviderClient(modelRow as any);
  }

  it('chat() sends stream:false', async () => {
    const client = await makeClient();
    await client.chat('Hallo', 'You are Herr Deutsch.', []);
    expect(sentBodies).toHaveLength(1);
    expect(sentBodies[0].stream).toBe(false);
    expect(sentBodies[0].model).toBe('combo/smart-fallback');
  });

  it('generateJson() sends stream:false — the field whose absence 500s every JSON action', async () => {
    const client = await makeClient();
    const schema = { type: 'OBJECT', properties: { isCorrect: { type: 'BOOLEAN' } }, required: ['isCorrect'] };
    const out = await client.generateJson('Koreksi jawaban ini', schema);
    expect(sentBodies).toHaveLength(1);
    expect(sentBodies[0].stream).toBe(false);
    expect(out).toEqual({ ok: true });
  });

  it('generateJson() still parses when the model returns a JSON string', async () => {
    vi.stubGlobal('fetch', async (_url: string, init?: RequestInit) => {
      sentBodies.push(JSON.parse(String(init?.body)));
      return jsonResponse(JSON.stringify({ isCorrect: true, feedback: 'benar' }));
    });
    const client = await makeClient();
    const out = await client.generateJson('x', { type: 'OBJECT' } as any);
    expect(out).toEqual({ isCorrect: true, feedback: 'benar' });
    expect(sentBodies[0].stream).toBe(false);
  });

  it('guard: an SSE body (the failure this prevents) is NOT parseable by response.json()', async () => {
    const sse = 'data: {"choices":[{"delta":{"content":"x"}}]}';
    const r = jsonResponse(sse, 'text/event-stream');
    await expect(r.json()).rejects.toThrow();
  });
});
