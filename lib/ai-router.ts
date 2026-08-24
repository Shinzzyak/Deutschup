import { createClient } from "@supabase/supabase-js";
import { joinCustomProviderUrl } from './custom-provider-security.js';

// ============================================================
// Types
// ============================================================

interface ProviderConfig {
  id: string;
  name: string;
  enabled: boolean;
  priority: number;
  status: 'active' | 'degraded' | 'down' | 'disabled';
  config: Record<string, any>;
}

interface ModelConfig {
  id: string;
  provider_id: string;
  name: string;
  model_id?: string;
  display_name: string;
  enabled: boolean;
  is_primary: boolean;
  is_fallback: boolean;
  config: Record<string, any>;
}

interface RoutingConfig {
  primary: ModelConfig;
  fallback: ModelConfig;
  providers: ProviderConfig[];
  models: ModelConfig[];
}

interface AIRequestLog {
  userId: string;
  providerId: string;
  modelId: string;
  endpoint: string;
  latencyMs: number;
  tokensIn?: number;
  tokensOut?: number;
  costUsd?: number;
  success: boolean;
  errorMessage?: string;
}

// ============================================================
// Supabase Client
// ============================================================

function getSupabaseAdmin() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ============================================================
// Cache (5 min TTL)
// ============================================================

let cachedConfig: RoutingConfig | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * App-level smart-fallback (VansRouter-style behavior, NOT the Vans gateway):
 * ordered list primary → is_fallback → rest; try each on failure.
 */
function orderFallbackChain(models: ModelConfig[]): ModelConfig[] {
  if (!models.length) return [];
  const primary = models.find((m) => m.is_primary) || models[0];
  const fallback =
    models.find((m) => m.is_fallback && m.id !== primary.id) ||
    models.find((m) => m.id !== primary.id);
  const rest = models.filter((m) => m.id !== primary.id && m.id !== fallback?.id);
  return [primary, ...(fallback ? [fallback] : []), ...rest];
}

/** Env-only chain when Supabase routing tables are empty/unreachable. */
function envGeminiFallbackChain(): RoutingConfig | null {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) return null;
  const names = (process.env.AI_FALLBACK_MODELS ||
    'gemini-2.5-flash,gemini-2.0-flash,gemini-2.0-flash-lite-001,gemma-3-1b-it')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const models: ModelConfig[] = names.map((name, i) => ({
    id: `env-${name}`,
    provider_id: 'gemini',
    name,
    model_id: name,
    display_name: name,
    enabled: true,
    is_primary: i === 0,
    is_fallback: i === 1,
    config: { temperature: 0.7 },
  }));
  const provider: ProviderConfig = {
    id: 'gemini',
    name: 'Google Gemini',
    enabled: true,
    priority: 0,
    status: 'active',
    config: {},
  };
  const ordered = orderFallbackChain(models);
  return {
    primary: ordered[0],
    fallback: ordered[1] || ordered[0],
    providers: [provider],
    models: ordered,
  };
}

