import { create } from 'zustand';
import { dbProxy } from '../lib/supabase';
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
  /** Last persistence failure, in Indonesian, ready to render. Null when healthy. */
  error: string | null;
  /** A write is in flight. */
  saving: boolean;
  /** Total study seconds from the server (0 until fetchStudyTime runs). */
  studyTimeSeconds: number;

  // Actions
  loadProgress: (userId: string) => Promise<void>;
  refreshProgress: () => Promise<boolean>;
  addXp: (userId: string, amount: number) => Promise<void>;
  unlockLesson: (userId: string, lessonId: string) => Promise<void>;
  completeLesson: (userId: string, lessonId: string) => Promise<void>;
  submitCheckpoint: (userId: string, checkpointId: string, score: number, totalQuestions?: number) => Promise<boolean>;
  updateVocab: (userId: string, wordId: string, status: 'learning' | 'known') => Promise<void>;
  updateStreak: (userId: string) => Promise<void>;
  fetchStudyTime: () => Promise<number>;
  canAccessLesson: (lessonId: string) => Promise<boolean>;
  clearError: () => void;
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

const VALID_LEVELS: Level[] = ['A1', 'A2', 'B1', 'B2'];

const toLevel = (value: unknown): Level =>
  VALID_LEVELS.includes(value as Level) ? (value as Level) : 'A1';

// All persistence runs through /api/db-proxy, which resolves the Clerk identity
// server-side and uses service_role. Direct table access from the browser is
// impossible: the client holds the anon key only, so auth.uid() is always NULL
// and every RLS policy on user_* progress tables rejects it.

/** Human-readable failure text for the UI. Never swallow a write error. */
function failureMessage(action: string, error?: string, status?: number): string {
  console.error(`[PROGRESS] ${action} failed (${status ?? '?'}):`, error);
  if (status === 401) return 'Sesi kamu berakhir. Silakan masuk lagi agar progres tersimpan.';
  if (status === 0) return 'Koneksi terputus. Progres terakhir belum tersimpan.';
  return 'Progres gagal disimpan. Coba lagi sebentar lagi.';
}

const vocabKey = (userId: string) => `deutschup_vocab_${userId}`;

// ============================================================
// Store
// ============================================================

