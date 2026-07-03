import { useRef, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { resolveInternalId } from '../lib/clerk/identity';

/**
 * useLessonTimer — tracks real study time per lesson.
 * Starts a session on mount, ends on unmount or manual stop.
 * Persists to study_sessions table via Supabase.
 */
export function useLessonTimer(lessonId: string | undefined) {
  const sessionRef = useRef<string | null>(null);
  const startRef = useRef<number>(0);
  const { user } = useAuthStore();

  // Start session
  useEffect(() => {
    if (!user?.id || !lessonId) return;

    let cancelled = false;
    (async () => {
      const internalId = await resolveInternalId(user.id);
      if (!internalId || cancelled) return;

      startRef.current = Date.now();
      const { data, error } = await supabase
        .from('study_sessions')
        .insert({
          user_id: internalId,
          lesson_id: lessonId,
          started_at: new Date().toISOString(),
          duration_seconds: 0,
        })
        .select('id')
        .single();

      if (error) {
        console.error('[TIMER] Failed to start session:', error.message);
        return;
      }
      if (!cancelled && data) {
        sessionRef.current = data.id;
      }
    })();

    // End session on unmount
    return () => {
      cancelled = true;
      endSession();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, lessonId]);

  const endSession = useCallback(async () => {
    const sessionId = sessionRef.current;
    if (!sessionId) return;

    const duration = Math.round((Date.now() - startRef.current) / 1000);
    if (duration < 1) {
      // Too short, delete the session
      await supabase.from('study_sessions').delete().eq('id', sessionId);
      sessionRef.current = null;
      return;
    }

    const { error } = await supabase
      .from('study_sessions')
      .update({
        ended_at: new Date().toISOString(),
        duration_seconds: duration,
      })
      .eq('id', sessionId);

    if (error) {
      console.error('[TIMER] Failed to end session:', error.message);
    }
    sessionRef.current = null;
  }, []);

  return { endSession };
}