export async function getRoutingConfig(): Promise<RoutingConfig> {
  const now = Date.now();
  if (cachedConfig && now - cacheTimestamp < CACHE_TTL) {
    return cachedConfig;
  }

  try {
    const supabase = getSupabaseAdmin();

    const { data: allProviders, error: pError } = await supabase
      .from('ai_providers')
      .select('*')
      .eq('enabled', true)
      .order('priority', { ascending: true });
    if (pError) throw pError;

    const providers: ProviderConfig[] = [];
    for (const provider of allProviders || []) {
      const apiKey = await getApiKey(provider.id);
      if (apiKey) providers.push(provider);
      else console.warn(`[AI-ROUTING] Skipping ${provider.id}: no API key`);
    }

    const { data: allModels, error: mError } = await supabase
      .from('ai_models')
      .select('*')
      .eq('enabled', true);
    if (mError) throw mError;

    const availableProviderIds = new Set(providers.map((p) => p.id));
    const providerPriority = new Map(providers.map((p, i) => [p.id, p.priority ?? i]));
    const models = (allModels || [])
      .filter((m) => availableProviderIds.has(m.provider_id))
      .sort((a, b) => {
        const pa = providerPriority.get(a.provider_id) ?? 999;
        const pb = providerPriority.get(b.provider_id) ?? 999;
        if (pa !== pb) return pa - pb;
        // Prefer marked primary/fallback before display-name sort within same provider
        if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
        if (a.is_fallback !== b.is_fallback) return a.is_fallback ? -1 : 1;
        return (a.display_name || a.name || a.id).localeCompare(b.display_name || b.name || b.id);
      });

    if (models.length === 0) throw new Error('No available AI models (no providers with API keys)');

    const orderedModels = orderFallbackChain(models);
    cachedConfig = {
      primary: orderedModels[0],
      fallback: orderedModels[1] || orderedModels[0],
      providers,
      models: orderedModels,
    };
    cacheTimestamp = now;
    return cachedConfig;
  } catch (e: any) {
    console.warn('[AI-ROUTING] DB config failed, env chain:', e?.message || e);
    const envChain = envGeminiFallbackChain();
    if (!envChain) throw e;
    cachedConfig = envChain;
    cacheTimestamp = now;
    return cachedConfig;
  }
}

export function invalidateCache() {
  cachedConfig = null;
  cacheTimestamp = 0;
}

// ============================================================
// API Key Management
// ============================================================

async function getApiKey(providerId: string): Promise<string | null> {
  // Env first (CF Pages secrets) — skip DB when a real key is present.
  const envKey = `${providerId.toUpperCase()}_API_KEY`;
  const fromEnv =
    process.env[envKey]?.trim() ||
    (providerId === 'gemini' ? process.env.GEMINI_API_KEY?.trim() : '') ||
    '';
  // Guard against truncated/placeholder keys (env stubs are ~13 chars).
  if (fromEnv && fromEnv.length >= 20) return fromEnv;

  const supabase = getSupabaseAdmin();

  // Check provider_secrets table first (database)
  const { data: secret } = await supabase
    .from('provider_secrets')
    .select('secret_value')
    .eq('provider_id', providerId)
    .eq('secret_key', 'api_key')
    .single();

  if (secret?.secret_value) return secret.secret_value;

  // Custom providers store active keys separately from built-in provider_secrets.
  const { data: customKey } = await supabase
    .from('custom_provider_keys')
    .select('api_key')
    .eq('provider_id', providerId)
    .eq('is_active', true)
    .order('priority', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (customKey?.api_key) return customKey.api_key;
  return null;
}

// ============================================================
// Provider Client Factory
// ============================================================

interface AIProviderClient {
  providerId: string;
  modelId: string;
  modelName: string;
  chat(message: string, systemPrompt: string, history?: Array<{ role: string; text: string }>): Promise<string>;
  generateJson(prompt: string, schema: any): Promise<any>;
}

async function createGeminiClient(model: ModelConfig): Promise<AIProviderClient> {
  const apiKey = await getApiKey('gemini');
  if (!apiKey) throw new Error('Gemini API key not configured');

  // REST only — @google/genai SDK is Node-oriented and flakes on CF Pages Functions.
  const modelName = model.model_id || model.name;
  const base = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}`;

  async function generate(body: Record<string, unknown>): Promise<any> {
    const response = await fetch(`${base}:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const msg =
        (err as any)?.error?.message ||
        (err as any)?.error ||
        `Gemini API error: ${response.status}`;
      const e = new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
      // Propagate the HTTP status so withRetry can classify 429/503/5xx.
      (e as any).status = response.status;
      throw e;
    }
    return response.json();
  }

  function textFrom(data: any): string {
    const parts = data?.candidates?.[0]?.content?.parts;
    if (!Array.isArray(parts)) return '';
    return parts.map((p: any) => p?.text || '').join('');
  }

  return {
    providerId: 'gemini',
    modelId: model.id,
    modelName,
    chat: async (message, systemPrompt, history = []) => {
      const contents = [
        ...history.map((h) => ({
          role: h.role === 'model' ? 'model' : 'user',
          parts: [{ text: h.text }],
        })),
        { role: 'user', parts: [{ text: message }] },
      ];
      const data = await generate({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
      });
      return textFrom(data);
    },
    generateJson: async (prompt, schema) => {
      const data = await generate({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          // ponytail: schema optional; many gemini models accept responseSchema in gen config
          ...(schema ? { responseSchema: schema } : {}),
        },
      });
      const raw = textFrom(data).trim() || '{}';
      const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      return JSON.parse(cleaned || '{}');
    },
  };
}

