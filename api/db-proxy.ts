import type { ApiRequest, ApiResponse } from '../lib/http-types.js';
import { createClient } from '@supabase/supabase-js';
import { getVerifiedIdentity, getSupabaseAdminClient } from '../lib/api-utils.js';

const getAdminClient = () => getSupabaseAdminClient();

async function getVerifiedUserId(req: ApiRequest): Promise<string | null> {
  return (await getVerifiedIdentity(req))?.internalId || null;
}

const ALLOWED_ACTIONS = new Set([
  'get-profile', 'upsert-profile',
  'get-orders',
  'get-session',
  'can-access', 'get-study-time', 'complete-lesson', 'submit-checkpoint', 'update-streak',
  'get-progress', 'add-xp', 'unlock-lesson',
]);

// XP amounts are asserted by the client, so cap a single grant.
const MAX_XP_PER_GRANT = 1000;

const DEFAULT_UNLOCKED = ['a1-1'];

const LEVEL_IDS = ['A1', 'A2', 'B1', 'B2'];

/** Fallback level when curriculum_lessons has no row for the id (static lesson data). */
function levelFromLessonId(lessonId: string): string | null {
  const prefix = lessonId.slice(0, 2).toUpperCase();
  return LEVEL_IDS.includes(prefix) ? prefix : null;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
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

      // Full progress snapshot: curriculum position + completed lessons + checkpoints.
      // Seeds the curriculum row on first login so the RPCs above have a row to update.
      case 'get-progress': {
        const userId = await getVerifiedUserId(req);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        let curriculum: Record<string, any> | null = null;
        const { data: curRow, error: curErr } = await db
          .from('user_curriculum_progress')
          .select('current_level_id, current_lesson_id, xp, streak, last_practice_date, unlocked_lessons')
          .eq('user_id', userId)
          .maybeSingle();
        if (curErr) {
          console.error('[DB-PROXY] get-progress curriculum error:', curErr.message);
          return res.status(500).json({ error: curErr.message });
        }
        curriculum = curRow;

        if (!curriculum) {
          let seedErr = (await db.from('user_curriculum_progress').insert({
            user_id: userId,
            current_level_id: 'A1',
            current_lesson_id: 'a1-1',
            xp: 0,
            streak: 0,
            unlocked_lessons: DEFAULT_UNLOCKED,
          })).error;
          if (seedErr) {
            // curriculum_levels / curriculum_lessons may not be seeded yet —
            // retry without the columns that carry foreign keys into them.
            seedErr = (await db.from('user_curriculum_progress').insert({
              user_id: userId,
              xp: 0,
              streak: 0,
              unlocked_lessons: DEFAULT_UNLOCKED,
            })).error;
          }
          if (seedErr) {
            console.error('[DB-PROXY] get-progress seed error:', seedErr.message);
            return res.status(500).json({ error: seedErr.message });
          }
          curriculum = {
            current_level_id: 'A1',
            current_lesson_id: 'a1-1',
            xp: 0,
            streak: 0,
            last_practice_date: null,
            unlocked_lessons: DEFAULT_UNLOCKED,
          };
        }

        const { data: lessons, error: lessonErr } = await db
          .from('user_lesson_progress')
          .select('lesson_id, score')
          .eq('user_id', userId)
          .eq('completed', true);
        if (lessonErr) {
          console.error('[DB-PROXY] get-progress lessons error:', lessonErr.message);
          return res.status(500).json({ error: lessonErr.message });
        }

        const { data: checkpoints, error: chkErr } = await db
          .from('user_checkpoint_progress')
          .select('checkpoint_id, passed, score, attempts, best_score')
          .eq('user_id', userId);
        if (chkErr) {
          console.error('[DB-PROXY] get-progress checkpoints error:', chkErr.message);
          return res.status(500).json({ error: chkErr.message });
        }

        return res.json({
          xp: curriculum.xp || 0,
          streak: curriculum.streak || 0,
          lastPracticeDate: curriculum.last_practice_date || null,
          currentLevel: curriculum.current_level_id || 'A1',
          currentLesson: curriculum.current_lesson_id || null,
          unlockedLessons: Array.isArray(curriculum.unlocked_lessons)
            ? curriculum.unlocked_lessons
            : DEFAULT_UNLOCKED,
          completedLessons: (lessons || []).map((r: any) => r.lesson_id),
          checkpoints: (checkpoints || []).map((r: any) => ({
            checkpointId: r.checkpoint_id,
            passed: r.passed === true,
            score: Number(r.score) || 0,
            attempts: Number(r.attempts) || 0,
            bestScore: Number(r.best_score) || 0,
          })),
        });
      }

      case 'add-xp': {
        const userId = await getVerifiedUserId(req);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        const raw = Number(req.body?.amount);
        if (!Number.isFinite(raw) || raw <= 0) {
          return res.status(400).json({ error: 'amount must be a positive number' });
        }
        const amount = Math.min(Math.round(raw), MAX_XP_PER_GRANT);

        const { data: xpRow, error: xpReadErr } = await db
          .from('user_curriculum_progress')
          .select('xp')
          .eq('user_id', userId)
          .maybeSingle();
        if (xpReadErr) {
          console.error('[DB-PROXY] add-xp read error:', xpReadErr.message);
          return res.status(500).json({ error: xpReadErr.message });
        }

        const nextXp = (Number(xpRow?.xp) || 0) + amount;
        const { data: xpData, error: xpErr } = await db
          .from('user_curriculum_progress')
          .upsert({ user_id: userId, xp: nextXp }, { onConflict: 'user_id' })
          .select('xp')
          .single();
        if (xpErr) {
          console.error('[DB-PROXY] add-xp write error:', xpErr.message);
          return res.status(500).json({ error: xpErr.message });
        }
        return res.json({ xp: Number(xpData?.xp) || nextXp });
      }

      case 'unlock-lesson': {
        const userId = await getVerifiedUserId(req);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        const lessonId = req.body?.lessonId;
        if (typeof lessonId !== 'string' || !lessonId) {
          return res.status(400).json({ error: 'lessonId required' });
        }

        // Eligibility is decided by the database, never by the client payload.
        const { data: allowed, error: allowErr } = await db.rpc('can_access_lesson', {
          p_user_id: userId, p_lesson_id: lessonId,
        });
        if (allowErr) throw allowErr;
        if (allowed !== true && allowed !== 'true') {
          return res.status(403).json({ error: 'Lesson is not unlockable yet' });
        }

        const { data: progRow, error: progErr } = await db
          .from('user_curriculum_progress')
          .select('unlocked_lessons, current_level_id')
          .eq('user_id', userId)
          .maybeSingle();
        if (progErr) {
          console.error('[DB-PROXY] unlock-lesson read error:', progErr.message);
          return res.status(500).json({ error: progErr.message });
        }

        const currentUnlocked: string[] = Array.isArray(progRow?.unlocked_lessons)
          ? progRow.unlocked_lessons
          : DEFAULT_UNLOCKED;
        const nextUnlocked = currentUnlocked.includes(lessonId)
          ? currentUnlocked
          : [...currentUnlocked, lessonId];

        // Level is derived from the curriculum table, not from the client.
        const { data: lessonRow } = await db
          .from('curriculum_lessons')
          .select('level_id')
          .eq('id', lessonId)
          .maybeSingle();

        const levelId = lessonRow?.level_id || levelFromLessonId(lessonId);
        const update: Record<string, any> = { user_id: userId, unlocked_lessons: nextUnlocked };
        if (levelId) update.current_level_id = levelId;

        let unlockRes = await db
          .from('user_curriculum_progress')
          .upsert(update, { onConflict: 'user_id' })
          .select('unlocked_lessons, current_level_id')
          .single();
        if (unlockRes.error && levelId) {
          // curriculum_levels may not be seeded — the unlock itself still matters.
          unlockRes = await db
            .from('user_curriculum_progress')
            .upsert({ user_id: userId, unlocked_lessons: nextUnlocked }, { onConflict: 'user_id' })
            .select('unlocked_lessons, current_level_id')
            .single();
        }
        if (unlockRes.error) {
          console.error('[DB-PROXY] unlock-lesson write error:', unlockRes.error.message);
          return res.status(500).json({ error: unlockRes.error.message });
        }
        const unlockData = unlockRes.data;

        return res.json({
          unlockedLessons: Array.isArray(unlockData?.unlocked_lessons)
            ? unlockData.unlocked_lessons
            : nextUnlocked,
          currentLevel: unlockData?.current_level_id || progRow?.current_level_id || 'A1',
        });
      }

      default:
        return res.status(400).json({ error: 'Action not implemented' });
    }
  } catch (e: any) {
    console.error(`[DB-PROXY] ${action} fatal:`, e.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
