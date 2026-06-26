import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { resolveInternalId } from '../lib/clerk/identity';
import type { Level } from '../data/course';

// ============================================================
// Types
// ============================================================

export interface VocabProgress {
  status: 'learning' | 'known';
  nextReview: number;
}

export interface ProgressData {
  xp: number;
  streak: number;
  lastPracticeDate: string | null;
  currentLevel: Level;
  unlockedLessons: string[];
  completedLessons: string[];
  vocab: Record<string, VocabProgress>;
}

interface CheckpointProgress {
  checkpointId: string;
  passed: boolean;
  score: number;
  attempts: number;
  bestScore: number;
}

interface ProgressState extends ProgressData {
  loading: boolean;
  initialized: boolean;
  checkpointProgress: CheckpointProgress[];

  // Actions
  loadProgress: (userId: string) => Promise<void>;
  addXp: (userId: string, amount: number) => Promise<void>;
  unlockLesson: (userId: string, lessonId: string) => Promise<void>;
  completeLesson: (userId: string, lessonId: string) => Promise<void>;
  submitCheckpoint: (userId: string, checkpointId: string, score: number) => Promise<boolean>;
  updateVocab: (userId: string, wordId: string, status: 'learning' | 'known') => Promise<void>;
  updateStreak: (userId: string) => Promise<void>;
}

const defaultProgress: ProgressData = {
  xp: 0,
  streak: 0,
  lastPracticeDate: null,
  currentLevel: 'A1',
  unlockedLessons: ['a1-1'],
  completedLessons: [],
  vocab: {},
};

// ============================================================
// Store
// ============================================================