async function createDeepSeekClient(model: ModelConfig): Promise<AIProviderClient> {
  const apiKey = await getApiKey('deepseek');
  if (!apiKey) throw new Error('DeepSeek API key not configured');

  return {
    providerId: 'deepseek',
    modelId: model.id,
    modelName: model.name,
    chat: async (message, systemPrompt, history = []) => {
      const messages = [
        { role: 'system', content: systemPrompt },
        ...history.map(h => ({ role: h.role === 'model' ? 'assistant' : 'user', content: h.text })),
        { role: 'user', content: message }
      ];

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model.name,
          messages,
          temperature: model.config?.temperature || 0.7,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    },
    generateJson: async (prompt, schema) => {
      const messages = [
        { role: 'system', content: `Respond in valid JSON matching this schema: ${JSON.stringify(schema)}` },
        { role: 'user', content: prompt }
      ];

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model.name,
          messages,
          temperature: model.config?.temperature || 0.7,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '{}';
      return JSON.parse(content);
    }
  };
}

async function createOpenAIClient(model: ModelConfig): Promise<AIProviderClient> {
  const apiKey = await getApiKey('openai');
  if (!apiKey) throw new Error('OpenAI API key not configured');

  return {
    providerId: 'openai',
    modelId: model.id,
    modelName: model.name,
    chat: async (message, systemPrompt, history = []) => {
      const messages = [
        { role: 'system', content: systemPrompt },
        ...history.map(h => ({ role: h.role === 'model' ? 'assistant' : 'user', content: h.text })),
        { role: 'user', content: message }
      ];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model.name,
          messages,
          temperature: model.config?.temperature || 0.7,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    },
    generateJson: async (prompt, schema) => {
      const messages = [
        { role: 'system', content: `Respond in valid JSON matching this schema: ${JSON.stringify(schema)}` },
        { role: 'user', content: prompt }
      ];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model.name,
          messages,
          temperature: model.config?.temperature || 0.7,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '{}';
      return JSON.parse(content);
    }
  };
}

async function createMimoClient(model: ModelConfig): Promise<AIProviderClient> {
  const apiKey = await getApiKey('mimo');
  if (!apiKey) throw new Error('Mimo API key not configured');

  const baseUrl = process.env.MIMO_BASE_URL || 'https://api.xiaomimimo.com/v1';

  return {
    providerId: 'mimo',
    modelId: model.id,
    modelName: model.name,
    chat: async (message, systemPrompt, history = []) => {
      const messages = [
        { role: 'system', content: systemPrompt },
        ...history.map(h => ({ role: h.role === 'model' ? 'assistant' : 'user', content: h.text })),
        { role: 'user', content: message }
      ];

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model.name,
          messages,
          temperature: model.config?.temperature || 0.7,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `Mimo API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    },
    generateJson: async (prompt, schema) => {
      const messages = [
        { role: 'system', content: `Respond in valid JSON matching this schema: ${JSON.stringify(schema)}` },
        { role: 'user', content: prompt }
      ];

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model.name,
          messages,
          temperature: model.config?.temperature || 0.7,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `Mimo API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '{}';
      return JSON.parse(content);
    }
  };
}

// ============================================================
// Dynamic Custom Provider Client (OpenAI-compatible)
// ============================================================

