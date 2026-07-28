import type { ApiRequest, ApiResponse } from '../lib/http-types.js';
import { getSupabaseAdminClient, isVerifiedAdmin } from '../lib/api-utils.js';
import { invalidateCache } from '../lib/ai-router.js';
import { joinCustomProviderUrl } from '../lib/custom-provider-security.js';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', 'https://deutschup.sintec.my.id');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  if (!(await isVerifiedAdmin(req))) {
    return res.status(403).json({ error: 'Forbidden: Admin privileges required' });
  }

  const action = req.query.action as string;
  const supabase = getSupabaseAdminClient();

  switch (action) {
    // Provider actions
    case 'providers':
      return handleProviders(req, res, supabase);
    case 'provider-update':
      return handleProviderUpdate(req, res, supabase);
    case 'provider-toggle':
      return handleProviderToggle(req, res, supabase);

    // Model actions
    case 'models':
      return handleModels(req, res, supabase);
    case 'model-add':
      return handleModelAdd(req, res, supabase);
    case 'model-update':
      return handleModelUpdate(req, res, supabase);
    case 'model-toggle':
      return handleModelToggle(req, res, supabase);
    case 'model-set-primary':
      return handleSetPrimary(req, res, supabase);
    case 'model-set-fallback':
      return handleSetFallback(req, res, supabase);

    // Stats actions
    case 'usage-stats':
      return handleUsageStats(req, res, supabase);
    case 'provider-stats':
      return handleProviderStats(req, res, supabase);

    // Routing config
    case 'routing-config':
      return handleRoutingConfig(req, res, supabase);

    // Secret management
    case 'secrets':
      return handleSecrets(req, res, supabase);
    case 'secret-add':
      return handleSecretAdd(req, res, supabase);
    case 'secret-update':
      return handleSecretUpdate(req, res, supabase);
    case 'secret-delete':
      return handleSecretDelete(req, res, supabase);

    // Auto-detect models
    case 'detect-models':
      return handleDetectModels(req, res, supabase);

    // Health check
    case 'health-check':
      return handleHealthCheck(req, res, supabase);
    case 'validate-provider':
      return handleValidateProvider(req, res, supabase);

    default:
      return res.status(400).json({ error: 'Invalid action' });
  }
}

// ============================================================
// Provider Handlers
// ============================================================

