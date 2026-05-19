import { runMiddleware, authMiddleware, adminMiddleware, getDb } from '../utils';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    await runMiddleware(req, res, authMiddleware);
    await runMiddleware(req, res, adminMiddleware);
    
    const { geminiApiKey } = req.body;
    await getDb().collection('config').doc('global').set({ geminiApiKey }, { merge: true });
    return res.json({ success: true });
  } catch (e: any) {
    if (!res.headersSent) res.status(500).json({ error: e.message });
  }
}
