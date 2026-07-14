import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdminClient, getVerifiedIdentity } from '../lib/api-utils.js';

const supabase = getSupabaseAdminClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', 'https://deutschup.sintec.my.id');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  // All curriculum endpoints require verified Clerk JWT.
  const identity = await getVerifiedIdentity(req);
  if (!identity?.internalId) {
    return res.status(401).json({ error: 'Unauthorized — token required' });
  }
  const userId = identity.internalId;

  const action = req.query.action as string;

  try {
    switch (action) {
      // GET /api/curriculum?action=get-session — resolve identity
      case 'get-session':
        return res.json({ id: userId, provider: identity.provider });

      // GET /api/curriculum?action=can-access&lessonId=a1-2
      case 'can-access': {
        const lessonId = req.query.lessonId as string;
        if (!lessonId) return res.status(400).json({ error: 'lessonId required' });
        const { data, error } = await supabase.rpc('can_access_lesson', {
          p_user_id: userId, p_lesson_id: lessonId,
        });
        if (error) throw error;
        return res.json({ allowed: data === true || data === 'true' });
      }

      // GET /api/curriculum?action=get-study-time
      case 'get-study-time': {
        const { data, error } = await supabase.rpc('get_study_time', { p_user_id: userId });
        if (error) throw error;
        return res.json(data);
      }

      // POST /api/curriculum?action=complete-lesson
      case 'complete-lesson': {
        if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
        const { lessonId, score, xpEarned } = req.body || {};
        if (!lessonId) return res.status(400).json({ error: 'lessonId required' });
        const { data, error } = await supabase.rpc('complete_lesson', {
          p_user_id: userId, p_lesson_id: lessonId,
          p_score: score ?? null, p_xp_earned: xpEarned ?? 10,
        });
        if (error) throw error;
        return res.json(data);
      }

      // POST /api/curriculum?action=submit-checkpoint
      case 'submit-checkpoint': {
        if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
        const { checkpointId, score, totalQuestions } = req.body || {};
        if (!checkpointId || score === undefined) {
          return res.status(400).json({ error: 'checkpointId and score required' });
        }
        const { data, error } = await supabase.rpc('submit_checkpoint', {
          p_user_id: userId, p_checkpoint_id: checkpointId,
          p_score: score, p_total_questions: totalQuestions ?? 10,
        });
        if (error) throw error;
        return res.json(data);
      }

      // POST /api/curriculum?action=update-streak
      case 'update-streak': {
        if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
        const { error } = await supabase.rpc('update_streak', { p_user_id: userId });
        if (error) throw error;
        return res.json({ success: true });
      }

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
