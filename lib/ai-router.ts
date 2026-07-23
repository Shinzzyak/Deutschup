import { GoogleGenAI } from "@google/genai";
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

/** VansRouter gateway (OpenAI-compatible). Smart-fallback = multi-model chain server-side. */
function vansEnvConfig(): { baseUrl: string; apiKey: string; model: string } | null {
  const apiKey = (process.env.VANS_API_KEY || process.env.VANSROUTER_API_KEY || '').trim();
  if (!apiKey) return null;
  const baseUrl = (process.env.VANS_BASE_URL || process.env.VANSROUTER_BASE_URL || 'http://150.109.12.245:20127/v1')
    .trim()
    .replace(/\/$/, '');
  const model = (process.env.VANS_MODEL || 'smart-fallback').trim() || 'smart-fallback';
  return { baseUrl, apiKey, model };
}

function syntheticVansRouting(modelName: string): RoutingConfig {
  const model: ModelConfig = {
    id: 'vans-smart-fallback',
    provider_id: 'vans',
    name: modelName,
    model_id: modelName,
    display_name: 'Vans smart-fallback',
    enabled: true,
    is_primary: true,
    is_fallback: true,
    config: { temperature: 0.7 },
  };
  const provider: ProviderConfig = {
    id: 'vans',
    name: 'VansRouter',
    enabled: true,
    priority: 0,
    status: 'active',
    config: {},
  };
  return { primary: model, fallback: model, providers: [provider], models: [model] };
}

export async function getRoutingConfig(): Promise<RoutingConfig> {
  const now = Date.now();
  if (cachedConfig && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedConfig;
  }

  // Prefer Vans gateway when configured — chain lives inside smart-fallback (no per-model DB).
  const vans = vansEnvConfig();
  if (vans) {
    cachedConfig = syntheticVansRouting(vans.model);
    cacheTimestamp = now;
    return cachedConfig;
  }

  const supabase = getSupabaseAdmin();

  // Get enabled providers ordered by priority
  const { data: allProviders, error: pError } = await supabase
    .from('ai_providers')
    .select('*')
    .eq('enabled', true)
    .order('priority', { ascending: true });

  if (pError) throw pError;

  // Filter providers by API key availability
  const providers: ProviderConfig[] = [];
  for (const provider of allProviders || []) {
    const apiKey = await getApiKey(provider.id);
    if (apiKey) {
      providers.push(provider);
    } else {
      console.warn(`[AI-ROUTING] Skipping ${provider.id}: no API key`);
    }
  }

  // Get enabled models
  const { data: allModels, error: mError } = await supabase
    .from('ai_models')
    .select('*')
    .eq('enabled', true);

  if (mError) throw mError;

  // Filter models to only include those from available providers
  const availableProviderIds = new Set(providers.map(p => p.id));
  const providerPriority = new Map(providers.map((p, i) => [p.id, p.priority ?? i]));
  const models = (allModels || [])
    .filter(m => availableProviderIds.has(m.provider_id))
    .sort((a, b) => {
      const pa = providerPriority.get(a.provider_id) ?? 999;
      const pb = providerPriority.get(b.provider_id) ?? 999;
      if (pa !== pb) return pa - pb;
      return (a.display_name || a.name || a.id).localeCompare(b.display_name || b.name || b.id);
    });

  if (models.length === 0) {
    throw new Error('No available AI models (no providers with API keys)');
  }

  // Respect admin-selected routing. Fallback to provider priority if nothing is selected.
  const primary = models.find(m => m.is_primary) || models[0];
  if (!primary) throw new Error('No primary model configured');

  // Prefer explicit fallback; otherwise use the next available model, or primary if only one exists.
  const fallback =
    models.find(m => m.is_fallback && m.id !== primary.id) ||
    models.find(m => m.id !== primary.id) ||
    primary;

  // Routing order matters: free users get index 0 only; pro users walk the chain.
  const orderedModels = [
    primary,
    ...(fallback.id !== primary.id ? [fallback] : []),
    ...models.filter(m => m.id !== primary.id && m.id !== fallback.id),
  ];

  cachedConfig = {
    primary,
    fallback,
    providers,
    models: orderedModels,
  };
  cacheTimestamp = now;
  return cachedConfig;
}

export function invalidateCache() {
  cachedConfig = null;
  cacheTimestamp = 0;
}

// ============================================================
// API Key Management
// ============================================================

