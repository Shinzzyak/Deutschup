import { runMiddleware, authMiddleware, adminMiddleware } from '../_utils.js';

export default async function handler(req: any, res: any) {
  const { slug } = req.query;
  const path = Array.isArray(slug) ? slug.join('/') : slug;

  try {
    await runMiddleware(req, res, authMiddleware);
    await runMiddleware(req, res, adminMiddleware);

    if (!path || path === 'check') {
      if (req.method === 'GET') return res.json({ ok: true });
    }

    res.status(404).json({ error: 'Admin endpoint not found' });
  } catch (e: any) {
    if (!res.headersSent) res.status(500).json({ error: e.message });
  }
}
