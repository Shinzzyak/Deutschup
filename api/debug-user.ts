import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, getVerifiedIdentity } from '../lib/api-utils.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', 'https://deutschup.sintec.my.id');
    return res.status(200).end();
  }

  const identity = await getVerifiedIdentity(req);
  const userId = identity?.internalId;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized — token required' });
  }

  // Fetch profile
  const { data: profile, error: profileError } = await getDb()
    .from('profiles')
    .select('id, subscription, tier, pro_expires_at, tier_expiry, updated_at')
    .eq('id', userId)
    .maybeSingle();

  // Fetch orders
  const { data: orders, error: ordersError } = await getDb()
    .from('orders')
    .select('id, status, plan_type, amount, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  // Evaluate isPro
  const isPro = profile?.subscription === 'pro' && 
                profile?.pro_expires_at && 
                new Date(profile.pro_expires_at).getTime() > Date.now();

  return res.json({
    user_id: userId,
    profile: profile || null,
    profile_error: profileError?.message || null,
    orders: orders || [],
    orders_error: ordersError?.message || null,
    orders_count: orders?.length || 0,
    isPro_evaluated: isPro,
    server_time: new Date().toISOString(),
  });
}
