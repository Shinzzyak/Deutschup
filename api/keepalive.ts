import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdminClient } from '../lib/api-utils.js';

const SECRET = process.env.KEEPALIVE_SECRET || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', 'https://deutschup.sintec.my.id');
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-keepalive-secret');
    return res.status(200).end();
  }
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify keepalive secret
  const headerSecret = req.headers['x-keepalive-secret'] as string;
  if (!SECRET || headerSecret !== SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const db = getSupabaseAdminClient();
    const { data, error } = await db.rpc('ping');

    if (error) {
      console.error('[KeepAlive] Ping failed:', error);
      return res.status(500).json({ ok: false, error: error.message });
    }

    return res.json({ ok: true, time: data });
  } catch (err: any) {
    console.error('[KeepAlive] Error:', err.message);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