async function createCustomProviderClient(model: ModelConfig): Promise<AIProviderClient> {
  const supabase = getSupabaseAdmin();

  const { data: provider } = await supabase
    .from('custom_providers')
    .select('*')
    .eq('id', model.provider_id)
    .single();

  if (!provider) throw new Error(`Custom provider not found: ${model.provider_id}`);

  const { data: keyRow } = await supabase
    .from('custom_provider_keys')
    .select('api_key')
    .eq('provider_id', model.provider_id)
    .eq('is_active', true)
    .order('priority')
    .limit(1)
    .single();

  if (!keyRow?.api_key) throw new Error(`No API key for custom provider: ${model.provider_id}`);
  const apiKey = keyRow.api_key;

  const chatUrl = joinCustomProviderUrl(provider.base_url, provider.chat_endpoint || '/chat/completions');

  function buildHeaders(): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (provider.auth_type === 'bearer') {
      h['Authorization'] = `Bearer ${apiKey}`;
    } else if (provider.auth_type === 'x-api-key') {
      h[provider.auth_header || 'X-API-Key'] = apiKey;
    }
    if (provider.config?.headers) Object.assign(h, provider.config.headers);
    return h;
  }

  return {
    providerId: model.provider_id,
    modelId: model.id,
    modelName: model.model_id || model.name,
    chat: async (message, systemPrompt, history = []) => {
      const messages = [
        { role: 'system', content: systemPrompt },
        ...history.map(h => ({ role: h.role === 'model' ? 'assistant' : 'user', content: h.text })),
        { role: 'user', content: message }
      ];
      const response = await fetch(chatUrl, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify({ model: model.model_id || model.name, messages, temperature: model.config?.temperature ?? 0.7, stream: false, max_tokens: 2000 }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `Custom provider error: ${response.status}`);
      }
      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    },
    generateJson: async (prompt, schema) => {
      const messages = [
        { role: 'system', content: `Respond in valid JSON matching this schema: ${JSON.stringify(schema)}` },
        { role: 'user', content: prompt }
      ];
      const response = await fetch(chatUrl, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify({ model: model.model_id || model.name, messages, temperature: model.config?.temperature ?? 0.7 }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `Custom provider error: ${response.status}`);
      }
      const data = await response.json();
      return JSON.parse(data.choices?.[0]?.message?.content || '{}');
    }
  };
}

// Client factory by provider ID
const CLIENT_FACTORIES: Record<string, (model: ModelConfig) => Promise<AIProviderClient>> = {
  gemini: createGeminiClient,
  deepseek: createDeepSeekClient,
  openai: createOpenAIClient,
  mimo: createMimoClient,
};

export async function createProviderClient(model: ModelConfig): Promise<AIProviderClient> {
  if (CLIENT_FACTORIES[model.provider_id]) return CLIENT_FACTORIES[model.provider_id](model);

  // Check custom providers table
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('custom_providers')
    .select('id')
    .eq('id', model.provider_id)
    .eq('enabled', true)
    .single();

  if (data) return createCustomProviderClient(model);
  throw new Error(`No client factory for provider: ${model.provider_id}`);
}

// ============================================================
// Retry Logic
// ============================================================

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2, baseDelay = 1000): Promise<T> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const isRetryable = err?.status === 429 || err?.status === 503 ||
                          err?.message?.includes('RESOURCE_EXHAUSTED') ||
                          err?.message?.includes('UNAVAILABLE') ||
                          err?.message?.includes('rate limit');
      if (!isRetryable || attempt === maxRetries) throw err;
      const delay = baseDelay * Math.pow(2, attempt);
      console.warn(`[AI-RETRY] Attempt ${attempt + 1} failed, retrying in ${delay}ms:`, err.message);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw lastError;
}

// ============================================================
// Main Routing API
// ============================================================

export async function getAIClient(): Promise<AIProviderClient> {
  const config = await getRoutingConfig();
  return createProviderClient(config.primary);
}

export async function getPrimaryClient(): Promise<AIProviderClient> {
  const config = await getRoutingConfig();
  return createProviderClient(config.primary);
}

export async function getFallbackClient(): Promise<AIProviderClient> {
  const config = await getRoutingConfig();
  return createProviderClient(config.fallback);
}

