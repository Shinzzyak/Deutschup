import { create } from 'zustand';
import { dbProxy } from '../lib/supabase';

// ============================================================
// Persistence
//
// Everything here goes through /api/db-proxy, which verifies the Clerk token
// server-side and writes with service_role. The browser only ever holds the
// Supabase anon key, so auth.uid() is NULL under Clerk and every RLS policy on
// notes / study_plans / quick_notes / mock_tests rejects a direct call. That is
// exactly why all four tables were empty in production: the old store talked to
// the tables directly and console.error'd the rejection.
//
// Column names below were taken from the live PostgREST schema, not from the
// .sql files in this repo — those have drifted.
//   notes:       id, user_id, lesson_id, title, content, category, created_at, updated_at
//   study_plans: id, user_id, title, content, duration_days, status, created_at, updated_at
//   quick_notes: id, user_id, content, created_at, updated_at
//   mock_tests:  id, user_id, level, score, total_questions, answers, completed_at, created_at
// ============================================================

// ============================================================
// Types
//
// Every object keeps the field names the screens already read (note.text,
// note.tag, plan.tasks, quickNote.text/updatedAt, mockTest.total) as aliases
// over the real columns, so no call site has to change.
// ============================================================

export type NoteTag = 'Grammar' | 'Kosakata' | 'Pengucapan' | 'Umum';

export type Note = {
  id: string;
  /** notes.content — `text` is the legacy alias the UI reads. */
  text: string;
  content: string;
  /** notes.category — `tag` is the legacy alias the UI reads. */
  tag: string;
  category: string;
  title: string | null;
  lessonId: string | null;
  createdAt: number;
  updatedAt: number;
};

export type StudyTask = {
  id: string;
  text: string;
  completed: boolean;
};

export type StudyPlan = {
  id: string;
  /**
   * study_plans has no `tasks` column — only `content TEXT`. The checklist is
   * serialised into content as {"version":1,"tasks":[…]} and parsed back here,
   * so the checkbox feature survives without a schema change.
   */
  tasks: StudyTask[];
  title: string | null;
  content: string;
  durationDays: number | null;
  status: string;
  createdAt: number;
  updatedAt: number;
};

export type QuickNote = {
  id: string | null;
  /** quick_notes.content — `text` is the legacy alias the UI reads. */
  text: string;
  content: string;
  createdAt: number;
  /** Epoch ms. QuickNoteWidget compares this against its on-device draft. */
  updatedAt: number;
};

export type MockTestResult = {
  id: string;
  level: string;
  score: number;
  /** mock_tests.total_questions — `total` is the legacy alias the UI reads. */
  total: number;
  totalQuestions?: number;
  createdAt: number;
  completedAt?: number;
  answers?: unknown;
};

interface LearningState {
  notes: Note[];
  /** Newest plan. The table is append-only, so this is the last one written. */
  studyPlan: StudyPlan | null;
  /** Every plan the server returned, newest first. */
  studyPlans: StudyPlan[];
  quickNote: QuickNote | null;
  mockTests: MockTestResult[];
  loading: boolean;
  /** True while a fetch is in flight. Kept for call-site compatibility. */
  isListening: boolean;
  /** True once a fetch has completed successfully at least once. */
  loaded: boolean;
  /** Last failure, in Indonesian, ready to render. Null when healthy. */
  error: string | null;
  /** A write is in flight. */
  saving: boolean;

  // Actions
  fetchData: (userId: string) => Promise<void>;
  addNote: (userId: string, text: string, tag?: string, lessonId?: string) => Promise<boolean>;
  deleteNote: (userId: string, noteId: string) => Promise<boolean>;

  saveStudyPlan: (userId: string, tasks: StudyTask[]) => Promise<boolean>;
  toggleTask: (userId: string, taskId: string) => Promise<boolean>;
  /** Writes a debounced study-plan edit immediately. Safe to call when idle. */
  flushStudyPlan: () => Promise<boolean>;

  saveQuickNote: (userId: string, text: string) => Promise<boolean>;
  saveMockTest: (
    userId: string,
    result: Omit<MockTestResult, 'id'> & { answers?: unknown }
  ) => Promise<boolean>;

  clearError: () => void;
}

// ============================================================
// Limits — mirror the caps db-proxy applies, so nothing is silently truncated
// ============================================================

const MAX_NOTE_CHARS = 20000;
const MAX_QUICK_NOTE_CHARS = 10000;
const MAX_PLAN_CONTENT_CHARS = 40000;
const MAX_TASKS = 60;
const MAX_TASK_CHARS = 400;
const MAX_NOTE_TITLE_CHARS = 120;

