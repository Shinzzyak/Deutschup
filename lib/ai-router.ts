import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

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

export async function getRoutingConfig(): Promise<RoutingConfig> {
  const now = Date.now();
  if (cachedConfig && (now - cacheTimestamp) < CACHE_TTL) {
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
  const models = (allModels || []).filter(m => availableProviderIds.has(m.provider_id));

  if (models.length === 0) {
    throw new Error('No available AI models (no providers with API keys)');
  }

  // Find primary model (first available by priority)
  const primary = models[0];
  if (!primary) throw new Error('No primary model configured');

  // Find fallback model (second available, or primary if only one)
  const fallback = models.length > 1 ? models[1] : primary;

  cachedConfig = {
    primary,
    fallback,
    providers,
    models,
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
  const supabase = getSupabaseAdmin();

  // Check provider_secrets table first (database)
  const { data: secret } = await supabase
    .from('provider_secrets')
    .select('secret_value')
    .eq('provider_id', providerId)
    .eq('secret_key', 'api_key')
    .single();

  if (secret?.secret_value) return secret.secret_value;

  // Check env vars (fallback)
  const envKey = `${providerId.toUpperCase()}_API_KEY`;
  return process.env[envKey] || null;
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

// Client factory by provider ID
const CLIENT_FACTORIES: Record<string, (model: ModelConfig) => Promise<AIProviderClient>> = {
  gemini: createGeminiClient,
  deepseek: createDeepSeekClient,
  openai: createOpenAIClient,
  mimo: createMimoClient,
};

export async function createProviderClient(model: ModelConfig): Promise<AIProviderClient> {
  const factory = CLIENT_FACTORIES[model.provider_id];
  if (!factory) {
    throw new Error(`No client factory for provider: ${model.provider_id}`);
  }
  return factory(model);
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
  fallbackFn: (client: AIProviderClient) => Promise<T>
): Promise<{ result: T; providerId: string; modelId: string; latencyMs: number }> {
  const startTime = Date.now();
  const config = await getRoutingConfig();
  const errors: string[] = [];

  // Try all available models in priority order
  for (let i = 0; i < config.models.length; i++) {
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
      }).catch(() => {});

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
  }).catch(() => {});

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
