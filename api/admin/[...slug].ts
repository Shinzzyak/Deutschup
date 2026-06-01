import { runMiddleware, authMiddleware, adminMiddleware, getDb } from '../_utils.js';

export default async function handler(req: any, res: any) {
  // CORS preflight — OPTIONS gak perlu auth
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  const { slug } = req.query;
  const path = Array.isArray(slug) ? slug.join('/') : slug;

  try {
    await runMiddleware(req, res, authMiddleware);
    await runMiddleware(req, res, adminMiddleware);

    if (path === 'users') {
      if (req.method === 'GET') {
        const { data, error } = await getDb()
          .from('profiles')
          .select('*, auth.users(email)')
          .order('created_at', { ascending: false });
        if (error) throw error;
        return res.json(data);
      } else if (req.method === 'PATCH') {
        const { targetUserId, tier, role } = req.body;
        const updateData: any = {};
        if (tier) {
          updateData.tier = tier;
          updateData.tierExpiry = tier !== 'free' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null;
        }
        if (role) updateData.role = role;
        const { error } = await getDb().from('profiles').update(updateData).eq('id', targetUserId);
        if (error) throw error;
        return res.json({ success: true });
      }
    } else if (path === 'config') {
      if (req.method === 'GET') {
        const { data, error } = await getDb().from('config').select('*').eq('key', 'global').single();
        if (error) throw error;
        return res.json(data);
      } else if (req.method === 'PATCH') {
        const { geminiApiKey } = req.body;
        const { error } = await getDb().from('config').upsert({ key: 'global', geminiApiKey });
        if (error) throw error;
        return res.json({ success: true });
      }
    } else if (!path || path === 'check') {
      if (req.method === 'GET') return res.json({ ok: true });
    }

    res.status(404).json({ error: 'Admin endpoint not found', debug: { path, method: req.method, slug: req.query.slug } });
  } catch (e: any) {
    if (!res.headersSent) res.status(500).json({ error: e.message });
  }
}
