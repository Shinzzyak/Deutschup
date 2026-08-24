-- Fix N11: can_access_lesson fail-open for unknown lessons.
-- Before: unknown lessonId → level_id NULL → v_level_sort NULL → `NULL <= 1`
-- evaluates TRUE in Postgres → {allowed:true}. Now fail-closed: unknown
-- lesson → false. (complete_lesson already gates on this RPC, so this also
-- blocks completing nonexistent lessons.)

CREATE OR REPLACE FUNCTION public.can_access_lesson(p_user_id uuid, p_lesson_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_unlocked JSONB;
  v_level TEXT;
  v_level_sort INTEGER;
  v_prev_level TEXT;
  v_prev_checkpoint_id TEXT;
  v_passed BOOLEAN;
BEGIN
  -- Unknown lessons are not accessible (fail-closed).
  SELECT level_id INTO v_level FROM curriculum_lessons WHERE id = p_lesson_id;
  IF v_level IS NULL THEN
    RETURN false;
  END IF;

  -- Check if already unlocked
  SELECT unlocked_lessons INTO v_unlocked
  FROM user_curriculum_progress
  WHERE user_id = p_user_id;

  IF v_unlocked IS NULL THEN
    RETURN p_lesson_id = 'a1-1'; -- first lesson
  END IF;

  IF v_unlocked ? p_lesson_id THEN
    RETURN true;
  END IF;

  -- Check level progression: is this the first lesson of a new level?
  SELECT sort_order INTO v_level_sort FROM curriculum_levels WHERE id = v_level;

  IF v_level_sort IS NULL OR v_level_sort <= 1 THEN
    RETURN true; -- A1 is always accessible
  END IF;

  -- Get previous level
  SELECT id INTO v_prev_level FROM curriculum_levels WHERE sort_order = v_level_sort - 1;

  -- Check if all checkpoints of previous level are passed
  v_passed := true;
  FOR v_prev_checkpoint_id IN
    SELECT id FROM curriculum_checkpoints WHERE level_id = v_prev_level ORDER BY sort_order
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM user_checkpoint_progress
      WHERE user_id = p_user_id
        AND checkpoint_id = v_prev_checkpoint_id
        AND passed = true
    ) THEN
      v_passed := false;
      EXIT;
    END IF;
  END LOOP;

  RETURN v_passed;
END;
$function$;