async function getApiKey(providerId: string): Promise<string | null> {
  // Env first for gateway providers (Vans) — no DB dependency on cold path.
  if (providerId === 'vans') {
    const k = (process.env.VANS_API_KEY || process.env.VANSROUTER_API_KEY || '').trim();
    if (k) return k;
  }

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

  // Check env vars (fallback). Gemini also accepts GEMINI_API_KEY.
  const envKey = `${providerId.toUpperCase()}_API_KEY`;
  if (process.env[envKey]) return process.env[envKey] || null;
  if (providerId === 'gemini' && process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
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

  const ai = new GoogleGenAI({ apiKey });

  return {
    providerId: 'gemini',
    modelId: model.id,
    modelName: model.name,
    chat: async (message, systemPrompt, history = []) => {
      const formattedHistory = history.map(h => ({
        role: h.role === 'model' ? 'model' : 'user',
        parts: [{ text: h.text }]
      }));

      const chat = ai.chats.create({
        model: model.name,
        history: formattedHistory,
        config: { systemInstruction: systemPrompt }
      });

      const response = await chat.sendMessage({ message });
      return response.text || '';
    },
    generateJson: async (prompt, schema) => {
      const response = await ai.models.generateContent({
        model: model.name,
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: schema }
      });
      return JSON.parse(response.text?.trim() || "{}");
    }
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
        body: JSON.stringify({ model: model.model_id || model.name, messages, temperature: model.config?.temperature ?? 0.7 }),
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

async function createVansClient(model: ModelConfig): Promise<AIProviderClient> {
  const cfg = vansEnvConfig();
  if (!cfg) throw new Error('Vans API key not configured (VANS_API_KEY)');
  const baseUrl = cfg.baseUrl;
  const apiKey = cfg.apiKey;
  const modelName = model.model_id || model.name || cfg.model;

  async function chatCompletions(messages: Array<{ role: string; content: string }>, temperature = 0.7): Promise<string> {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages,
        temperature,
        max_tokens: 2048,
      }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const msg = (err as any)?.error?.message || (err as any)?.error || `Vans API error: ${response.status}`;
      throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  return {
    providerId: 'vans',
    modelId: model.id,
    modelName,
    chat: async (message, systemPrompt, history = []) => {
      const messages = [
        { role: 'system', content: systemPrompt },
        ...history.map(h => ({ role: h.role === 'model' ? 'assistant' : 'user', content: h.text })),
        { role: 'user', content: message },
      ];
      return chatCompletions(messages, model.config?.temperature ?? 0.7);
    },
    generateJson: async (prompt, schema) => {
      const messages = [
        { role: 'system', content: `Respond in valid JSON matching this schema: ${JSON.stringify(schema)}. No markdown.` },
        { role: 'user', content: prompt },
      ];
      const content = await chatCompletions(messages, model.config?.temperature ?? 0.3);
      const cleaned = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      return JSON.parse(cleaned || '{}');
    },
  };
}

// Client factory by provider ID
const CLIENT_FACTORIES: Record<string, (model: ModelConfig) => Promise<AIProviderClient>> = {
  vans: createVansClient,
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

  // Free users: only try primary model (index 0), no multi-model app-level fallback.
  // Exception: vans/smart-fallback already chains models server-side — allow it for free too.
  const isVansGateway = config.models[0]?.provider_id === 'vans';
  const maxModels = userTier === 'free' && !isVansGateway ? 1 : config.models.length;

  // Try available models in priority order
  for (let i = 0; i < maxModels; i++) {
    const model = config.models[i];
    const fn = i === 0 ? primaryFn : fallbackFn;

    try {
      const client = await createProviderClient(model);
      const result = await withRetry(() => fn(client), i === 0 ? 2 : 1, 1000);
      const latencyMs = Date.now() - startTime;

      // Log success
      logUsage({
        userId,
        providerId: model.provider_id,
        modelId: model.id,
        endpoint,
        latencyMs,
        success: true,
      }).catch((e: any) => console.error('[AI-LOG] Failed to log usage:', e.message));

      return { result, providerId: model.provider_id, modelId: model.id, latencyMs };
    } catch (error: any) {
      errors.push(`${model.provider_id}/${model.name}: ${error.message}`);
      console.warn(`[AI-ROUTING] ${model.provider_id}/${model.name} failed:`, error.message);
    }
  }

  // All providers failed
  const latencyMs = Date.now() - startTime;
  logUsage({
    userId,
    providerId: config.models[0]?.provider_id || 'unknown',
    modelId: config.models[0]?.id || 'unknown',
    endpoint,
    latencyMs,
    success: false,
    errorMessage: errors.join('; '),
  }).catch((e: any) => console.error('[AI-LOG] Failed to log usage:', e.message));

  throw new Error(`All AI providers failed: ${errors.join('; ')}`);
}

// ============================================================
// Usage Logging
// ============================================================

async function logUsage(log: AIRequestLog): Promise<void> {
  const supabase = getSupabaseAdmin();

  await supabase.from('ai_usage_log').insert({
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
}

// ============================================================
// Legacy Compatibility
// ============================================================

// Keep getGeminiApiKey for backward compatibility
export async function getGeminiApiKey(): Promise<string | null> {
  return getApiKey('gemini');
}

// Keep getAiClient for backward compatibility (returns Gemini client)
export async function getAiClient() {
  const apiKey = await getGeminiApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY tidak ditemukan. Silakan tambahkan di menu Admin atau Secrets.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'deutschup-api' } }
  });
}
