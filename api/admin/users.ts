import { runMiddleware, authMiddleware, adminMiddleware, getDb } from '../_utils.js';

export default async function handler(req: any, res: any) {
  try {
    await runMiddleware(req, res, authMiddleware);
    await runMiddleware(req, res, adminMiddleware);

    if (req.method === 'GET') {
      const { data, error } = await getDb()
        .from('profiles')
        .select('*, auth.users(email)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.json(data);
    }

    if (req.method === 'PATCH') {
      const { targetUserId, tier, role } = req.body;
      const updateData: any = {};
      if (tier) {
        updateData.tier = tier;
        updateData.tierExpiry = tier !== 'free'
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          : null;
      }
      if (role) updateData.role = role;
      const { error } = await getDb()
        .from('profiles')
        .update(updateData)
        .eq('id', targetUserId);
      if (error) throw error;
      return res.json({ success: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (e: any) {
    if (!res.headersSent) res.status(500).json({ error: e.message });
  }
}
