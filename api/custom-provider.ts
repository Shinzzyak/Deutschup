import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { invalidateCache } from '../lib/ai-router.js';
import { isVerifiedAdmin } from '../lib/api-utils.js';

function getSupabaseAdmin() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
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
        return res.json({ provider: data });
      }

      case 'delete-provider': {
        const { id } = req.body;
        if (!id) return res.status(400).json({ error: 'id required' });
        const { error } = await supabase.from('custom_providers').delete().eq('id', id);
        if (error) throw error;
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
        const { data, error } = await supabase
          .from('custom_models')
          .upsert({ id, provider_id, model_id, display_name, config: config || {} })
          .select()
          .single();
        if (error) throw error;
        return res.json({ model: data });
      }

      case 'delete-model': {
        const { id } = req.body;
        if (!id) return res.status(400).json({ error: 'id required' });
        const { error } = await supabase.from('custom_models').delete().eq('id', id);
        if (error) throw error;
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
