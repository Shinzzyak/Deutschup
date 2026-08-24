import type { ApiRequest, ApiResponse } from '../lib/http-types.js';
import { getSupabaseAdminClient, isVerifiedAdmin } from '../lib/api-utils.js';

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

  switch (action) {
    case 'env-check':
      return handleEnvCheck(req, res);
    case 'system-health':
      return handleSystemHealth(req, res);
    case 'stats':
      return handleStats(req, res);
    case 'users':
      return req.method === 'POST'
        ? handleUpdateUser(req, res)
        : handleGetUsers(req, res);
    case 'config':
      return req.method === 'POST'
        ? handleUpdateConfig(req, res)
        : handleGetConfig(req, res);
    case 'update-role':
      return handleUpdateRole(req, res);
    case 'toggle-pro':
      return handleTogglePro(req, res);
    default:
      return res.status(400).json({ error: 'Invalid admin action' });
  }
}

function handleEnvCheck(_req: ApiRequest, res: ApiResponse) {
  return res.json({
    bayarConfigured: !!(process.env.BAYAR_GG_API_KEY && process.env.BAYAR_GG_API_KEY.length > 10),
    appUrlConfigured: !!(process.env.APP_URL && process.env.APP_URL.length > 0),
    supabaseConfigured: !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
    webhookSecretConfigured: !!process.env.BAYARGG_WEBHOOK_SECRET,
    testPaymentMode: process.env.TEST_PAYMENT_MODE === 'true',
    bayarKeyLength: process.env.BAYAR_GG_API_KEY?.length || 0,
    appUrl: process.env.APP_URL || 'NOT SET',
  });
}

async function handleSystemHealth(_req: ApiRequest, res: ApiResponse) {
  try {
    const supabase = getSupabaseAdminClient();
    
    // Check actual keys in provider_secrets table
    const { data: secrets } = await supabase
      .from('provider_secrets')
      .select('provider_id, secret_key')
      .eq('secret_key', 'api_key');

    // Check custom provider keys
    const { data: customKeys } = await supabase
      .from('custom_provider_keys')
      .select('id, provider_id, status')
      .eq('is_active', true);

    // Check enabled providers
    const { data: providers } = await supabase
      .from('ai_providers')
      .select('id, enabled')
      .eq('enabled', true);

    // Check primary model
    const { data: primaryModel } = await supabase
      .from('ai_models')
      .select('id')
      .eq('is_primary', true)
      .eq('enabled', true)
      .maybeSingle();

    const builtInKeys = secrets?.length || 0;
    const customKeyCount = customKeys?.length || 0;
    const totalKeys = builtInKeys + customKeyCount;
    const enabledProviders = providers?.length || 0;

    const aiConfigured = totalKeys > 0 && enabledProviders > 0 && !!primaryModel;

    return res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      config: {
        paymentConfigured: !!(process.env.BAYAR_GG_API_KEY && process.env.BAYAR_GG_API_KEY.length > 10),
        aiConfigured,
        databaseConfigured: !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
        webhookConfigured: !!process.env.DISCORD_WEBHOOK_URL,
      },
      ai: {
        builtInKeys,
        customKeys: customKeyCount,
        totalKeys,
        enabledProviders,
        hasPrimary: !!primaryModel,
      },
      version: process.env.CF_PAGES_COMMIT_SHA || process.env.COMMIT_SHA || 'unknown',
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

async function handleStats(_req: ApiRequest, res: ApiResponse) {
  try {
    const supabase = getSupabaseAdminClient();
    const today = new Date().toISOString().split('T')[0];
    
    const { data: todayStats } = await supabase
      .from('ai_usage_log')
      .select('*')
      .gte('created_at', `${today}T00:00:00Z`);

    const { data: recentOrders } = await supabase
      .from('orders')
      .select('id, status, amount, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    const { data: userStats } = await supabase
      .from('profiles')
      .select('id, tier, subscription');

    return res.json({
      today: {
        requests: todayStats?.length || 0,
        errors: todayStats?.filter(r => !r.success).length || 0,
      },
      recentOrders: recentOrders || [],
      users: {
        total: userStats?.length || 0,
        pro: userStats?.filter(u => u.subscription === 'pro').length || 0,
      },
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

async function handleUpdateRole(req: ApiRequest, res: ApiResponse) {
  const { userId, role } = req.body;
  if (!userId || !role) {
    return res.status(400).json({ error: 'userId and role required' });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);

    if (error) throw error;
    return res.json({ success: true, userId, role });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

async function handleTogglePro(req: ApiRequest, res: ApiResponse) {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId required' });
  }

  try {
    const supabase = getSupabaseAdminClient();
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription')
      .eq('id', userId)
      .maybeSingle();

    const newTier = profile?.subscription === 'pro' ? 'free' : 'pro';
    const expiry = newTier === 'pro' 
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const { error } = await supabase
      .from('profiles')
      .update({
        tier: newTier,
        tier_expiry: expiry,
        subscription: newTier,
        pro_expires_at: expiry,
      })
      .eq('id', userId);

    if (error) throw error;
    return res.json({ success: true, userId, subscription: newTier });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

// --- REG-006: New handlers for Admin Cockpit ---

async function handleGetUsers(_req: ApiRequest, res: ApiResponse) {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json(data || []);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

async function handleUpdateUser(req: ApiRequest, res: ApiResponse) {
  const { targetUserId, tier, subscription, role } = req.body;
  if (!targetUserId) {
    return res.status(400).json({ error: 'targetUserId required' });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const updates: Record<string, any> = {};
    
    if (tier !== undefined) updates.tier = tier;
    if (subscription !== undefined) updates.subscription = subscription;
    if (role !== undefined) updates.role = role;
    updates.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', targetUserId);

    if (error) throw error;
    return res.json({ success: true, userId: targetUserId, ...updates });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

async function handleGetConfig(_req: ApiRequest, res: ApiResponse) {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('config')
      .select('*')
      .eq('key', 'global')
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return res.json(data || { key: 'global', geminiApiKey: '' });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

async function handleUpdateConfig(req: ApiRequest, res: ApiResponse) {
  const { geminiApiKey } = req.body;
  if (geminiApiKey === undefined) {
    return res.status(400).json({ error: 'geminiApiKey required' });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
      .from('config')
      .upsert(
        { key: 'global', geminiApiKey },
        { onConflict: 'key' }
      );

    if (error) throw error;
    return res.json({ success: true, geminiApiKey });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
