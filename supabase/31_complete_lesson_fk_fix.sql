-- Fix N15: complete_lesson FK violation when next_lesson is a checkpoint.
-- The next-lesson logic can return a checkpoint id (e.g. 'a1-checkpoint-2'),
-- which is NOT a row in curriculum_lessons. Setting current_lesson_id to it
-- violated user_curriculum_progress_current_lesson_id_fkey → 500 on lessons
-- whose next unit is a checkpoint. Now current_lesson_id is only updated when
-- the next unit is a real lesson; unlocked_lessons still gets the id (that
-- column has no FK).
--
-- Combined with N14 (XP granted once per lesson) — same function.

CREATE OR REPLACE FUNCTION public.complete_lesson(p_user_id uuid, p_lesson_id text, p_score numeric DEFAULT NULL::numeric, p_xp_earned integer DEFAULT 10)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_next_lesson TEXT;
  v_next_checkpoint TEXT;
  v_result JSONB;
  v_allowed BOOLEAN;
  v_existing_xp integer;
  v_granted integer;
BEGIN
  -- Gate: only allow completing lessons the user can access (N10).
  SELECT public.can_access_lesson(p_user_id, p_lesson_id) INTO v_allowed;
  IF v_allowed IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Lesson is not accessible yet' USING ERRCODE = '42501';
  END IF;

  -- N14: XP granted once per lesson. Re-completing only refreshes the timestamp.
  SELECT xp_earned INTO v_existing_xp
  FROM user_lesson_progress
  WHERE user_id = p_user_id AND lesson_id = p_lesson_id;

  v_granted := GREATEST(0, p_xp_earned);
  IF v_existing_xp IS NULL THEN
    INSERT INTO user_lesson_progress (user_id, lesson_id, completed, score, xp_earned, completed_at)
    VALUES (p_user_id, p_lesson_id, true, p_score, v_granted, NOW())
    ON CONFLICT (user_id, lesson_id) DO UPDATE SET
      completed = true,
      score = COALESCE(p_score, user_lesson_progress.score),
      xp_earned = v_granted,
      completed_at = NOW(),
      updated_at = NOW();
  ELSE
    UPDATE user_lesson_progress
    SET completed = true, score = COALESCE(p_score, score), completed_at = NOW(), updated_at = NOW()
    WHERE user_id = p_user_id AND lesson_id = p_lesson_id;
    v_granted := 0;
  END IF;

  -- Add XP (only the first completion grants it)
  IF v_granted > 0 THEN
    UPDATE user_curriculum_progress SET xp = xp + v_granted, updated_at = NOW() WHERE user_id = p_user_id;
  END IF;

  -- Find next lesson in same kapitel
  SELECT cl.id INTO v_next_lesson
  FROM curriculum_lessons cl
  JOIN curriculum_lessons current ON current.id = p_lesson_id
  WHERE cl.kapitel_id = current.kapitel_id AND cl.sort_order > current.sort_order
  ORDER BY cl.sort_order LIMIT 1;

  -- If no next lesson in kapitel, check for checkpoint
  IF v_next_lesson IS NULL THEN
    SELECT cp.id INTO v_next_checkpoint
    FROM curriculum_checkpoints cp
    JOIN curriculum_lessons current ON current.id = p_lesson_id
    WHERE cp.level_id = current.level_id
      AND cp.sort_order > (
        SELECT COALESCE(MAX(sort_order), 0) FROM curriculum_checkpoints
        WHERE level_id = current.level_id
          AND id IN (SELECT checkpoint_id FROM user_checkpoint_progress WHERE user_id = p_user_id AND passed = true)
      )
    ORDER BY cp.sort_order LIMIT 1;

    IF v_next_checkpoint IS NOT NULL THEN
      v_next_lesson := v_next_checkpoint;
    ELSE
      -- Find first lesson of next kapitel
      SELECT cl.id INTO v_next_lesson
      FROM curriculum_lessons cl
      JOIN curriculum_lessons current ON current.id = p_lesson_id
      WHERE cl.level_id = current.level_id AND cl.kapitel_id > current.kapitel_id
      ORDER BY cl.kapitel_id, cl.sort_order LIMIT 1;
    END IF;
  END IF;

  -- Auto-unlock next lesson
  IF v_next_lesson IS NOT NULL THEN
    UPDATE user_curriculum_progress
    SET unlocked_lessons = unlocked_lessons || to_jsonb(v_next_lesson),
        -- N15: checkpoint ids are not rows in curriculum_lessons — setting
        -- current_lesson_id to one violated the FK (500). Only set it for
        -- real lessons.
        current_lesson_id = CASE WHEN EXISTS (SELECT 1 FROM curriculum_lessons cl WHERE cl.id = v_next_lesson)
                                 THEN v_next_lesson ELSE current_lesson_id END,
        updated_at = NOW()
    WHERE user_id = p_user_id AND NOT (unlocked_lessons ? v_next_lesson);
  END IF;

  -- Update streak
  PERFORM update_streak(p_user_id);

  v_result := jsonb_build_object('success', true, 'xp_earned', v_granted, 'next_lesson', v_next_lesson, 'completed_lesson', p_lesson_id);
  RETURN v_result;
END;
$function$;
