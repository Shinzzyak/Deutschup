import { runMiddleware, authMiddleware, adminMiddleware, getDb } from '../lib/api-utils.js';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  const action = req.query.action;

  // === action=debug (unprotected, just auth) ===
  if (action === 'debug') {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    try {
      await runMiddleware(req, res, authMiddleware);
      const user = req.user;
      const adminEmailEnv = process.env.ADMIN_EMAIL;

      let dbRole = 'unknown';
      let dbError = null;
      if (user?.id) {
        try {
          const { data, error } = await getDb().from('profiles').select('role').eq('id', user.id).single();
          if (error) dbError = error.message;
          else dbRole = data?.role || 'not found';
        } catch (e: any) {
          dbError = e.message;
        }
      }

      return res.json({
        status: 'Debug',
        auth: {
          isAuthenticated: !!user,
          userEmail: user?.email || 'No email',
          userId: user?.id || 'No ID',
        },
        env: {
          adminEmailSet: !!adminEmailEnv,
          adminEmailValue: adminEmailEnv
            ? `${adminEmailEnv.substring(0, 3)}...${adminEmailEnv.slice(-4)}`
            : 'NOT SET',
        },
        database: { role: dbRole, error: dbError },
        logic: {
          emailMatch:
            adminEmailEnv &&
            user?.email &&
            adminEmailEnv.toLowerCase().trim() === user.email.toLowerCase().trim(),
          isDbAdmin: dbRole === 'admin',
          finalDecision:
            (adminEmailEnv && user?.email && adminEmailEnv.toLowerCase().trim() === user.email.toLowerCase().trim()) ||
            dbRole === 'admin'
              ? 'GRANTED'
              : 'DENIED',
        },
      });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  // === Protected actions ===
  try {
    await runMiddleware(req, res, authMiddleware);
    await runMiddleware(req, res, adminMiddleware);
  } catch (e: any) {
    if (!res.headersSent) return res.status(401).json({ error: e.message });
    return;
  }

  // === action=users ===
  if (action === 'users') {
    if (req.method === 'GET') {
      const { data: profiles, error } = await getDb()
        .from('profiles')
        .select('id, tier, tier_expiry, role, subscription, pro_expires_at, created_at')
        .order('created_at', { ascending: false });
      if (error) return res.status(500).json({ error: error.message });

      // Filter out admin users from list
      const filtered = profiles || [];

      return res.json(filtered);
    }

    if (req.method === 'POST') {
      const { targetUserId, tier, role, subscription } = req.body;
      const updateData: any = {};
      if (tier) {
        updateData.tier = tier;
        updateData.tier_expiry =
          tier !== 'free'
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            : null;
        // Also sync new subscription fields
        updateData.subscription = tier === 'pro' ? 'pro' : 'free';
        updateData.pro_expires_at =
          tier === 'pro'
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            : null;
      }
      if (subscription) {
        updateData.subscription = subscription;
        if (subscription === 'free') updateData.pro_expires_at = null;
      }
      if (role) updateData.role = role;
      updateData.updated_at = new Date().toISOString();
      const { error } = await getDb()
        .from('profiles')
        .update(updateData)
        .eq('id', targetUserId);
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true });
    }
  }

  // === action=config ===
  if (action === 'config') {
    if (req.method === 'GET') {
      const { data, error } = await getDb()
        .from('config')
        .select('*')
        .eq('key', 'global')
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }

    if (req.method === 'POST') {
      const { geminiApiKey } = req.body;
      const { error } = await getDb()
        .from('config')
        .upsert({ key: 'global', geminiApiKey });
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true });
    }
  }

  // === action=check ===
  if (!action || action === 'check') {
    if (req.method === 'GET') return res.json({ ok: true });
  }

  return res
    .status(404)
    .json({ error: 'Admin endpoint not found', debug: { action, method: req.method, url: req.url } });
}