export const useProgressStore = create<ProgressState>((set, get) => ({
  ...defaultProgress,
  loading: false,
  initialized: false,
  checkpointProgress: [],

  // --------------------------------------------------------
  // LOAD — reads from new relational tables
  // --------------------------------------------------------
  loadProgress: async (clerkUserId: string) => {
    set({ loading: true });

    // Load vocab from localStorage FIRST (synchronous, before async DB queries)
    try {
      const vocabKey = `deutschup_vocab_` + clerkUserId;
      const savedVocab = localStorage.getItem(vocabKey);
      if (savedVocab) {
        const parsed = JSON.parse(savedVocab);
        set({ vocab: parsed });
        console.log('[PROGRESS] Loaded vocab from localStorage:', Object.keys(parsed).length, 'words');
      }
    } catch (e) {
      console.warn('[PROGRESS] Failed to load vocab from localStorage:', e);
    }

    const userId = await resolveInternalId(clerkUserId);
    if (!userId) {
      console.error('[PROGRESS] Could not resolve Clerk ID:', clerkUserId.substring(0, 12));
      set({ loading: false });
      return;
    }
    try {

      // 1. user_curriculum_progress (xp, streak, current lesson, unlocked lessons)
      const { data: curriculumProgress, error: cpError } = await supabase
        .from('user_curriculum_progress')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (cpError) throw cpError;

      // 2. user_lesson_progress (completed lessons)
      const { data: lessonProgress, error: lpError } = await supabase
        .from('user_lesson_progress')
        .select('lesson_id, completed, score')
        .eq('user_id', userId)
        .eq('completed', true);

      if (lpError) throw lpError;

      // 3. user_checkpoint_progress
      const { data: checkpointData, error: chkError } = await supabase
        .from('user_checkpoint_progress')
        .select('checkpoint_id, passed, score, attempts, best_score')
        .eq('user_id', userId);

      if (chkError) throw chkError;

      if (curriculumProgress) {
        const completedLessons = (lessonProgress || []).map((r) => r.lesson_id);
        set({
          xp: curriculumProgress.xp || 0,
          streak: curriculumProgress.streak || 0,
          lastPracticeDate: curriculumProgress.last_practice_date || null,
          currentLevel: (curriculumProgress.current_level_id as Level) || 'A1',
          unlockedLessons: curriculumProgress.unlocked_lessons || ['a1-1'],
          completedLessons,
          checkpointProgress: (checkpointData || []).map((r) => ({
            checkpointId: r.checkpoint_id,
            passed: r.passed,
            score: r.score || 0,
            attempts: r.attempts || 0,
            bestScore: r.best_score || 0,
          })),
          initialized: true,
          loading: false,
        });
      } else {
        // First login — create default curriculum progress
        const { error: insertError } = await supabase
          .from('user_curriculum_progress')
          .insert({
            user_id: userId,
            current_level_id: 'A1',
            current_lesson_id: 'a1-1',
            xp: 0,
            streak: 0,
            unlocked_lessons: ['a1-1'],
          });

        if (insertError) throw insertError;
        set({ ...defaultProgress, vocab: get().vocab, initialized: true, loading: false });
      }



    } catch (e) {
      console.error(`[PROGRESS] load error for ${userId}:`, e);
      set({ loading: false });
    }
  },

  // --------------------------------------------------------
  // ADD XP
  // --------------------------------------------------------
  addXp: async (clerkUserId: string, amount: number) => {
    const userId = await resolveInternalId(clerkUserId);
    if (!userId) return;
    const { xp } = get();
    const newXp = xp + amount;
    set({ xp: newXp });
    try {
      const { error } = await supabase
        .from('user_curriculum_progress')
        .upsert({ user_id: userId, xp: newXp }, { onConflict: 'user_id' });
      if (error) throw error;
    } catch (e) {
      console.error(`[PROGRESS] addXp error:`, e);
    }
  },

  // --------------------------------------------------------
  // UNLOCK LESSON
  // --------------------------------------------------------
  unlockLesson: async (clerkUserId: string, lessonId: string) => {
    const userId = await resolveInternalId(clerkUserId);
    if (!userId) return;
    const { unlockedLessons, currentLevel } = get();
    if (unlockedLessons.includes(lessonId)) return;

    const next = [...unlockedLessons, lessonId];

    // Determine new level from lesson prefix
    let newLevel = currentLevel;
    if (lessonId.startsWith('a2')) newLevel = 'A2';
    if (lessonId.startsWith('b1')) newLevel = 'B1';
    if (lessonId.startsWith('b2')) newLevel = 'B2';

    set({ unlockedLessons: next, currentLevel: newLevel });
    try {
      const { error } = await supabase
        .from('user_curriculum_progress')
        .upsert(
          { user_id: userId, unlocked_lessons: next, current_level_id: newLevel },
          { onConflict: 'user_id' }
        );
      if (error) throw error;
    } catch (e) {
      console.error(`[PROGRESS] unlockLesson error:`, e);
    }
  },

  // --------------------------------------------------------
  // COMPLETE LESSON — uses user_lesson_progress + updates streak
  // --------------------------------------------------------
  completeLesson: async (clerkUserId: string, lessonId: string) => {
    const userId = await resolveInternalId(clerkUserId);
    if (!userId) return;
    const { completedLessons } = get();
    if (completedLessons.includes(lessonId)) return;

    const next = [...completedLessons, lessonId];
    set({ completedLessons: next });

    try {
      // Upsert lesson progress
      const { error } = await supabase
        .from('user_lesson_progress')
        .upsert(
          {
            user_id: userId,
            lesson_id: lessonId,
            completed: true,
            completed_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,lesson_id' }
        );
      if (error) throw error;

      // Update streak via RPC
      await supabase.rpc('update_streak', { p_user_id: userId });

      // Update current_lesson_id in curriculum progress
      const { error: updateErr } = await supabase
        .from('user_curriculum_progress')
        .upsert(
          { user_id: userId, current_lesson_id: lessonId },
          { onConflict: 'user_id' }
        );
      if (updateErr) throw updateErr;
    } catch (e) {
      console.error(`[PROGRESS] completeLesson error:`, e);
    }
  },

  // --------------------------------------------------------
  // SUBMIT CHECKPOINT — uses user_checkpoint_progress
  // Returns true if passed
  // --------------------------------------------------------
  submitCheckpoint: async (clerkUserId: string, checkpointId: string, score: number, totalQuestions: number = 10) => {
    const userId = await resolveInternalId(clerkUserId);
    if (!userId) return false;
    try {
      const { data, error } = await supabase.rpc('submit_checkpoint', {
        p_user_id: userId,
        p_checkpoint_id: checkpointId,
        p_score: score,
        p_total_questions: totalQuestions,
      });

      if (error) throw error;

      const passed = data === true || data === 'true';

      // Update local state
      const { checkpointProgress } = get();
      const existing = checkpointProgress.find((c) => c.checkpointId === checkpointId);
      if (existing) {
        existing.score = Math.max(existing.score, score);
        existing.attempts += 1;
        existing.bestScore = Math.max(existing.bestScore, score);
        if (passed) existing.passed = true;
        set({ checkpointProgress: [...checkpointProgress] });
      } else {
        set({
          checkpointProgress: [
            ...checkpointProgress,
            {
              checkpointId,
              passed,
              score,
              attempts: 1,
              bestScore: score,
            },
          ],
        });
      }

      return passed;
    } catch (e) {
      console.error(`[PROGRESS] submitCheckpoint error:`, e);
      return false;
    }
  },

  // --------------------------------------------------------
  // UPDATE VOCAB (kept as-is, vocab table deferred)
  // --------------------------------------------------------
  updateVocab: async (userId: string, wordId: string, status: 'learning' | 'known') => {
    const { vocab } = get();
    const nextReview =
      Date.now() + (status === 'known' ? 86400000 * 3 : 86400000);
    const newVocab = { ...vocab, [wordId]: { status, nextReview } };
    set({ vocab: newVocab });
    // Persist to localStorage (per-user)
    try {
      const key = `deutschup_vocab_${userId}`;
      localStorage.setItem(key, JSON.stringify(newVocab));
    } catch (e) {
      console.warn('[PROGRESS] Failed to save vocab to localStorage:', e);
    }
  },

  // --------------------------------------------------------
  // UPDATE STREAK
  // --------------------------------------------------------
  updateStreak: async (clerkUserId: string) => {
    const userId = await resolveInternalId(clerkUserId);
    const { lastPracticeDate, streak } = get();
    const today = new Date().toISOString().split('T')[0];
    if (lastPracticeDate === today) return;

    let newStreak = streak;
    if (lastPracticeDate) {
      const lastDate = new Date(lastPracticeDate);
      const curr = new Date(today);
      const diffTime = Math.abs(curr.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      newStreak = diffDays === 1 ? streak + 1 : 1;
    } else {
      newStreak = 1;
    }

    set({ streak: newStreak, lastPracticeDate: today });
    if (!userId) return;
    try {
      const { error } = await supabase
        .from('user_curriculum_progress')
        .upsert(
          { user_id: userId, streak: newStreak, last_practice_date: today },
          { onConflict: 'user_id' }
        );
      if (error) throw error;
    } catch (e) {
      console.error(`[PROGRESS] updateStreak error:`, e);
    }
  },
}));
