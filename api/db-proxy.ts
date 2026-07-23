import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getVerifiedIdentity, getSupabaseAdminClient } from '../lib/api-utils.js';

const getAdminClient = () => getSupabaseAdminClient();

async function getVerifiedUserId(req: VercelRequest): Promise<string | null> {
  return (await getVerifiedIdentity(req))?.internalId || null;
}

const ALLOWED_ACTIONS = new Set([
  'get-profile', 'upsert-profile',
  'get-orders',
  'get-session',
  'can-access', 'get-study-time', 'complete-lesson', 'submit-checkpoint', 'update-streak',
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

      case 'can-access': {
        const userId = await getVerifiedUserId(req);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        const lessonId = req.query.lessonId as string || req.body?.lessonId;
        if (!lessonId) return res.status(400).json({ error: 'lessonId required' });
        const { data: accessData, error: accessErr } = await db.rpc('can_access_lesson', {
          p_user_id: userId, p_lesson_id: lessonId,
        });
        if (accessErr) throw accessErr;
        return res.json({ allowed: accessData === true || accessData === 'true' });
      }

      case 'get-study-time': {
        const userId = await getVerifiedUserId(req);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        const { data: timeData, error: timeErr } = await db.rpc('get_study_time', { p_user_id: userId });
        if (timeErr) throw timeErr;
        return res.json(timeData);
      }

      case 'complete-lesson': {
        const userId = await getVerifiedUserId(req);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        const { lessonId, score, xpEarned } = req.body || {};
        if (!lessonId) return res.status(400).json({ error: 'lessonId required' });
        const { data: lessonResult, error: lessonErr } = await db.rpc('complete_lesson', {
          p_user_id: userId, p_lesson_id: lessonId,
          p_score: score ?? null, p_xp_earned: xpEarned ?? 10,
        });
        if (lessonErr) throw lessonErr;
        return res.json(lessonResult);
      }

      case 'submit-checkpoint': {
        const userId = await getVerifiedUserId(req);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        const { checkpointId, score, totalQuestions } = req.body || {};
        if (!checkpointId || score === undefined) {
          return res.status(400).json({ error: 'checkpointId and score required' });
        }
        const { data: cpResult, error: cpErr } = await db.rpc('submit_checkpoint', {
          p_user_id: userId, p_checkpoint_id: checkpointId,
          p_score: score, p_total_questions: totalQuestions ?? 10,
        });
        if (cpErr) throw cpErr;
        return res.json(cpResult);
      }

      case 'update-streak': {
        const userId = await getVerifiedUserId(req);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        const { error: streakErr } = await db.rpc('update_streak', { p_user_id: userId });
        if (streakErr) throw streakErr;
        return res.json({ success: true });
      }

      default:
        return res.status(400).json({ error: 'Action not implemented' });
    }
  } catch (e: any) {
    console.error(`[DB-PROXY] ${action} fatal:`, e.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