const PLAN_TITLE = 'Rencana belajar';
const PLAN_ENVELOPE_VERSION = 1;
/** Ticking a checkbox inserts a row, so rapid ticks are coalesced into one. */
const PLAN_DEBOUNCE_MS = 900;

// ============================================================
// Helpers
// ============================================================

/** Human-readable failure text for the UI. Never swallow a write error. */
function failureMessage(action: string, error?: string, status?: number): string {
  console.error(`[LEARNING] ${action} failed (${status ?? '?'}):`, error);
  if (status === 401) return 'Sesi kamu berakhir. Silakan masuk lagi agar catatanmu tersimpan.';
  if (status === 0) return 'Koneksi terputus. Perubahan terakhir belum tersimpan.';
  // notes / study_plans / quick_notes / mock_tests still carry a foreign key to
  // auth.users, which no Clerk account has a row in, so every insert comes back
  // as 23503 until supabase/19_decouple_auth_users_fk.sql is run. Say so plainly
  // instead of asking the learner to "try again" forever.
  if (error && /foreign key|23503/i.test(error)) {
    return 'Server belum siap menyimpan bagian ini. Salin dulu tulisanmu, lalu laporkan ke admin.';
  }
  return 'Belum bisa tersimpan ke server. Coba lagi sebentar lagi.';
}

/** Postgres timestamps arrive as ISO strings; the UI works in epoch ms. */
function toMillis(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value) {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return 0;
}

function toText(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

/** First line of a note, used as notes.title so rows are readable in the DB. */
function deriveTitle(content: string): string | null {
  const firstLine = content.split('\n').map((l) => l.trim()).find(Boolean);
  if (!firstLine) return null;
  return firstLine.length > MAX_NOTE_TITLE_CHARS
    ? `${firstLine.slice(0, MAX_NOTE_TITLE_CHARS - 1)}…`
    : firstLine;
}

function normalizeTasks(tasks: StudyTask[] | undefined | null): StudyTask[] {
  if (!Array.isArray(tasks)) return [];
  return tasks
    .filter((t) => t && typeof t.text === 'string' && t.text.trim())
    .slice(0, MAX_TASKS)
    .map((t, i) => ({
      id: typeof t.id === 'string' && t.id ? t.id : `task-${i}`,
      text: t.text.trim().slice(0, MAX_TASK_CHARS),
      completed: t.completed === true,
    }));
}

/**
 * Serialise the checklist into study_plans.content. db-proxy slices the column
 * at 40k, and a sliced JSON string would no longer parse, so drop trailing
 * tasks until the envelope fits instead of letting the server cut it.
 */
function serializePlanContent(tasks: StudyTask[]): string {
  let kept = tasks;
  let json = JSON.stringify({ version: PLAN_ENVELOPE_VERSION, tasks: kept });
  while (json.length > MAX_PLAN_CONTENT_CHARS && kept.length > 0) {
    kept = kept.slice(0, -1);
    json = JSON.stringify({ version: PLAN_ENVELOPE_VERSION, tasks: kept });
  }
  return json;
}

/**
 * Read the checklist back out of content. Anything that is not our envelope
 * (a hand-written plan, an older format) degrades to one task per line rather
 * than showing an empty plan.
 */
function parsePlanContent(content: unknown): StudyTask[] {
  const raw = toText(content);
  if (!raw.trim()) return [];

  try {
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed)
      ? parsed
      : Array.isArray((parsed as any)?.tasks)
        ? (parsed as any).tasks
        : null;
    if (list) {
      return normalizeTasks(
        list.map((t: any, i: number) => ({
          id: typeof t?.id === 'string' && t.id ? t.id : `task-${i}`,
          text: typeof t?.text === 'string' ? t.text : String(t ?? ''),
          completed: t?.completed === true,
        }))
      );
    }
  } catch {
    // Not JSON — fall through to the plain-text reading below.
  }

  return normalizeTasks(
    raw
      .split('\n')
      .map((line) => line.replace(/^\s*[-*•]\s*/, '').trim())
      .filter(Boolean)
      .map((text, i) => ({ id: `line-${i}`, text, completed: false }))
  );
}

