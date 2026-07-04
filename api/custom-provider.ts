import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { invalidateCache } from '../lib/ai-router.js';
import { isVerifiedAdmin } from '../lib/api-utils.js';

function getSupabaseAdmin() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

type DetectedModel = {
  model_id: string;
  display_name: string;
  provider_id: string;
  available: boolean;
  description?: string;
  context_window?: number;
};

function joinUrl(baseUrl: string, endpoint: string) {
  if (/^https?:\/\//i.test(endpoint)) return endpoint;
  return `${baseUrl.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`;
}

function buildProviderHeaders(provider: any, apiKey: string): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (provider.auth_type === 'bearer') {
    headers['Authorization'] = `Bearer ${apiKey}`;
  } else if (provider.auth_type === 'x-api-key') {
    headers[provider.auth_header || 'X-API-Key'] = apiKey;
  }
  if (provider.config?.headers) Object.assign(headers, provider.config.headers);
  return headers;
}

async function getActiveKey(supabase: any, providerId: string): Promise<string | null> {
  const { data } = await supabase
    .from('custom_provider_keys')
    .select('api_key')
    .eq('provider_id', providerId)
    .eq('is_active', true)
    .order('priority', { ascending: true })
    .limit(1)
    .maybeSingle();
  return data?.api_key || null;
}

async function syncProviderToRouting(supabase: any, provider: any) {
  const config = {
    ...(provider.config || {}),
    source: 'custom_provider',
    baseUrl: provider.base_url,
    authType: provider.auth_type,
    authHeader: provider.auth_header,
    apiFormat: provider.api_format,
    chatEndpoint: provider.chat_endpoint,
  };

  const { data: existing } = await supabase
    .from('ai_providers')
    .select('id, config')
    .eq('id', provider.id)
    .maybeSingle();

  if (existing && existing.config?.source !== 'custom_provider') {
    throw new Error(`Provider ID "${provider.id}" conflicts with an existing built-in provider`);
  }

  if (!existing) {
    const { error } = await supabase.from('ai_providers').insert({
      id: provider.id,
      name: provider.name,
      enabled: provider.enabled ?? true,
      priority: provider.priority ?? 50,
      status: provider.enabled === false ? 'disabled' : 'active',
      config,
    });
    if (error) throw error;
    return;
  }

  const { error } = await supabase
    .from('ai_providers')
    .update({
      name: provider.name,
      enabled: provider.enabled ?? true,
      priority: provider.priority ?? 50,
      status: provider.enabled === false ? 'disabled' : 'active',
      config,
      updated_at: new Date().toISOString(),
    })
    .eq('id', provider.id);
  if (error) throw error;
}