async function handleProviders(_req: ApiRequest, res: ApiResponse, supabase: any) {
  try {
    const { data, error } = await supabase
      .from('ai_providers')
      .select('*')
      .order('priority', { ascending: true });

    if (error) throw error;
    return res.json(data || []);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

async function handleProviderUpdate(req: ApiRequest, res: ApiResponse, supabase: any) {
  const { id, name, priority, config } = req.body;
  if (!id) return res.status(400).json({ error: 'id required' });

  try {
    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (name !== undefined) updates.name = name;
    if (priority !== undefined) updates.priority = priority;
    if (config !== undefined) updates.config = config;

    const { error } = await supabase
      .from('ai_providers')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    invalidateCache();
    return res.json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

async function handleProviderToggle(req: ApiRequest, res: ApiResponse, supabase: any) {
  const { id, enabled } = req.body;
  if (!id || enabled === undefined) {
    return res.status(400).json({ error: 'id and enabled required' });
  }

  try {
    const { error } = await supabase
      .from('ai_providers')
      .update({
        enabled,
        status: enabled ? 'active' : 'disabled',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
    invalidateCache();
    return res.json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

// ============================================================
// Model Handlers
// ============================================================

async function handleModels(_req: ApiRequest, res: ApiResponse, supabase: any) {
  try {
    const { data, error } = await supabase
      .from('ai_models')
      .select('*')
      .order('provider_id', { ascending: true });

    if (error) throw error;
    return res.json(data || []);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

async function handleModelAdd(req: ApiRequest, res: ApiResponse, supabase: any) {
  const { provider_id, model_name, display_name, enabled } = req.body;
  if (!provider_id || !model_name || !display_name) {
    return res.status(400).json({ error: 'provider_id, model_name, and display_name required' });
  }

  try {
    // Check if model already exists (by id which equals model_name)
    const { data: existing } = await supabase
      .from('ai_models')
      .select('id')
      .eq('provider_id', provider_id)
      .eq('id', model_name)
      .maybeSingle();

    if (existing) {
      return res.json({ success: true, id: existing.id, message: 'Model already exists' });
    }

    const { data, error } = await supabase
      .from('ai_models')
      .insert({
        id: model_name,
        provider_id,
        name: model_name,
        display_name,
        enabled: enabled !== false,
        is_primary: false,
        is_fallback: false,
      })
      .select()
      .single();

    if (error) throw error;
    invalidateCache();
    return res.json({ success: true, id: data.id });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

async function handleModelUpdate(req: ApiRequest, res: ApiResponse, supabase: any) {
  const { id, display_name, config } = req.body;
  if (!id) return res.status(400).json({ error: 'id required' });

  try {
    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (display_name !== undefined) updates.display_name = display_name;
    if (config !== undefined) updates.config = config;

    const { error } = await supabase
      .from('ai_models')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    invalidateCache();
    return res.json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

async function handleModelToggle(req: ApiRequest, res: ApiResponse, supabase: any) {
  const { id, enabled } = req.body;
  if (!id || enabled === undefined) {
    return res.status(400).json({ error: 'id and enabled required' });
  }

  try {
    const { error } = await supabase
      .from('ai_models')
      .update({ enabled, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    invalidateCache();
    return res.json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

async function handleSetPrimary(req: ApiRequest, res: ApiResponse, supabase: any) {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'id required' });

  try {
    // Get model to find provider
    const { data: model, error: modelError } = await supabase
      .from('ai_models')
      .select('provider_id')
      .eq('id', id)
      .single();

    if (modelError || !model) {
      return res.status(404).json({ error: 'Model not found' });
    }

    // Clear all primary flags globally: runtime routing only supports one primary.
    const { error: clearError } = await supabase
      .from('ai_models')
      .update({ is_primary: false, updated_at: new Date().toISOString() })
      .eq('is_primary', true);

    if (clearError) throw clearError;

    // Set new primary and enable it so it becomes selectable at runtime.
    // A model cannot be both primary and fallback.
    const { error } = await supabase
      .from('ai_models')
      .update({ is_primary: true, is_fallback: false, enabled: true, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    invalidateCache();
    return res.json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

async function handleSetFallback(req: ApiRequest, res: ApiResponse, supabase: any) {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'id required' });

  try {
    // Get model to validate selection
    const { data: model, error: modelError } = await supabase
      .from('ai_models')
      .select('provider_id,is_primary')
      .eq('id', id)
      .single();

    if (modelError || !model) {
      return res.status(404).json({ error: 'Model not found' });
    }

    if (model.is_primary) {
      return res.status(400).json({ error: 'Fallback model must be different from primary model' });
    }

    // Clear all fallback flags globally: runtime routing only supports one explicit fallback.
    const { error: clearError } = await supabase
      .from('ai_models')
      .update({ is_fallback: false, updated_at: new Date().toISOString() })
      .eq('is_fallback', true);

    if (clearError) throw clearError;

    // Set new fallback and enable it so it becomes selectable at runtime.
    const { error } = await supabase
      .from('ai_models')
      .update({ is_fallback: true, enabled: true, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    invalidateCache();
    return res.json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

// ============================================================
// Stats Handlers
// ============================================================

async function handleUsageStats(req: ApiRequest, res: ApiResponse, supabase: any) {
  const days = parseInt(req.query.days as string) || 7;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    const { data, error } = await supabase
      .from('ai_usage_log')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    // Aggregate by provider/model
    const stats: Record<string, any> = {};
    for (const row of data || []) {
      const key = `${row.provider_id}:${row.model_id}`;
      if (!stats[key]) {
        stats[key] = {
          provider_id: row.provider_id,
          model_id: row.model_id,
          total_requests: 0,
          successful_requests: 0,
          failed_requests: 0,
          total_latency_ms: 0,
          total_tokens_in: 0,
          total_tokens_out: 0,
          total_cost_usd: 0,
        };
      }
      stats[key].total_requests++;
      if (row.success) stats[key].successful_requests++;
      else stats[key].failed_requests++;
      stats[key].total_latency_ms += row.latency_ms || 0;
      stats[key].total_tokens_in += row.tokens_in || 0;
      stats[key].total_tokens_out += row.tokens_out || 0;
      stats[key].total_cost_usd += row.cost_usd || 0;
    }

    return res.json(Object.values(stats));
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

async function handleProviderStats(req: ApiRequest, res: ApiResponse, supabase: any) {
  const providerId = req.query.provider_id as string;
  const days = parseInt(req.query.days as string) || 7;

  if (!providerId) {
    return res.status(400).json({ error: 'provider_id required' });
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    const { data, error } = await supabase
      .from('ai_usage_log')
      .select('*')
      .eq('provider_id', providerId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json(data || []);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

async function handleRoutingConfig(_req: ApiRequest, res: ApiResponse, supabase: any) {
  try {
    // Get enabled providers
    const { data: providers, error: pError } = await supabase
      .from('ai_providers')
      .select('*')
      .eq('enabled', true)
      .order('priority', { ascending: true });

    if (pError) throw pError;

    // Get primary model
    const { data: primaryModel, error: pmError } = await supabase
      .from('ai_models')
      .select('*')
      .eq('is_primary', true)
      .eq('enabled', true)
      .single();

    if (pmError || !primaryModel) {
      return res.status(404).json({ error: 'No primary model configured' });
    }

    // Get fallback model
    const { data: fallbackModel } = await supabase
      .from('ai_models')
      .select('*')
      .eq('is_fallback', true)
      .eq('enabled', true)
      .single();

    return res.json({
      providers: providers || [],
      primaryModel,
      fallbackModel: fallbackModel || primaryModel,
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

// ============================================================
// Secret Management Handlers
// ============================================================

async function handleSecrets(_req: ApiRequest, res: ApiResponse, supabase: any) {
  try {
    const { data, error } = await supabase
      .from('provider_secrets')
      .select('id, provider_id, secret_key, created_at, updated_at')
      .order('provider_id');

    if (error) throw error;
    return res.json(data || []);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

async function handleSecretAdd(req: ApiRequest, res: ApiResponse, supabase: any) {
  const { provider_id, secret_key, secret_value } = req.body;
  if (!provider_id || !secret_key || !secret_value) {
    return res.status(400).json({ error: 'provider_id, secret_key, and secret_value required' });
  }

  try {
    // Check if secret already exists
    const { data: existing } = await supabase
      .from('provider_secrets')
      .select('id')
      .eq('provider_id', provider_id)
      .eq('secret_key', secret_key)
      .single();

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('provider_secrets')
        .update({ 
          secret_value, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      // Insert new
      const { error } = await supabase
        .from('provider_secrets')
        .insert({
          provider_id,
          secret_key,
          secret_value,
        });

      if (error) throw error;
    }

    invalidateCache();
    return res.json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

async function handleSecretUpdate(req: ApiRequest, res: ApiResponse, supabase: any) {
  const { id, secret_value } = req.body;
  if (!id || !secret_value) {
    return res.status(400).json({ error: 'id and secret_value required' });
  }

  try {
    const { error } = await supabase
      .from('provider_secrets')
      .update({ 
        secret_value, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id);

    if (error) throw error;
    invalidateCache();
    return res.json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

async function handleSecretDelete(req: ApiRequest, res: ApiResponse, supabase: any) {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'id required' });
  }

  try {
    const { error } = await supabase
      .from('provider_secrets')
      .delete()
      .eq('id', id);

    if (error) throw error;
    invalidateCache();
    return res.json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

// ============================================================
// Model Auto-Detection
// ============================================================

type DetectedModel = {
  model_id: string;
  display_name: string;
  provider_id: string;
  available: boolean;
  description?: string;
  context_window?: number;
};

async function detectGeminiModels(apiKey: string): Promise<DetectedModel[]> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      { signal: AbortSignal.timeout(15000) }
    );
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${response.status}`);
    }
    const data = await response.json();
    return (data.models || []).map((m: any) => ({
      model_id: m.name?.replace('models/', '') || '',
      display_name: m.displayName || m.name?.replace('models/', '') || '',
      provider_id: 'gemini',
      available: true,
      description: m.description || '',
      context_window: m.inputTokenLimit || undefined,
    })).filter((m: DetectedModel) => m.model_id);
  } catch (e: any) {
    throw new Error(`Gemini model detection failed: ${e.message}`);
  }
}

async function detectOpenAICompatibleModels(
  baseUrl: string,
  apiKey: string,
  providerId: string
): Promise<DetectedModel[]> {
  try {
    const url = joinCustomProviderUrl(baseUrl, '/v1/models');
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${response.status}`);
    }
    const data = await response.json();
    return (data.data || []).map((m: any) => ({
      model_id: m.id || '',
      display_name: m.id || '',
      provider_id: providerId,
      available: true,
      description: m.owned_by || '',
    })).filter((m: DetectedModel) => m.model_id);
  } catch (e: any) {
    throw new Error(`${providerId} model detection failed: ${e.message}`);
  }
}

async function getStoredProviderApiKey(supabase: any, providerId: string): Promise<string | null> {
  const { data } = await supabase
    .from('provider_secrets')
    .select('secret_value')
    .eq('provider_id', providerId)
    .eq('secret_key', 'api_key')
    .maybeSingle();
  return data?.secret_value || null;
}

async function handleDetectModels(req: ApiRequest, res: ApiResponse, supabase: any) {
  const { provider_id, api_key } = req.body;
  if (!provider_id) {
    return res.status(400).json({ error: 'provider_id required' });
  }

  try {
    const key = api_key || await getStoredProviderApiKey(supabase, provider_id);
    if (!key) return res.status(400).json({ error: 'No saved API key available for this provider' });

    let models: DetectedModel[] = [];

    if (provider_id === 'gemini') {
      models = await detectGeminiModels(key);
    } else if (['deepseek', 'openai', 'mimo', 'qwen'].includes(provider_id)) {
      const endpoints: Record<string, string> = {
        deepseek: 'https://api.deepseek.com',
        openai: 'https://api.openai.com',
        mimo: 'https://api.xiaomimimo.com',
        qwen: 'https://dashscope.aliyuncs.com/compatible-mode',
      };
      models = await detectOpenAICompatibleModels(endpoints[provider_id] || '', key, provider_id);
    } else {
      // Custom provider: try OpenAI-compatible /v1/models
      const { data: cp } = await supabase
        .from('custom_providers')
        .select('base_url')
        .eq('id', provider_id)
        .maybeSingle();
      if (cp?.base_url) {
        models = await detectOpenAICompatibleModels(cp.base_url, key, provider_id);
      } else {
        return res.status(400).json({ error: 'Unknown provider and no custom provider config found' });
      }
    }

    return res.json({ models, count: models.length });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

// ============================================================
// Provider Health Check
// ============================================================

type ProviderRuntimeStatus = 'ACTIVE' | 'MISSING_KEY' | 'INVALID_KEY' | 'UNREACHABLE' | 'RATE_LIMITED' | 'DISABLED';

interface HealthCheckResult {
  provider: string;
  name: string;
  enabled: boolean;
  key_exists: boolean;
  runtime_status: ProviderRuntimeStatus;
  latency_ms: number | null;
  checked_at: string;
  error_message: string | null;
  key_source?: string;
}

const PROVIDER_ENDPOINTS: Record<string, string> = {
  deepseek: 'https://api.deepseek.com/v1/chat/completions',
  mimo: 'https://api.xiaomimimo.com/v1/chat/completions',
  gemini: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
  openai: 'https://api.openai.com/v1/chat/completions',
  claude: 'https://api.anthropic.com/v1/messages',
  qwen: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
};

async function validateProviderKey(providerId: string, apiKey: string): Promise<{ success: boolean; latency_ms: number; error: string | null }> {
  const startTime = Date.now();
  const endpoint = PROVIDER_ENDPOINTS[providerId];
  
  if (!endpoint) {
    return { success: false, latency_ms: 0, error: 'Unknown provider endpoint' };
  }

  try {
    let response: Response;
    
    if (providerId === 'gemini') {
      // Gemini uses GET with key param
      response = await fetch(`${endpoint}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Hi' }] }],
          generationConfig: { maxOutputTokens: 5 }
        }),
        signal: AbortSignal.timeout(10000),
      });
    } else if (providerId === 'claude') {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-4-sonnet',
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 5,
        }),
        signal: AbortSignal.timeout(10000),
      });
    } else {
      // OpenAI-compatible (DeepSeek, MiMo, OpenAI, Qwen)
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: providerId === 'deepseek' ? 'deepseek-v4-flash' :
                 providerId === 'mimo' ? 'mimo-v2-flash' :
                 providerId === 'qwen' ? 'qwen-turbo' : 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 5,
        }),
        signal: AbortSignal.timeout(10000),
      });
    }

    const latency_ms = Date.now() - startTime;
    
    if (response.status === 429) {
      return { success: false, latency_ms, error: 'Rate limited (429)' };
    }
    
    if (response.status === 401 || response.status === 403) {
      return { success: false, latency_ms, error: `Auth error (${response.status})` };
    }
    
    if (!response.ok) {
      return { success: false, latency_ms, error: `HTTP ${response.status}` };
    }

    return { success: true, latency_ms, error: null };
  } catch (error: any) {
    const latency_ms = Date.now() - startTime;
    if (error.name === 'TimeoutError' || error.code === 'ABORT_ERR') {
      return { success: false, latency_ms, error: 'Timeout (10s)' };
    }
    return { success: false, latency_ms, error: error.message };
  }
}

async function handleHealthCheck(_req: ApiRequest, res: ApiResponse, supabase: any) {
  try {
    // Get all providers
    const { data: providers, error: pError } = await supabase
      .from('ai_providers')
      .select('*')
      .order('priority', { ascending: true });

    if (pError) throw pError;

    const results: HealthCheckResult[] = [];

    for (const provider of providers || []) {
      // Check if key exists — match ai-router.ts logic (db + env var)
      const { data: secret } = await supabase
        .from('provider_secrets')
        .select('secret_value')
        .eq('provider_id', provider.id)
        .eq('secret_key', 'api_key')
        .maybeSingle();

      const envKey = `${provider.id.toUpperCase()}_API_KEY`;
      const envValue = process.env[envKey];
      const key_exists = !!(secret?.secret_value || envValue);
      const key_source = secret?.secret_value ? 'database' : envValue ? 'env_var' : 'none';
      
      if (!provider.enabled) {
        results.push({
          provider: provider.id,
          name: provider.name,
          enabled: false,
          key_exists,
          runtime_status: 'DISABLED',
          latency_ms: null,
          checked_at: new Date().toISOString(),
          error_message: null,
          key_source,
        });
        continue;
      }

      if (!key_exists) {
        results.push({
          provider: provider.id,
          name: provider.name,
          enabled: true,
          key_exists: false,
          runtime_status: 'MISSING_KEY',
          latency_ms: null,
          checked_at: new Date().toISOString(),
          error_message: 'No API key configured',
          key_source: 'none',
        });
        continue;
      }

      // Validate key
      const actualKey = secret?.secret_value || envValue!;
      const validation = await validateProviderKey(provider.id, actualKey);
      
      let runtime_status: ProviderRuntimeStatus;
      if (validation.success) {
        runtime_status = 'ACTIVE';
      } else if (validation.error?.includes('429')) {
        runtime_status = 'RATE_LIMITED';
      } else if (validation.error?.includes('Auth') || validation.error?.includes('401') || validation.error?.includes('403')) {
        runtime_status = 'INVALID_KEY';
      } else {
        runtime_status = 'UNREACHABLE';
      }

      results.push({
        provider: provider.id,
        name: provider.name,
        enabled: true,
        key_exists: true,
        runtime_status,
        latency_ms: validation.latency_ms,
        checked_at: new Date().toISOString(),
        error_message: validation.error,
        key_source,
      });
    }

    // Summary
    const summary = {
      total: results.length,
      active: results.filter(r => r.runtime_status === 'ACTIVE').length,
      missing_key: results.filter(r => r.runtime_status === 'MISSING_KEY').length,
      invalid_key: results.filter(r => r.runtime_status === 'INVALID_KEY').length,
      unreachable: results.filter(r => r.runtime_status === 'UNREACHABLE').length,
      rate_limited: results.filter(r => r.runtime_status === 'RATE_LIMITED').length,
      disabled: results.filter(r => r.runtime_status === 'DISABLED').length,
      avg_latency_ms: results.filter(r => r.latency_ms).length > 0
        ? Math.round(results.filter(r => r.latency_ms).reduce((sum, r) => sum + (r.latency_ms || 0), 0) / results.filter(r => r.latency_ms).length)
        : null,
    };

    return res.json({ providers: results, summary });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

async function handleValidateProvider(req: ApiRequest, res: ApiResponse, supabase: any) {
  const { provider_id } = req.body;
  if (!provider_id) {
    return res.status(400).json({ error: 'provider_id required' });
  }

  try {
    // Get provider
    const { data: provider, error: pError } = await supabase
      .from('ai_providers')
      .select('*')
      .eq('id', provider_id)
      .single();

    if (pError || !provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    // Get key
    const { data: secret } = await supabase
      .from('provider_secrets')
      .select('secret_value')
      .eq('provider_id', provider_id)
      .eq('secret_key', 'api_key')
      .single();

    if (!secret?.secret_value) {
      return res.json({
        provider: provider_id,
        runtime_status: 'MISSING_KEY',
        latency_ms: null,
        checked_at: new Date().toISOString(),
        error_message: 'No API key configured',
      });
    }

    // Validate
    const validation = await validateProviderKey(provider_id, secret.secret_value);
    
    let runtime_status: ProviderRuntimeStatus;
    if (validation.success) {
      runtime_status = 'ACTIVE';
    } else if (validation.error?.includes('429')) {
      runtime_status = 'RATE_LIMITED';
    } else if (validation.error?.includes('Auth') || validation.error?.includes('401') || validation.error?.includes('403')) {
      runtime_status = 'INVALID_KEY';
    } else {
      runtime_status = 'UNREACHABLE';
    }

    return res.json({
      provider: provider_id,
      runtime_status,
      latency_ms: validation.latency_ms,
      checked_at: new Date().toISOString(),
      error_message: validation.error,
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
