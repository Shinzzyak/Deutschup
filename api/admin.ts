import type { VercelRequest, VercelResponse } from '@vercel/node';
import { runMiddleware, authMiddleware, getSupabaseAdminClient } from '../lib/api-utils.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  try {
    await runMiddleware(req, res, authMiddleware);
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const action = req.query.action as string;

  switch (action) {
    case 'env-check':
      return handleEnvCheck(req, res);
    case 'system-health':
      return handleSystemHealth(req, res);
    case 'stats':
      return handleStats(req, res);
    case 'update-role':
      return handleUpdateRole(req, res);
    case 'toggle-pro':
      return handleTogglePro(req, res);
    default:
      return res.status(400).json({ error: 'Invalid admin action' });
  }
}

function handleEnvCheck(_req: VercelRequest, res: VercelResponse) {
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

function handleSystemHealth(_req: VercelRequest, res: VercelResponse) {
  return res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    config: {
      paymentConfigured: !!(process.env.BAYAR_GG_API_KEY && process.env.BAYAR_GG_API_KEY.length > 10),
      aiConfigured: !!(process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY),
      databaseConfigured: !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
      webhookConfigured: !!process.env.BAYARGG_WEBHOOK_SECRET,
    },
    version: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
  });
}

async function handleStats(_req: VercelRequest, res: VercelResponse) {
  try {
    const supabase = getSupabaseAdminClient();
    const today = new Date().toISOString().split('T')[0];
    
    const { data: todayStats } = await supabase
      .from('ai_requests')
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

async function handleUpdateRole(req: VercelRequest, res: VercelResponse) {
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

async function handleTogglePro(req: VercelRequest, res: VercelResponse) {
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
      .single();

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
