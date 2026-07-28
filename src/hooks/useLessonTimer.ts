import { useRef, useEffect, useCallback, useState } from 'react';
import { dbProxy } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

/**
 * useLessonTimer — tracks real study time per lesson.
 *
 * Opens a session when the lesson opens, closes it on unmount, on manual stop,
 * and whenever the tab is hidden; opens a fresh one when the tab comes back.
 * Without the hidden/visible pair a tab left open overnight would bank the whole
 * night as study time, and a closed tab would leave the row open forever.
 *
 * Persistence goes through /api/db-proxy (start-session / end-session), which
 * verifies the Clerk token server-side. The browser holds the Supabase anon key
 * only, so auth.uid() is NULL under Clerk and a direct insert into
 * study_sessions is always rejected by RLS — which is why that table was empty.
 */

/** Human-readable failure text. The timer must never block the lesson. */
function failureMessage(action: string, error?: string, status?: number): string {
  console.error(`[TIMER] ${action} failed (${status ?? '?'}):`, error);
  if (status === 401) return 'Sesi kamu berakhir, jadi waktu belajar ini belum tercatat.';
  if (status === 0) return 'Koneksi terputus, jadi waktu belajar ini belum tercatat.';
  return 'Waktu belajar untuk sesi ini belum tercatat.';
}

export function useLessonTimer(lessonId: string | undefined) {
  const { user } = useAuthStore();

  const sessionRef = useRef<string | null>(null);
  const startedAtRef = useRef<number>(0);
  /** Whether a session should be running right now (mounted, visible, allowed). */
  const shouldRunRef = useRef(false);
  const lessonRef = useRef<string | undefined>(lessonId);
  const userRef = useRef<string | undefined>(user?.id);
  /**
   * Every start/stop runs one at a time on this chain. Without it, an unmount
   * during a start-session round trip would stop nothing and leave a row that
   * never ends, and a fast remount would drop the timer entirely.
   */
  const queueRef = useRef<Promise<void>>(Promise.resolve());

  const [error, setError] = useState<string | null>(null);

  // Declared before the session effect below, so the refs are already current
  // by the time it runs on the same commit.
  useEffect(() => {
    lessonRef.current = lessonId;
    userRef.current = user?.id;
  }, [lessonId, user?.id]);

  const enqueue = useCallback((task: () => Promise<void>) => {
    // The chain must never end up rejected: LessonView awaits endSession()
    // before completing the lesson, and a throw there would cost the learner
    // their XP.
    const next = queueRef.current
      .then(task, task)
      .catch((e) => {
        console.error('[TIMER] session task crashed:', e);
      });
    queueRef.current = next;
    return next;
  }, []);

  /** Closes the open session. Only ever called from inside the queue. */
  const stopNow = useCallback(async () => {
    const sessionId = sessionRef.current;
    if (!sessionId) return;

    sessionRef.current = null;
    const startedAt = startedAtRef.current;
    startedAtRef.current = 0;

    const durationSeconds = startedAt > 0
      ? Math.max(0, Math.round((Date.now() - startedAt) / 1000))
      : 0;

    // Sessions under 5 seconds are discarded server-side, so there is no guard
    // here — that decision stays in one place.
    const { error: endError, status } = await dbProxy('end-session', {
      sessionId,
      durationSeconds,
    });

    if (endError) setError(failureMessage('end-session', endError, status));
    else setError(null);
  }, []);

  /**
   * Opens a session for `lesson`. Only ever called from inside the queue.
   * The lesson is passed in rather than read from the ref so a start queued for
   * the previous lesson cannot open a row against the next one.
   */
  const startFor = useCallback(async (lesson: string) => {
    if (sessionRef.current) return;
    if (!shouldRunRef.current) return;
    if (lessonRef.current !== lesson) return;

    const userId = userRef.current;
    if (!userId || !lesson) return;

    // Stamped before the request so the round trip is not counted as study time.
    const startedAt = Date.now();
    const { data, error: startError, status } = await dbProxy('start-session', {
      lessonId: lesson,
    });

    if (startError || !data?.sessionId) {
      setError(failureMessage('start-session', startError, status));
      return;
    }

    sessionRef.current = String(data.sessionId);
    startedAtRef.current = startedAt;
    setError(null);

    // The lesson was left while the request was open. Close the row now —
    // calling stopNow directly is safe, we already hold the queue.
    if (!shouldRunRef.current || lessonRef.current !== lesson) await stopNow();
  }, [stopNow]);

  const endSession = useCallback(() => enqueue(stopNow), [enqueue, stopNow]);

  useEffect(() => {
    if (!user?.id || !lessonId) return;

    const activeLesson = lessonId;
    shouldRunRef.current = true;
    void enqueue(() => startFor(activeLesson));

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        // Bank what has been studied so far: a hidden tab is not study time.
        void enqueue(stopNow);
      } else if (shouldRunRef.current) {
        void enqueue(() => startFor(activeLesson));
      }
    };
    // Best effort on close. The request may be cut short, but `hidden` fires
    // first in every browser with a back/forward cache, so the row is normally
    // already closed by then.
    const handlePageHide = () => {
      void enqueue(stopNow);
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      shouldRunRef.current = false;
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pagehide', handlePageHide);
      // Queued, so it runs after any start still in flight and can actually
      // close it. A remount queues its start behind this stop.
      void enqueue(stopNow);
    };
  }, [user?.id, lessonId, enqueue, startFor, stopNow]);

  return { endSession, error };
}