export const useProgressStore = create<ProgressState>((set, get) => ({
  ...defaultProgress,
  loading: false,
  initialized: false,
  checkpointProgress: [],
  error: null,
  saving: false,
  studyTimeSeconds: 0,

  clearError: () => set({ error: null }),

  // --------------------------------------------------------
  // REFRESH — pulls the authoritative snapshot from the server
  // --------------------------------------------------------
  refreshProgress: async () => {
    const { data, error, status } = await dbProxy('get-progress');
    if (error || !data) {
      set({ error: failureMessage('get-progress', error, status) });
      return false;
    }

    set({
      xp: Number(data.xp) || 0,
      streak: Number(data.streak) || 0,
      lastPracticeDate: data.lastPracticeDate || null,
      currentLevel: toLevel(data.currentLevel),
      unlockedLessons: Array.isArray(data.unlockedLessons) && data.unlockedLessons.length
        ? data.unlockedLessons
        : ['a1-1'],
      completedLessons: Array.isArray(data.completedLessons) ? data.completedLessons : [],
      checkpointProgress: Array.isArray(data.checkpoints)
        ? data.checkpoints.map((c: any) => ({
            checkpointId: c.checkpointId,
            passed: c.passed === true,
            score: Number(c.score) || 0,
            attempts: Number(c.attempts) || 0,
            bestScore: Number(c.bestScore) || 0,
          }))
        : [],
      error: null,
    });
    return true;
  },

  // --------------------------------------------------------
  // LOAD — vocab from localStorage, everything else from the server
  // --------------------------------------------------------
  loadProgress: async (clerkUserId: string) => {
    set({ loading: true });

    // Vocab is local-only (no server table yet); load it before the network call
    // so the trainer can render immediately.
    try {
      const savedVocab = localStorage.getItem(vocabKey(clerkUserId));
      if (savedVocab) set({ vocab: JSON.parse(savedVocab) });
    } catch (e) {
      console.warn('[PROGRESS] Failed to load vocab from localStorage:', e);
    }

    const ok = await get().refreshProgress();
    set({ loading: false, initialized: ok });
  },

  // --------------------------------------------------------
  // ADD XP
  // --------------------------------------------------------
  addXp: async (_clerkUserId: string, amount: number) => {
    if (!Number.isFinite(amount) || amount <= 0) return;

    set({ xp: get().xp + amount, saving: true });

    const { data, error, status } = await dbProxy('add-xp', { amount });
    if (error) {
      // Roll back the optimistic grant. Subtracting (rather than restoring a
      // snapshot) keeps concurrent grants from clobbering each other.
      set({
        xp: Math.max(0, get().xp - amount),
        saving: false,
        error: failureMessage('add-xp', error, status),
      });
      return;
    }

    // Trust the server total — it survives concurrent grants from other tabs.
    const serverXp = Number(data?.xp);
    set({ xp: Number.isFinite(serverXp) ? serverXp : get().xp, saving: false, error: null });
  },

  // --------------------------------------------------------
  // UNLOCK LESSON — the server decides eligibility via can_access_lesson
  // --------------------------------------------------------
  unlockLesson: async (_clerkUserId: string, lessonId: string) => {
    const { unlockedLessons, currentLevel } = get();
    if (unlockedLessons.includes(lessonId)) return;

    set({ unlockedLessons: [...unlockedLessons, lessonId], saving: true });

    const { data, error, status } = await dbProxy('unlock-lesson', { lessonId });
    if (error) {
      set({
        unlockedLessons: get().unlockedLessons.filter((id) => id !== lessonId),
        currentLevel,
        saving: false,
        error: status === 403
          ? 'Pelajaran ini belum terbuka. Selesaikan checkpoint sebelumnya dulu.'
          : failureMessage('unlock-lesson', error, status),
      });
      return;
    }

    set({
      unlockedLessons: Array.isArray(data?.unlockedLessons)
        ? data.unlockedLessons
        : get().unlockedLessons,
      currentLevel: toLevel(data?.currentLevel ?? currentLevel),
      saving: false,
      error: null,
    });
  },

  // --------------------------------------------------------
  // COMPLETE LESSON — complete_lesson RPC also grants XP,
  // unlocks the next lesson and bumps the streak, so we re-read after.
  // --------------------------------------------------------
  completeLesson: async (_clerkUserId: string, lessonId: string) => {
    const { completedLessons } = get();
    if (completedLessons.includes(lessonId)) return;

    set({ completedLessons: [...completedLessons, lessonId], saving: true });

    const { error, status } = await dbProxy('complete-lesson', {
      lessonId,
      score: null,
      xpEarned: 10,
    });
    if (error) {
      set({
        completedLessons: get().completedLessons.filter((id) => id !== lessonId),
        saving: false,
        error: failureMessage('complete-lesson', error, status),
      });
      return;
    }

    // The RPC mutates xp / unlocked_lessons / streak server-side.
    await get().refreshProgress();
    set({ saving: false });
  },

  // --------------------------------------------------------
  // SUBMIT CHECKPOINT — returns true if passed
  // --------------------------------------------------------
  submitCheckpoint: async (
    _clerkUserId: string,
    checkpointId: string,
    score: number,
    totalQuestions: number = 10
  ) => {
    set({ saving: true });

    const { data, error, status } = await dbProxy('submit-checkpoint', {
      checkpointId,
      score,
      totalQuestions,
    });
    if (error || !data) {
      set({ saving: false, error: failureMessage('submit-checkpoint', error, status) });
      return false;
    }

    const passed = data.passed === true || data.passed === 'true';
    const attempts = Number(data.attempts) || 0;
    const bestScore = Number(data.best_score);

    const { checkpointProgress } = get();
    const existing = checkpointProgress.find((c) => c.checkpointId === checkpointId);
    const updated: CheckpointProgress = {
      checkpointId,
      passed: passed || existing?.passed || false,
      score,
      attempts: attempts || (existing?.attempts ?? 0) + 1,
      bestScore: Number.isFinite(bestScore)
        ? bestScore
        : Math.max(existing?.bestScore ?? 0, score),
    };

    set({
      checkpointProgress: existing
        ? checkpointProgress.map((c) => (c.checkpointId === checkpointId ? updated : c))
        : [...checkpointProgress, updated],
      saving: false,
      error: null,
    });

    // Passing unlocks review lessons + the next lesson server-side.
    if (passed) await get().refreshProgress();

    return passed;
  },

  // --------------------------------------------------------
  // UPDATE VOCAB — localStorage only, no server table yet
  // --------------------------------------------------------
  updateVocab: async (userId: string, wordId: string, status: 'learning' | 'known') => {
    const { vocab } = get();
    const nextReview = Date.now() + (status === 'known' ? 86400000 * 3 : 86400000);
    const newVocab = { ...vocab, [wordId]: { status, nextReview } };
    set({ vocab: newVocab });
    try {
      localStorage.setItem(vocabKey(userId), JSON.stringify(newVocab));
    } catch (e) {
      console.warn('[PROGRESS] Failed to save vocab to localStorage:', e);
      set({ error: 'Kosakata tidak bisa disimpan di perangkat ini.' });
    }
  },

  // --------------------------------------------------------
  // UPDATE STREAK — update_streak RPC owns the calendar logic
  // --------------------------------------------------------
  updateStreak: async (_clerkUserId: string) => {
    const today = new Date().toISOString().split('T')[0];
    if (get().lastPracticeDate === today) return;

    set({ saving: true });
    const { error, status } = await dbProxy('update-streak');
    if (error) {
      set({ saving: false, error: failureMessage('update-streak', error, status) });
      return;
    }

    await get().refreshProgress();
    set({ saving: false });
  },

  // --------------------------------------------------------
  // STUDY TIME
  // --------------------------------------------------------
  fetchStudyTime: async () => {
    const { data, error, status } = await dbProxy('get-study-time');
    if (error) {
      set({ error: failureMessage('get-study-time', error, status) });
      return get().studyTimeSeconds;
    }

    // get_study_time is a set-returning RPC; tolerate row / object / scalar.
    const row = Array.isArray(data) ? data[0] : data;
    const seconds = Number(
      typeof row === 'number' ? row : (row?.total_seconds ?? row?.totalSeconds ?? 0)
    );
    const studyTimeSeconds = Number.isFinite(seconds) ? seconds : 0;
    set({ studyTimeSeconds });
    return studyTimeSeconds;
  },

  // --------------------------------------------------------
  // ACCESS CHECK
  // --------------------------------------------------------
  canAccessLesson: async (lessonId: string) => {
    const { data, error, status } = await dbProxy('can-access', { lessonId });
    if (error) {
      set({ error: failureMessage('can-access', error, status) });
      return false;
    }
    return data?.allowed === true;
  },
}));