export async function executeWithRouting<T>(
  endpoint: string,
  userId: string,
  primaryFn: (client: AIProviderClient) => Promise<T>,
  fallbackFn: (client: AIProviderClient) => Promise<T>,
  userTier?: 'free' | 'pro'
): Promise<{ result: T; providerId: string; modelId: string; latencyMs: number }> {
  const startTime = Date.now();
  const config = await getRoutingConfig();
  const errors: string[] = [];
  let quotaHits = 0;

  // Smart-fallback: walk the ordered model chain. Free users still get primary→fallback only
  // (cost control); pro walks the full list. Same behavior pattern as Vans smart-fallback,
  // implemented in-app against our own provider list.
  const maxModels =
    userTier === 'free'
      ? Math.min(2, config.models.length) // primary + one fallback
      : config.models.length;

  for (let i = 0; i < maxModels; i++) {
    const model = config.models[i];
    const fn = i === 0 ? primaryFn : fallbackFn;

    try {
      const client = await createProviderClient(model);
      const result = await withRetry(() => fn(client), i === 0 ? 2 : 1, 1000);
      const latencyMs = Date.now() - startTime;

      try {
        await logUsage({
          userId,
          providerId: model.provider_id,
          modelId: model.id,
          endpoint,
          latencyMs,
          success: true,
        });
      } catch (e: any) {
        console.error('[AI-LOG] Failed to log usage:', e.message);
      }

      return { result, providerId: model.provider_id, modelId: model.id, latencyMs };
    } catch (error: any) {
      errors.push(`${model.provider_id}/${model.name}: ${error.message}`);
      quotaHits += error?.status === 429 || error?.status === 429 || /RESOURCE_EXHAUSTED|rate limit/i.test(error?.message || '') ? 1 : 0;
      console.warn(`[AI-ROUTING] ${model.provider_id}/${model.name} failed → next:`, error.message);
    }
  }

  // All providers failed
  const latencyMs = Date.now() - startTime;
  try {
    await logUsage({
      userId,
      providerId: config.models[0]?.provider_id || 'unknown',
      modelId: config.models[0]?.id || 'unknown',
      endpoint,
      latencyMs,
      success: false,
      errorMessage: errors.join('; '),
    });
  } catch (e: any) {
    console.error('[AI-LOG] Failed to log usage:', e.message);
  }

  // All providers failed. If every failure was a 429 (provider quota, e.g.
  // Gemini free-tier 20 RPM), surface it as 429 so the caller can tell the
  // user "try again in a minute" instead of a generic 500.
  const allQuota = quotaHits === errors.length;
  const err = new Error(`All AI providers failed: ${errors.join('; ')}`);
  if (allQuota) (err as any).status = 429;
  throw err;
}

// ============================================================
// Usage Logging
// ============================================================

async function logUsage(log: AIRequestLog): Promise<void> {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.from('ai_usage_log').insert({
    user_id: log.userId,
    provider_id: log.providerId,
    model_id: log.modelId,
    endpoint: log.endpoint,
    latency_ms: log.latencyMs,
    tokens_in: log.tokensIn || 0,
    tokens_out: log.tokensOut || 0,
    cost_usd: log.costUsd || 0,
    success: log.success,
    error_message: log.errorMessage || null,
  });
  if (error) console.error('[AI-LOG] insert error:', error.message, JSON.stringify(log).slice(0, 200));
}

// ============================================================
// Legacy Compatibility
// ============================================================

// Keep getGeminiApiKey for backward compatibility
export async function getGeminiApiKey(): Promise<string | null> {
  return getApiKey('gemini');
}

// Keep getAiClient for backward compatibility — REST client, not SDK.
export async function getAiClient() {
  const apiKey = await getGeminiApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY tidak ditemukan. Silakan tambahkan di menu Admin atau Secrets.");
  }
  return {
    apiKey,
    generate: async (model: string, prompt: string) => {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }),
      });
      if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);
      const data = await response.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    },
  };
}
