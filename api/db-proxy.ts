import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import "dotenv/config";
import { getSupabaseAdminClient } from '../lib/api-utils.js';

const getAdminClient = () => getSupabaseAdminClient();

// Extract verified user ID from JWT (Supabase or Clerk)
// Returns null if no valid token — never trust body/query for identity
async function getVerifiedUserId(req: VercelRequest): Promise<string | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split('Bearer ')[1];

  // Try Supabase auth
  try {
    const { data: { user }, error } = await getSupabaseAdminClient().auth.getUser(token);
    if (!error && user) return user.id;
  } catch {}

  // Try Clerk JWT — extract email, lookup internal_id from user_identities
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
      if (payload?.email) {
        const { data: identity } = await getSupabaseAdminClient()
          .from('user_identities')
          .select('internal_id')
          .eq('email', payload.email.toLowerCase().trim())
          .maybeSingle();
        if (identity?.internal_id) return identity.internal_id;
      }
    }
  } catch {}

  return null;
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
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-email');
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
          .select('tier, tier_expiry, full_name, avatar_url, role, subscription, pro_expires_at')
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
        const { full_name } = req.body || {};
        const { data, error } = await db
          .from('profiles')
          .upsert({ id: userId, full_name }, { onConflict: 'id' })
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
