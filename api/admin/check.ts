import { runMiddleware, authMiddleware, adminMiddleware } from '../utils';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).end();
  try {
    await runMiddleware(req, res, authMiddleware);
    await runMiddleware(req, res, adminMiddleware);
    return res.json({ ok: true });
  } catch (e: any) {
    if (!res.headersSent) res.status(500).json({ error: e.message });
  }
}
