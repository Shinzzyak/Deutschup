-- Fix N13: can_access_lesson must gate PRO levels (B2+) behind tier='pro'.
-- Before: any user who passed all checkpoints (answers readable from the
-- public JS bundle) could unlock B2+ lessons → access paid content free.
-- Now: B2+ requires tier='pro' (or role='admin') regardless of progression.
--
-- NOTE: this is the paywall fix. The anti-cheat gap (checkpoint answers
-- shipped in the client bundle) is tracked separately — moving checkpoint
-- questions server-side is a client refactor, not a DB change.

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
  v_tier TEXT;
  v_role TEXT;
BEGIN
  -- Unknown lessons are not accessible (fail-closed).
  SELECT level_id INTO v_level FROM curriculum_lessons WHERE id = p_lesson_id;
  IF v_level IS NULL THEN
    RETURN false;
  END IF;

  -- N13: PRO level gate. B2 and above are paid content — tier must be pro
  -- (or admin) no matter how far the user has progressed.
  SELECT sort_order INTO v_level_sort FROM curriculum_levels WHERE id = v_level;
  IF v_level_sort IS NULL THEN
    RETURN false;
  END IF;
  IF v_level_sort >= 4 THEN
    SELECT tier, role INTO v_tier, v_role FROM profiles WHERE id = p_user_id;
    IF COALESCE(v_role, 'user') <> 'admin' AND COALESCE(v_tier, 'free') <> 'pro' THEN
      RETURN false;  -- free user cannot access B2+ at all
    END IF;
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
  IF v_level_sort <= 1 THEN
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