/** True when only the completed flags differ — i.e. a checkbox tick. */
function sameTaskSkeleton(a: StudyTask[], b: StudyTask[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((task, i) => task.id === b[i].id && task.text === b[i].text);
}

// ---- row mappers ----

function mapNote(row: any): Note {
  const content = toText(row?.content);
  const category = toText(row?.category) || 'Umum';
  return {
    id: String(row?.id ?? ''),
    text: content,
    content,
    tag: category,
    category,
    title: typeof row?.title === 'string' ? row.title : null,
    lessonId: typeof row?.lesson_id === 'string' ? row.lesson_id : null,
    createdAt: toMillis(row?.created_at),
    updatedAt: toMillis(row?.updated_at) || toMillis(row?.created_at),
  };
}

function mapStudyPlan(row: any): StudyPlan {
  const content = toText(row?.content);
  const durationDays = Number(row?.duration_days);
  return {
    id: String(row?.id ?? ''),
    tasks: parsePlanContent(content),
    title: typeof row?.title === 'string' ? row.title : null,
    content,
    durationDays: Number.isFinite(durationDays) ? durationDays : null,
    status: toText(row?.status) || 'active',
    createdAt: toMillis(row?.created_at),
    updatedAt: toMillis(row?.updated_at) || toMillis(row?.created_at),
  };
}

function mapQuickNote(row: any): QuickNote {
  const content = toText(row?.content);
  const updatedAt = toMillis(row?.updated_at) || toMillis(row?.created_at);
  return {
    id: row?.id != null ? String(row.id) : null,
    text: content,
    content,
    createdAt: toMillis(row?.created_at),
    updatedAt,
  };
}

function mapMockTest(row: any): MockTestResult {
  const total = Number(row?.total_questions);
  const score = Number(row?.score);
  return {
    id: String(row?.id ?? ''),
    level: toText(row?.level) || 'A1',
    score: Number.isFinite(score) ? score : 0,
    // Guarded: the dashboard divides by this to build an average.
    total: Number.isFinite(total) && total > 0 ? total : 1,
    totalQuestions: Number.isFinite(total) && total > 0 ? total : 1,
    createdAt: toMillis(row?.created_at) || toMillis(row?.completed_at),
    completedAt: toMillis(row?.completed_at) || undefined,
    answers: row?.answers ?? undefined,
  };
}

const tempId = (prefix: string) =>
  `${prefix}-local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

// ============================================================
// Store
// ============================================================

export const useLearningStore = create<LearningState>((set, get) => {
  // ---- fetch de-duplication ------------------------------------------------
  // Catatan, Simulasi and QuickNoteWidget all call fetchData; without this a
  // single navigation fires three identical requests.
  let inFlightFetch: Promise<void> | null = null;

  // ---- study-plan write coalescing ----------------------------------------
  // save-study-plan always INSERTs, so one row per checkbox tick would pile up.
  // Ticks inside PLAN_DEBOUNCE_MS collapse into a single insert; a structural
  // change (a freshly generated plan) is written immediately.
  let planPending: StudyTask[] | null = null;
  let planTimer: ReturnType<typeof setTimeout> | null = null;
  let planInFlight: Promise<boolean> | null = null;
  let planWaiters: Array<(ok: boolean) => void> = [];
  /** Last server-confirmed plan, kept so a failed write can be rolled back. */
  let planRollback: { plan: StudyPlan | null } | null = null;
  let hideFlushAttached = false;

  const settlePlanWaiters = (ok: boolean) => {
    const waiters = planWaiters;
    planWaiters = [];
    waiters.forEach((resolve) => resolve(ok));
  };

  const writePlan = async (): Promise<boolean> => {
    const tasks = planPending;
    if (!tasks) return true;
    planPending = null;

    set({ saving: true });
    const { data, error, status } = await dbProxy('save-study-plan', {
      title: PLAN_TITLE,
      content: serializePlanContent(tasks),
      status: 'active',
    });

    if (error || !data) {
      const rollback = planRollback;
      planRollback = null;
      // Only revert the visible plan when no newer edit is already queued —
      // otherwise the rollback would throw away what the user just did.
      const revert = rollback !== null && planPending === null;
      set({
        studyPlan: revert ? rollback.plan : get().studyPlan,
        saving: false,
        error: failureMessage('save-study-plan', error, status),
      });
      settlePlanWaiters(false);
      return false;
    }

    planRollback = null;
    const saved = mapStudyPlan(data);
    set({
      studyPlan: planPending === null ? saved : get().studyPlan,
      studyPlans: [saved, ...get().studyPlans.filter((p) => p.id !== saved.id)],
      saving: false,
      error: null,
    });
    settlePlanWaiters(true);
    return true;
  };

  const flushStudyPlan = (): Promise<boolean> => {
    if (planTimer !== null) {
      clearTimeout(planTimer);
      planTimer = null;
    }
    if (planPending === null) return planInFlight ?? Promise.resolve(true);
    // Chain so two inserts can never race and land out of order — the newest
    // row wins on read, and "newest" is decided by the server's created_at.
    const run = () => writePlan();
    planInFlight = (planInFlight ?? Promise.resolve(true)).then(run, run);
    return planInFlight;
  };

  const schedulePlanFlush = () => {
    if (planTimer !== null) clearTimeout(planTimer);
    planTimer = setTimeout(() => {
      planTimer = null;
      void flushStudyPlan();
    }, PLAN_DEBOUNCE_MS);
  };

  /**
   * A debounced tick must not be lost when the tab is hidden or closed. This is
   * best-effort: a browser that kills the page immediately can still drop the
   * request, which is why the debounce window is short.
   */
  const attachHideFlush = () => {
    if (hideFlushAttached || typeof document === 'undefined') return;
    hideFlushAttached = true;
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') void flushStudyPlan();
    });
    if (typeof window !== 'undefined') {
      window.addEventListener('pagehide', () => void flushStudyPlan());
    }
  };

  return {
    notes: [],
    studyPlan: null,
    studyPlans: [],
    quickNote: null,
    mockTests: [],
    loading: false,
    isListening: false,
    loaded: false,
    error: null,
    saving: false,

    clearError: () => set({ error: null }),

    // --------------------------------------------------------
    // FETCH — one round trip for notes + plans + quick note + mock tests
    // --------------------------------------------------------
    fetchData: async (_clerkUserId: string) => {
      if (inFlightFetch) return inFlightFetch;

      set({ loading: true, isListening: true });

      inFlightFetch = (async () => {
        try {
          const { data, error, status } = await dbProxy('get-learning');

          if (error || !data) {
            set({
              loading: false,
              isListening: false,
              error: failureMessage('get-learning', error, status),
            });
            return;
          }

          const notes = Array.isArray(data.notes) ? data.notes.map(mapNote) : [];
          const plans = Array.isArray(data.studyPlans) ? data.studyPlans.map(mapStudyPlan) : [];
          const mockTests = Array.isArray(data.mockTests) ? data.mockTests.map(mapMockTest) : [];
          const quickNote = data.quickNote ? mapQuickNote(data.quickNote) : null;

          // An unflushed local edit outranks the server copy; overwriting it
          // here would silently undo a checkbox the user just ticked.
          const planDirty = planPending !== null || planRollback !== null;

          set({
            notes,
            studyPlans: plans,
            studyPlan: planDirty ? get().studyPlan : (plans[0] ?? null),
            quickNote,
            mockTests,
            loading: false,
            isListening: false,
            loaded: true,
            error: null,
          });
        } catch (e) {
          // A shape we could not read is still a failure the screen must show.
          console.error('[LEARNING] get-learning could not be read:', e);
          set({
            loading: false,
            isListening: false,
            error: 'Data belajarmu belum bisa dibaca. Muat ulang halaman ini, ya.',
          });
        } finally {
          inFlightFetch = null;
        }
      })();

      return inFlightFetch;
    },

    // --------------------------------------------------------
    // NOTES
    // --------------------------------------------------------
    addNote: async (_clerkUserId: string, text: string, tag?: string, lessonId?: string) => {
      const content = (text ?? '').trim().slice(0, MAX_NOTE_CHARS);
      if (!content) return false;

      const category = (tag ?? 'Umum').trim() || 'Umum';
      const optimistic: Note = {
        id: tempId('note'),
        text: content,
        content,
        tag: category,
        category,
        title: deriveTitle(content),
        lessonId: lessonId ?? null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      set({ notes: [optimistic, ...get().notes], saving: true, error: null });

      const { data, error, status } = await dbProxy('save-note', {
        content,
        category,
        title: optimistic.title,
        lessonId: lessonId ?? undefined,
      });

      if (error || !data) {
        // Roll the optimistic note back. Catatan infers failure from the count.
        set({
          notes: get().notes.filter((n) => n.id !== optimistic.id),
          saving: false,
          error: failureMessage('save-note', error, status),
        });
        return false;
      }

      const saved = mapNote(data);
      set({
        notes: get().notes.map((n) => (n.id === optimistic.id ? saved : n)),
        saving: false,
        error: null,
      });
      return true;
    },

    deleteNote: async (_clerkUserId: string, noteId: string) => {
      if (!noteId) return false;

      const before = get().notes;
      const index = before.findIndex((n) => n.id === noteId);
      if (index === -1) return false;
      const removed = before[index];

      set({ notes: before.filter((n) => n.id !== noteId), saving: true, error: null });

      const { error, status } = await dbProxy('delete-note', { noteId });

      if (error) {
        // Put it back where it was, so the list order does not jump around.
        const current = get().notes.slice();
        current.splice(Math.min(index, current.length), 0, removed);
        set({
          notes: current,
          saving: false,
          error: failureMessage('delete-note', error, status),
        });
        return false;
      }

      set({ saving: false, error: null });
      return true;
    },

    // --------------------------------------------------------
    // STUDY PLAN
    // --------------------------------------------------------
    saveStudyPlan: async (_clerkUserId: string, tasks: StudyTask[]) => {
      const next = normalizeTasks(tasks);
      const current = get().studyPlan;

      if (planRollback === null) planRollback = { plan: current };

      const now = Date.now();
      set({
        studyPlan: {
          id: current?.id ?? tempId('plan'),
          tasks: next,
          title: current?.title ?? PLAN_TITLE,
          content: serializePlanContent(next),
          durationDays: current?.durationDays ?? null,
          status: current?.status ?? 'active',
          createdAt: current?.createdAt ?? now,
          updatedAt: now,
        },
        error: null,
      });

      planPending = next;
      attachHideFlush();

      const waiter = new Promise<boolean>((resolve) => {
        planWaiters.push(resolve);
      });

      // A brand-new list (different tasks) is worth a row of its own right
      // away; a checkbox tick can wait for the debounce window.
      if (current && sameTaskSkeleton(current.tasks, next)) {
        schedulePlanFlush();
      } else {
        void flushStudyPlan();
      }

      return waiter;
    },

    toggleTask: async (clerkUserId: string, taskId: string) => {
      const plan = get().studyPlan;
      if (!plan) return false;
      const next = plan.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t));
      return get().saveStudyPlan(clerkUserId, next);
    },

    flushStudyPlan,

    // --------------------------------------------------------
    // QUICK NOTE — one row per user, updated in place server-side
    // --------------------------------------------------------
    saveQuickNote: async (_clerkUserId: string, text: string) => {
      const content = (text ?? '').slice(0, MAX_QUICK_NOTE_CHARS);
      const previous = get().quickNote;
      const now = Date.now();

      set({
        quickNote: {
          id: previous?.id ?? null,
          text: content,
          content,
          createdAt: previous?.createdAt ?? now,
          updatedAt: now,
        },
        saving: true,
        error: null,
      });

      const { data, error, status } = await dbProxy('save-quick-note', { content });

      if (error || !data) {
        set({
          quickNote: previous,
          saving: false,
          error: failureMessage('save-quick-note', error, status),
        });
        return false;
      }

      set({ quickNote: mapQuickNote(data), saving: false, error: null });
      return true;
    },

    // --------------------------------------------------------
    // MOCK TEST
    // --------------------------------------------------------
    saveMockTest: async (_clerkUserId: string, result) => {
      const score = Number(result.score);
      const total = Number(result.total ?? result.totalQuestions);
      if (!Number.isFinite(score) || !Number.isFinite(total)) {
        set({ error: 'Hasil simulasi tidak lengkap, jadi belum bisa disimpan.' });
        return false;
      }

      const optimistic: MockTestResult = {
        id: tempId('mock'),
        level: result.level || 'A1',
        score: Math.max(0, Math.round(score)),
        total: Math.max(1, Math.round(total)),
        totalQuestions: Math.max(1, Math.round(total)),
        createdAt: Number(result.createdAt) || Date.now(),
        answers: result.answers,
      };

      set({ mockTests: [optimistic, ...get().mockTests], saving: true, error: null });

      const { data, error, status } = await dbProxy('save-mock-test', {
        level: optimistic.level,
        score: optimistic.score,
        totalQuestions: optimistic.total,
        answers: result.answers ?? undefined,
      });

      if (error || !data) {
        // Roll back: the weekly free quota is counted off this list, so a
        // phantom row would cost the learner an attempt they never used.
        set({
          mockTests: get().mockTests.filter((t) => t.id !== optimistic.id),
          saving: false,
          error: failureMessage('save-mock-test', error, status),
        });
        return false;
      }

      const saved = mapMockTest(data);
      set({
        mockTests: get().mockTests.map((t) => (t.id === optimistic.id ? saved : t)),
        saving: false,
        error: null,
      });
      return true;
    },
  };
});
