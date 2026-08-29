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
  // Learning content. Column names below were read off the live PostgREST schema,
  // not off the .sql files in this repo — those had drifted (notes.text vs
  // notes.content, a study_plans.tasks column that does not exist, and
  // study_sessions.user_id typed TEXT while every other table uses UUID).
  'get-learning', 'save-note', 'delete-note', 'save-study-plan', 'save-quick-note',
  'save-mock-test', 'start-session', 'end-session',
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
        if (lessonErr) {
          // N10: complete_lesson now gates on can_access_lesson — surface
          // insufficient_privilege as 403, not a raw 500.
          if (lessonErr.code === '42501' || /not accessible/i.test(lessonErr.message)) {
            return res.status(403).json({ error: 'Pelajaran ini belum terbuka.' });
          }
          throw lessonErr;
        }
        return res.json(lessonResult);
      }

      case 'submit-checkpoint': {
        const userId = await getVerifiedUserId(req);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        const { checkpointId, answers } = req.body || {};
        if (!checkpointId || !Array.isArray(answers) || answers.length === 0) {
          return res.status(400).json({ error: 'checkpointId and answers[] required' });
        }

        // Server-side grading (N4): the client never sends a score. The
        // correct answers live in curriculum_checkpoint_questions; we grade
        // here so self-reporting score=1.0 is impossible.
        const { data: questions, error: qErr } = await db
          .from('curriculum_checkpoint_questions')
          .select('correct_answer_index, correct_answer')
          .eq('checkpoint_id', checkpointId)
          .order('sort_order', { ascending: true });
        if (qErr) throw qErr;
        if (!questions || questions.length === 0) {
          return res.status(409).json({ error: 'Checkpoint questions not seeded on server — cannot grade' });
        }

        const norm = (i: number) => (i === undefined || i === null ? -1 : Number(i));
        let correct = 0;
        for (let i = 0; i < questions.length; i++) {
          const expected = norm(questions[i].correct_answer_index ?? questions[i].correct_answer);
          if (norm(answers[i]) === expected) correct++;
        }
        const total = questions.length;
        const score = total > 0 ? correct / total : 0;

        const { data: cpResult, error: cpErr } = await db.rpc('submit_checkpoint', {
          p_user_id: userId, p_checkpoint_id: checkpointId,
          p_score: score, p_total_questions: total,
        });
        if (cpErr) throw cpErr;
        return res.json({ ...(cpResult || {}), serverGraded: true, score, correct, total });
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
        // Audit N5: XP pump. Cap per-call alone is bypassable (repeat calls).
        // Add a per-user daily cap: legit sources are lesson/checkpoint
        // completions (~10-20 XP each), so 200 XP/day is generous for real use
        // and useless for farming. Enforcement lives here (server-side).
        const amount = Math.min(Math.round(raw), MAX_XP_PER_GRANT);

        // Daily cap via rate_limit_log-style check on a dedicated endpoint tag.
        const today = new Date().toISOString().slice(0, 10);
        const { count: xpToday, error: xpCountErr } = await db
          .from('rate_limit_log')
          .select('*', { count: 'exact', head: true })
          .eq('identifier', `${userId}:xp`)
          .eq('endpoint', 'add-xp')
          .gte('created_at', `${today}T00:00:00.000Z`);
        if (xpCountErr) {
          console.error('[DB-PROXY] add-xp cap read error:', xpCountErr.message);
        } else if ((xpToday || 0) >= 20) {
          return res.status(429).json({ error: 'XP harian sudah penuh. Coba lagi besok.' });
        }
        // Record this grant (best-effort; the cap is a guard, not a ledger).
        try {
          await db.from('rate_limit_log').insert({
            identifier: `${userId}:xp`,
            endpoint: 'add-xp',
            // ip_address is inet — null (not 'server') to avoid a cast error.
            ip_address: null,
            created_at: new Date().toISOString(),
          });
        } catch { /* best-effort */ }

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

      /* ---------------------------------------------------------------
         Learning content: notes, study plans, quick notes, mock tests,
         study sessions.

         These lived in src/stores/learningStore.ts and src/hooks/useLessonTimer.ts
         as direct table calls from the anon client, which is why every one of
         these tables is empty in production — auth.uid() is NULL under Clerk, so
         RLS rejected every write, and the store only console.error'd.
         --------------------------------------------------------------- */

      case 'get-learning': {
        const userId = await getVerifiedUserId(req);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const [notes, plans, quick, tests] = await Promise.all([
          db.from('notes').select('id, lesson_id, title, content, category, created_at, updated_at')
            .eq('user_id', userId).order('created_at', { ascending: false }),
          db.from('study_plans').select('id, title, content, duration_days, status, created_at, updated_at')
            .eq('user_id', userId).order('created_at', { ascending: false }),
          db.from('quick_notes').select('id, content, created_at, updated_at')
            .eq('user_id', userId).order('updated_at', { ascending: false }).limit(1),
          db.from('mock_tests').select('id, level, score, total_questions, answers, completed_at, created_at')
            .eq('user_id', userId).order('created_at', { ascending: false }).limit(50),
        ]);

        const firstError = notes.error || plans.error || quick.error || tests.error;
        if (firstError) {
          console.error('[DB-PROXY] get-learning error:', firstError.message);
          return res.status(500).json({ error: firstError.message });
        }

        return res.json({
          notes: notes.data || [],
          studyPlans: plans.data || [],
          quickNote: (quick.data && quick.data[0]) || null,
          mockTests: tests.data || [],
        });
      }

      case 'save-note': {
        const userId = await getVerifiedUserId(req);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        const { lessonId, title, content, category } = req.body || {};
        if (typeof content !== 'string' || !content.trim()) {
          return res.status(400).json({ error: 'content required' });
        }
        const { data, error } = await db
          .from('notes')
          .insert({
            user_id: userId,
            lesson_id: typeof lessonId === 'string' ? lessonId : null,
            title: typeof title === 'string' ? title : null,
            content: content.slice(0, 20000),
            category: typeof category === 'string' ? category : null,
          })
          .select()
          .single();
        if (error) {
          console.error('[DB-PROXY] save-note error:', error.message);
          return res.status(500).json({ error: error.message });
        }
        return res.json(data);
      }

      case 'delete-note': {
        const userId = await getVerifiedUserId(req);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        const { noteId } = req.body || {};
        if (typeof noteId !== 'string' || !noteId) {
          return res.status(400).json({ error: 'noteId required' });
        }
        // Scoped by the verified user, so one user can never delete another's note.
        const { error } = await db.from('notes').delete().eq('id', noteId).eq('user_id', userId);
        if (error) {
          // Never leak raw SQL errors (T1): log server-side, reply generic.
          console.error('[DB-PROXY] delete-note error:', error.message);
          return res.status(500).json({ error: 'Gagal menghapus catatan.' });
        }
        return res.json({ success: true });
      }

      case 'save-study-plan': {
        const userId = await getVerifiedUserId(req);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        const { title, content, durationDays, status } = req.body || {};
        if (typeof content !== 'string' || !content.trim()) {
          return res.status(400).json({ error: 'content required' });
        }
        const { data, error } = await db
          .from('study_plans')
          .insert({
            user_id: userId,
            title: typeof title === 'string' ? title : null,
            content: content.slice(0, 40000),
            duration_days: Number.isFinite(Number(durationDays)) ? Number(durationDays) : null,
            status: typeof status === 'string' ? status : 'active',
          })
          .select()
          .single();
        if (error) {
          console.error('[DB-PROXY] save-study-plan error:', error.message);
          return res.status(500).json({ error: error.message });
        }
        return res.json(data);
      }

      case 'save-quick-note': {
        const userId = await getVerifiedUserId(req);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        const { content } = req.body || {};
        if (typeof content !== 'string') {
          return res.status(400).json({ error: 'content required' });
        }
        // One quick note per user: update the existing row rather than piling up.
        const { data: existing } = await db
          .from('quick_notes').select('id').eq('user_id', userId).limit(1).maybeSingle();

        const payload = { content: content.slice(0, 10000), updated_at: new Date().toISOString() };
        const result = existing?.id
          ? await db.from('quick_notes').update(payload).eq('id', existing.id).eq('user_id', userId).select().single()
          : await db.from('quick_notes').insert({ user_id: userId, ...payload }).select().single();

        if (result.error) {
          console.error('[DB-PROXY] save-quick-note error:', result.error.message);
          return res.status(500).json({ error: result.error.message });
        }
        return res.json(result.data);
      }

      case 'save-mock-test': {
        const userId = await getVerifiedUserId(req);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        const { level, score, totalQuestions, answers } = req.body || {};
        const numScore = Number(score);
        const numTotal = Number(totalQuestions);
        if (!Number.isFinite(numScore) || !Number.isFinite(numTotal)) {
          return res.status(400).json({ error: 'score and totalQuestions required' });
        }
        // Clamp score to [0,100] — a 999 score is a lying client.
        const scoreClamped = Math.min(100, Math.max(0, Math.round(numScore)));
        const { data, error } = await db
          .from('mock_tests')
          .insert({
            user_id: userId,
            level: typeof level === 'string' ? level : 'A1',
            score: scoreClamped,
            total_questions: Math.max(1, Math.round(numTotal)),
            answers: answers ?? null,
            completed_at: new Date().toISOString(),
          })
          .select()
          .single();
        if (error) {
          console.error('[DB-PROXY] save-mock-test error:', error.message);
          return res.status(500).json({ error: error.message });
        }
        return res.json(data);
      }

      case 'start-session': {
        const userId = await getVerifiedUserId(req);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        const { lessonId } = req.body || {};
        // study_sessions.user_id is TEXT in the live schema, unlike every other
        // table, so the UUID is passed as a string deliberately.
        const { data, error } = await db
          .from('study_sessions')
          .insert({
            user_id: String(userId),
            lesson_id: typeof lessonId === 'string' ? lessonId : null,
            started_at: new Date().toISOString(),
          })
          .select('id')
          .single();
        if (error) {
          console.error('[DB-PROXY] start-session error:', error.message);
          return res.status(500).json({ error: error.message });
        }
        return res.json({ sessionId: data?.id });
      }

      case 'end-session': {
        const userId = await getVerifiedUserId(req);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        const { sessionId, durationSeconds } = req.body || {};
        if (typeof sessionId !== 'string' || !sessionId) {
          return res.status(400).json({ error: 'sessionId required' });
        }
        const secs = Number(durationSeconds);
        // Sessions shorter than 5s are noise (a mis-tap, an immediate back).
        if (Number.isFinite(secs) && secs < 5) {
          await db.from('study_sessions').delete().eq('id', sessionId).eq('user_id', String(userId));
          return res.json({ success: true, discarded: true });
        }
        // Cap at 4h per session — anything larger is a tampered/lying client.
        // (A real study session is minutes; 999999s = 11 days is never legit.)
        const cappedSecs = Number.isFinite(secs) ? Math.min(14400, Math.max(0, Math.round(secs))) : null;
        const { error } = await db
          .from('study_sessions')
          .update({
            ended_at: new Date().toISOString(),
            duration_seconds: cappedSecs,
          })
          .eq('id', sessionId)
          .eq('user_id', String(userId));
        if (error) {
          console.error('[DB-PROXY] end-session error:', error.message);
          return res.status(500).json({ error: error.message });
        }
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
