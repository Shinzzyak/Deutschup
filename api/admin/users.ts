import { runMiddleware, authMiddleware, adminMiddleware, getDb } from '../utils';

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      await runMiddleware(req, res, authMiddleware);
      await runMiddleware(req, res, adminMiddleware);
      
      const { data, error } = await getDb()
        .from('profiles')
        .select('*, auth.users(email)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.json(data);
    } catch (e: any) {
      if (!res.headersSent) res.status(500).json({ error: e.message });
    }
  } else if (req.method === 'PATCH') {
    try {
      await runMiddleware(req, res, authMiddleware);
      await runMiddleware(req, res, adminMiddleware);
      
      const { targetUserId, tier, role } = req.body;
      const updateData: any = {};
      if (tier) {
        updateData.tier = tier;
        updateData.tierExpiry = tier !== 'free' ? Date.now() + 30 * 24 * 60 * 60 * 1000 : null;
      }
      if (role) updateData.role = role;

      const { error } = await getDb()
        .from('profiles')
        .update(updateData)
        .eq('id', targetUserId);

      if (error) throw error;
      res.json({ success: true });
    } catch (e: any) {
      if (!res.headersSent) res.status(500).json({ error: e.message });
    }
  } else {
    res.status(405).end();
  }
}
