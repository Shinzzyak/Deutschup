import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import "dotenv/config";
import { getVerifiedIdentity, getSupabaseAdminClient } from '../lib/api-utils.js';

const getAdminClient = () => getSupabaseAdminClient();

async function getVerifiedUserId(req: VercelRequest): Promise<string | null> {
  return (await getVerifiedIdentity(req))?.internalId || null;
}

const ALLOWED_ACTIONS = new Set([
  'get-profile', 'upsert-profile',
  'get-orders',
  'get-session',
]);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', process.env.APP_URL || 'https://deutschup.sintec.my.id');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  const action = req.query.action as string;
  if (!action || !ALLOWED_ACTIONS.has(action)) {
    return res.status(400).json({ error: 'Invalid action' });
  }

  const db = getAdminClient();

  try {
    switch (action) {
      case 'get-profile': {
        const userId = await getVerifiedUserId(req);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        const { data, error } = await db
          .from('profiles')
          .select('tier, tier_expiry, full_name, avatar_url, role, subscription, pro_expires_at, onboarding_completed')
          .eq('id', userId)
          .maybeSingle();
        if (error) {
          console.error('[DB-PROXY] get-profile error:', error.message);
          return res.status(500).json({ error: error.message });
        }
        return res.json(data);
      }

      case 'upsert-profile': {
        const userId = await getVerifiedUserId(req);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        const { full_name, avatar_url, onboarding_completed } = req.body || {};
        const update: Record<string, any> = { id: userId };
        if (typeof full_name === 'string') update.full_name = full_name;
        if (typeof onboarding_completed === 'boolean') update.onboarding_completed = onboarding_completed;
        if (typeof avatar_url === 'string') update.avatar_url = avatar_url;
        const { data, error } = await db
          .from('profiles')
          .upsert(update, { onConflict: 'id' })
          .select()
          .single();
        if (error) {
          console.error('[DB-PROXY] upsert-profile error:', error.message);
          return res.status(500).json({ error: error.message });
        }
        return res.json(data);
      }

      case 'get-orders': {
        const userId = await getVerifiedUserId(req);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        const { data, error } = await db
          .from('orders')
          .select('id, status, amount, payment_method, paid_at, created_at')
          .eq('user_id', userId)
          .eq('status', 'paid')
          .order('created_at', { ascending: false });
        if (error) {
          console.error('[DB-PROXY] get-orders error:', error.message);
          return res.status(500).json({ error: error.message });
        }
        return res.json(data);
      }

      case 'get-session': {
        const userId = await getVerifiedUserId(req);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        return res.json({ id: userId, provider: 'clerk' });
      }

      default:
        return res.status(400).json({ error: 'Action not implemented' });
    }
  } catch (e: any) {
    console.error(`[DB-PROXY] ${action} fatal:`, e.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
