import { runMiddleware, authMiddleware, adminMiddleware, getDb } from '../utils';

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      await runMiddleware(req, res, authMiddleware);
      await runMiddleware(req, res, adminMiddleware);
      
      const { data, error } = await getDb()
        .from('config')
        .select('*')
        .eq('key', 'global')
        .single();

      if (error) throw error;
      return res.json(data);
    } catch (e: any) {
      if (!res.headersSent) res.status(500).json({ error: e.message });
    }
  } else if (req.method === 'PATCH') {
    try {
      await runMiddleware(req, res, authMiddleware);
      await runMiddleware(req, res, adminMiddleware);
      
      const { geminiApiKey } = req.body;
      const { error } = await getDb()
        .from('config')
        .upsert({ key: 'global', geminiApiKey });

      if (error) throw error;
      return res.json({ success: true });
    } catch (e: any) {
      if (!res.headersSent) res.status(500).json({ error: e.message });
    }
  } else {
    res.status(405).end();
  }
}
