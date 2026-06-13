import type { VercelRequest, VercelResponse } from '@vercel/node';
import { runMiddleware, authMiddleware, adminMiddleware, getSupabaseAdminClient } from '../lib/api-utils.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  try {
    await runMiddleware(req, res, authMiddleware);
    await runMiddleware(req, res, adminMiddleware);
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
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

    default:
      return res.status(400).json({ error: 'Invalid action' });
  }
}

// ============================================================
// Provider Handlers
// ============================================================

async function handleProviders(_req: VercelRequest, res: VercelResponse, supabase: any) {
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

async function handleProviderUpdate(req: VercelRequest, res: VercelResponse, supabase: any) {
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
    return res.json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

async function handleProviderToggle(req: VercelRequest, res: VercelResponse, supabase: any) {
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
    return res.json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

// ============================================================
// Model Handlers
// ============================================================

async function handleModels(_req: VercelRequest, res: VercelResponse, supabase: any) {
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

async function handleModelUpdate(req: VercelRequest, res: VercelResponse, supabase: any) {
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
    return res.json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

async function handleModelToggle(req: VercelRequest, res: VercelResponse, supabase: any) {
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
    return res.json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

async function handleSetPrimary(req: VercelRequest, res: VercelResponse, supabase: any) {
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

    // Clear all primary flags for this provider
    const { error: clearError } = await supabase
      .from('ai_models')
      .update({ is_primary: false, updated_at: new Date().toISOString() })
      .eq('provider_id', model.provider_id)
      .eq('is_primary', true);

    if (clearError) throw clearError;

    // Set new primary
    const { error } = await supabase
      .from('ai_models')
      .update({ is_primary: true, enabled: true, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    return res.json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

async function handleSetFallback(req: VercelRequest, res: VercelResponse, supabase: any) {
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

    // Clear all fallback flags for this provider
    const { error: clearError } = await supabase
      .from('ai_models')
      .update({ is_fallback: false, updated_at: new Date().toISOString() })
      .eq('provider_id', model.provider_id)
      .eq('is_fallback', true);

    if (clearError) throw clearError;

    // Set new fallback
    const { error } = await supabase
      .from('ai_models')
      .update({ is_fallback: true, enabled: true, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    return res.json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

// ============================================================
// Stats Handlers
// ============================================================

async function handleUsageStats(req: VercelRequest, res: VercelResponse, supabase: any) {
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

async function handleProviderStats(req: VercelRequest, res: VercelResponse, supabase: any) {
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

async function handleRoutingConfig(_req: VercelRequest, res: VercelResponse, supabase: any) {
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
