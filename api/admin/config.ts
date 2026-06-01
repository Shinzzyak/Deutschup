import { runMiddleware, authMiddleware, adminMiddleware, getDb } from '../_utils.js';

export default async function handler(req: any, res: any) {
  try {
    await runMiddleware(req, res, authMiddleware);
    await runMiddleware(req, res, adminMiddleware);

    if (req.method === 'GET') {
      const { data, error } = await getDb()
        .from('config')
        .select('*')
        .eq('key', 'global')
        .single();
      if (error) throw error;
      return res.json(data);
    } else if (req.method === 'PATCH') {
      const { geminiApiKey } = req.body;
      const { error } = await getDb()
        .from('config')
        .upsert({ key: 'global', geminiApiKey });
      if (error) throw error;
      return res.json({ success: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (e: any) {
    if (!res.headersSent) res.status(500).json({ error: e.message });
  }
}