async function syncModelToRouting(supabase: any, provider: any, model: { id: string; model_id: string; display_name: string; config?: any }) {
  await syncProviderToRouting(supabase, provider);
  const { error } = await supabase.from('ai_models').upsert({
    id: model.id,
    provider_id: provider.id,
    name: model.model_id,
    display_name: model.display_name || model.model_id,
    enabled: true,
    config: {
      ...(model.config || {}),
      source: 'custom_provider',
      customProviderId: provider.id,
      customModelId: model.id,
    },
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' });
  if (error) throw error;
}

function normalizeDetectedModels(providerId: string, payload: any): DetectedModel[] {
  const rows = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.models)
      ? payload.models
      : Array.isArray(payload)
        ? payload
        : [];

  return rows.map((m: any) => {
    const rawName = typeof m?.name === 'string' ? m.name.replace(/^models\//, '') : '';
    const modelId = m?.id || m?.model_id || m?.model || rawName;
    const displayName = m?.display_name || m?.displayName || m?.name || modelId;
    return {
      model_id: String(modelId || '').trim(),
      display_name: String(displayName || modelId || '').replace(/^models\//, '').trim(),
      provider_id: providerId,
      available: true,
      description: m?.description || m?.owned_by || m?.object || '',
      context_window: m?.context_window || m?.context_length || m?.inputTokenLimit || undefined,
    };
  }).filter((m: DetectedModel) => m.model_id);
}

async function detectProviderModels(provider: any, apiKey: string): Promise<DetectedModel[]> {
  const endpoint = provider.models_endpoint || '/models';
  const url = joinUrl(provider.base_url, endpoint);
  const response = await fetch(url, {
    headers: buildProviderHeaders(provider, apiKey),
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Model discovery failed (${response.status}): ${errText.slice(0, 220) || response.statusText}`);
  }

  const payload = await response.json();
  return normalizeDetectedModels(provider.id, payload);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', 'https://deutschup.sintec.my.id');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const action = (req.query.action as string) || req.body?.action;
  if (!action) return res.status(400).json({ error: 'Missing action' });

  if (!(await isVerifiedAdmin(req))) {
    return res.status(403).json({ error: 'Forbidden: Admin privileges required' });
  }

  const supabase = getSupabaseAdmin();

  try {
    switch (action) {
      // ── Providers ──
      case 'list-providers': {
        const { data, error } = await supabase
          .from('custom_providers')
          .select('*')
          .order('priority', { ascending: true });
        if (error) throw error;
        return res.json({ providers: data });
      }

      case 'create-provider': {
        const { id, name, base_url, auth_type, auth_header, api_format, chat_endpoint, priority, config } = req.body;
        if (!id || !name || !base_url) {
          return res.status(400).json({ error: 'id, name, base_url required' });
        }
        const { data, error } = await supabase
          .from('custom_providers')
          .upsert({
            id,
            name,
            base_url,
            auth_type: auth_type || 'bearer',
            auth_header: auth_header || 'Authorization',
            api_format: api_format || 'openai',
            chat_endpoint: chat_endpoint || '/chat/completions',
            priority: priority ?? 50,
            config: config || {},
          })
          .select()
          .single();
        if (error) throw error;
        await syncProviderToRouting(supabase, data);
        invalidateCache();
        return res.json({ provider: data });
      }

      case 'update-provider': {
        const { id, ...updates } = req.body;
        if (!id) return res.status(400).json({ error: 'id required' });
        const { data, error } = await supabase
          .from('custom_providers')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        await syncProviderToRouting(supabase, data);
        invalidateCache();
        return res.json({ provider: data });
      }

      case 'delete-provider': {
        const { id } = req.body;
        if (!id) return res.status(400).json({ error: 'id required' });
        const { error } = await supabase.from('custom_providers').delete().eq('id', id);
        if (error) throw error;
        await supabase.from('ai_models').delete().eq('provider_id', id).contains('config', { source: 'custom_provider' });
        await supabase.from('ai_providers').delete().eq('id', id).contains('config', { source: 'custom_provider' });
        invalidateCache();
        return res.json({ ok: true });
      }

      // ── Models ──
      case 'list-models': {
        const { provider_id } = req.query;
        let q = supabase.from('custom_models').select('*').order('display_name');
        if (provider_id) q = q.eq('provider_id', provider_id);
        const { data, error } = await q;
        if (error) throw error;
        return res.json({ models: data });
      }

      case 'create-model': {
        const { id, provider_id, model_id, display_name, config } = req.body;
        if (!id || !provider_id || !model_id || !display_name) {
          return res.status(400).json({ error: 'id, provider_id, model_id, display_name required' });
        }
        const { data: provider, error: providerError } = await supabase
          .from('custom_providers')
          .select('*')
          .eq('id', provider_id)
          .single();
        if (providerError || !provider) return res.status(404).json({ error: 'Provider not found' });

        const { data, error } = await supabase
          .from('custom_models')
          .upsert({ id, provider_id, model_id, display_name, config: config || {} })
          .select()
          .single();
        if (error) throw error;
        await syncModelToRouting(supabase, provider, data);
        invalidateCache();
        return res.json({ model: data });
      }

      case 'detect-models': {
        const provider_id = (req.query.provider_id as string) || req.body?.provider_id;
        const api_key = req.body?.api_key;
        if (!provider_id) return res.status(400).json({ error: 'provider_id required' });

        const { data: provider, error: providerError } = await supabase
          .from('custom_providers')
          .select('*')
          .eq('id', provider_id)
          .single();
        if (providerError || !provider) return res.status(404).json({ error: 'Provider not found' });

        const key = api_key || await getActiveKey(supabase, provider_id);
        if (!key) return res.status(400).json({ error: 'No active API key available for this provider' });

        const models = await detectProviderModels(provider, key);
        return res.json({ models, count: models.length, provider_id });
      }

      case 'import-models': {
        const { provider_id, models = [] } = req.body;
        if (!provider_id || !Array.isArray(models) || models.length === 0) {
          return res.status(400).json({ error: 'provider_id and non-empty models array required' });
        }

        const { data: provider, error: providerError } = await supabase
          .from('custom_providers')
          .select('*')
          .eq('id', provider_id)
          .single();
        if (providerError || !provider) return res.status(404).json({ error: 'Provider not found' });

        const rows = models.map((model: any) => {
          const modelId = String(model.model_id || model.id || '').trim();
          if (!modelId) return null;
          return {
            id: `${provider_id}-${modelId}`.replace(/[^a-zA-Z0-9._-]/g, '-'),
            provider_id,
            model_id: modelId,
            display_name: String(model.display_name || model.name || modelId),
            config: {
              source: 'detected',
              description: model.description || '',
              context_window: model.context_window || null,
            },
          };
        }).filter(Boolean);

        if (rows.length === 0) return res.status(400).json({ error: 'No valid models to import' });

        const { data, error } = await supabase
          .from('custom_models')
          .upsert(rows, { onConflict: 'id' })
          .select();
        if (error) throw error;

        for (const model of data || []) {
          await syncModelToRouting(supabase, provider, model);
        }
        invalidateCache();
        return res.json({ models: data || [], count: data?.length || 0 });
      }

      case 'delete-model': {
        const { id } = req.body;
        if (!id) return res.status(400).json({ error: 'id required' });
        const { error } = await supabase.from('custom_models').delete().eq('id', id);
        if (error) throw error;
        await supabase.from('ai_models').delete().eq('id', id).contains('config', { source: 'custom_provider' });
        invalidateCache();
        return res.json({ ok: true });
      }

      case 'set-primary-model': {
        const { id, provider_id } = req.body;
        if (!id || !provider_id) return res.status(400).json({ error: 'id, provider_id required' });
        // Clear all primary for this provider
        await supabase.from('custom_models').update({ is_primary: false }).eq('provider_id', provider_id);
        // Set new primary
        const { data, error } = await supabase
          .from('custom_models')
          .update({ is_primary: true })
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        invalidateCache();
        return res.json({ model: data });
      }

      // ── Keys ──
      case 'list-keys': {
        const { provider_id } = req.query;
        let q = supabase.from('custom_provider_keys').select('id, provider_id, key_name, is_active, priority, status, last_checked, requests_today, created_at');
        if (provider_id) q = q.eq('provider_id', provider_id);
        const { data, error } = await q;
        if (error) throw error;
        return res.json({ keys: data });
      }

      case 'add-key': {
        const { provider_id, key_name, api_key, priority } = req.body;
        if (!provider_id || !api_key) {
          return res.status(400).json({ error: 'provider_id, api_key required' });
        }
        const { data, error } = await supabase
          .from('custom_provider_keys')
          .insert({
            provider_id,
            key_name: key_name || 'default',
            api_key,
            priority: priority ?? 1,
          })
          .select('id, provider_id, key_name, is_active, priority, status, created_at')
          .single();
        if (error) throw error;
        invalidateCache();
        return res.json({ key: data });
      }

      case 'delete-key': {
        const { id } = req.body;
        if (!id) return res.status(400).json({ error: 'id required' });
        const { error } = await supabase.from('custom_provider_keys').delete().eq('id', id);
        if (error) throw error;
        invalidateCache();
        return res.json({ ok: true });
      }

      case 'test-key': {
        const { provider_id, api_key } = req.body;
        if (!provider_id) return res.status(400).json({ error: 'provider_id required' });

        // Get provider config
        const { data: provider, error: pErr } = await supabase
          .from('custom_providers')
          .select('*')
          .eq('id', provider_id)
          .single();
        if (pErr || !provider) return res.status(404).json({ error: 'Provider not found' });

        const key = api_key || (await supabase
          .from('custom_provider_keys')
          .select('api_key')
          .eq('provider_id', provider_id)
          .eq('is_active', true)
          .order('priority')
          .limit(1)
          .single()
        )?.data?.api_key;

        if (!key) return res.status(400).json({ error: 'No API key available' });

        // Build auth header
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (provider.auth_type === 'bearer') {
          headers['Authorization'] = `Bearer ${key}`;
        } else if (provider.auth_type === 'x-api-key') {
          headers[provider.auth_header || 'X-API-Key'] = key;
        }

        // Test with a minimal chat request
        const testUrl = `${provider.base_url}${provider.chat_endpoint}`;
        const testBody = provider.api_format === 'gemini'
          ? { contents: [{ parts: [{ text: 'Say hi' }] }] }
          : { model: 'gpt-3.5-turbo', messages: [{ role: 'user', content: 'Say hi' }], max_tokens: 5 };

        const startTime = Date.now();
        try {
          const resp = await fetch(testUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(testBody),
            signal: AbortSignal.timeout(15000),
          });
          const latencyMs = Date.now() - startTime;

          if (!resp.ok) {
            const errText = await resp.text().catch(() => '');
            return res.json({ ok: false, status: resp.status, error: errText.slice(0, 200), latencyMs });
          }

          return res.json({ ok: true, status: resp.status, latencyMs });
        } catch (e: any) {
          return res.json({ ok: false, error: e.message, latencyMs: Date.now() - startTime });
        }
      }

      // ── Combined ──
      case 'full-config': {
        const [providers, models, keys] = await Promise.all([
          supabase.from('custom_providers').select('*').order('priority'),
          supabase.from('custom_models').select('*').order('display_name'),
          supabase.from('custom_provider_keys').select('id, provider_id, key_name, is_active, priority, status, last_checked, requests_today, created_at'),
        ]);
        return res.json({
          providers: providers.data || [],
          models: models.data || [],
          keys: keys.data || [],
        });
      }

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (error: any) {
    console.error(`[CUSTOM-PROVIDER] ${action}:`, error.message);
    return res.status(500).json({ error: error.message });
  }
}
