import { runMiddleware, authMiddleware, adminMiddleware, getDb } from '../utils';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    await runMiddleware(req, res, authMiddleware);
    await runMiddleware(req, res, adminMiddleware);
    
    const { targetUserId, tier } = req.body;
    const expiry = tier !== 'free' ? Date.now() + 30 * 24 * 60 * 60 * 1000 : null; // 30 days
    await getDb().collection('users').doc(targetUserId).set({ tier, tierExpiry: expiry }, { merge: true });
    res.json({ success: true });
  } catch (e: any) {
    if (!res.headersSent) res.status(500).json({ error: e.message });
  }
}
