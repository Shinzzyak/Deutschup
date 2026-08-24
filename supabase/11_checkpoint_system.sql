-- 11_checkpoint_system.sql
-- Checkpoint validation and unlock logic
-- Date: 2026-06-12
-- Run AFTER 08-10
-- ============================================================

-- ============================================================
-- FUNCTION: Check if user can access a lesson
-- A lesson is accessible if:
--   1. It's in the user's unlocked_lessons array, OR
--   2. It's the first lesson of a new level AND user passed all checkpoints of previous level
-- ============================================================
CREATE OR REPLACE FUNCTION can_access_lesson(
  p_user_id UUID,
  p_lesson_id TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_unlocked JSONB;
  v_level TEXT;
  v_level_sort INTEGER;
  v_prev_level TEXT;
  v_prev_checkpoint_id TEXT;
  v_passed BOOLEAN;
BEGIN
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
  SELECT level_id INTO v_level FROM curriculum_lessons WHERE id = p_lesson_id;
  SELECT sort_order INTO v_level_sort FROM curriculum_levels WHERE id = v_level;

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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: Complete a lesson and auto-unlock next
-- ============================================================
CREATE OR REPLACE FUNCTION complete_lesson(
  p_user_id UUID,
  p_lesson_id TEXT,
  p_score DECIMAL DEFAULT NULL,
  p_xp_earned INTEGER DEFAULT 10
) RETURNS JSONB AS $$
DECLARE
  v_next_lesson TEXT;
  v_next_checkpoint TEXT;
  v_result JSONB;
BEGIN
  -- Mark lesson complete (upsert)
  INSERT INTO user_lesson_progress (user_id, lesson_id, completed, score, xp_earned, completed_at)
  VALUES (p_user_id, p_lesson_id, true, p_score, p_xp_earned, NOW())
  ON CONFLICT (user_id, lesson_id) DO UPDATE SET
    completed = true,
    score = COALESCE(p_score, user_lesson_progress.score),
    xp_earned = user_lesson_progress.xp_earned + p_xp_earned,
    completed_at = NOW(),
    updated_at = NOW();

  -- Add XP
  UPDATE user_curriculum_progress
  SET xp = xp + p_xp_earned, updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Find next lesson in same kapitel
  SELECT cl.id INTO v_next_lesson
  FROM curriculum_lessons cl
  JOIN curriculum_lessons current ON current.id = p_lesson_id
  WHERE cl.kapitel_id = current.kapitel_id
    AND cl.sort_order > current.sort_order
  ORDER BY cl.sort_order
  LIMIT 1;

  -- If no next lesson in kapitel, check for checkpoint
  IF v_next_lesson IS NULL THEN
    SELECT cp.id INTO v_next_checkpoint
    FROM curriculum_checkpoints cp
    JOIN curriculum_lessons current ON current.id = p_lesson_id
    WHERE cp.level_id = current.level_id
      AND cp.sort_order > (
        SELECT COALESCE(MAX(sort_order), 0)
        FROM curriculum_checkpoints
        WHERE level_id = current.level_id
          AND id IN (
            SELECT checkpoint_id FROM user_checkpoint_progress
            WHERE user_id = p_user_id AND passed = true
          )
      )
    ORDER BY cp.sort_order
    LIMIT 1;

    -- If checkpoint exists and not passed, point to it
    IF v_next_checkpoint IS NOT NULL THEN
      v_next_lesson := v_next_checkpoint;
    ELSE
      -- Find first lesson of next kapitel
      SELECT cl.id INTO v_next_lesson
      FROM curriculum_lessons cl
      JOIN curriculum_lessons current ON current.id = p_lesson_id
      WHERE cl.level_id = current.level_id
        AND cl.kapitel_id > current.kapitel_id
      ORDER BY cl.kapitel_id, cl.sort_order
      LIMIT 1;
    END IF;
  END IF;

  -- Auto-unlock next lesson
  IF v_next_lesson IS NOT NULL THEN
    UPDATE user_curriculum_progress
    SET unlocked_lessons = unlocked_lessons || to_jsonb(v_next_lesson),
        current_lesson_id = v_next_lesson,
        updated_at = NOW()
    WHERE user_id = p_user_id
      AND NOT (unlocked_lessons ? v_next_lesson);
  END IF;

  -- Update streak
  PERFORM update_streak(p_user_id);

  v_result := jsonb_build_object(
    'success', true,
    'xp_earned', p_xp_earned,
    'next_lesson', v_next_lesson,
    'completed_lesson', p_lesson_id
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: Submit checkpoint attempt
-- ============================================================
CREATE OR REPLACE FUNCTION submit_checkpoint(
  p_user_id UUID,
  p_checkpoint_id TEXT,
  p_score DECIMAL,
  p_total_questions INTEGER
) RETURNS JSONB AS $$
DECLARE
  v_required_score DECIMAL;
  v_passed BOOLEAN;
  v_attempts INTEGER;
  v_best_score DECIMAL;
BEGIN
  -- Get required score
  SELECT required_score INTO v_required_score
  FROM curriculum_checkpoints WHERE id = p_checkpoint_id;

  v_passed := p_score >= v_required_score;

  -- Get current attempts
  SELECT attempts, best_score INTO v_attempts, v_best_score
  FROM user_checkpoint_progress
  WHERE user_id = p_user_id AND checkpoint_id = p_checkpoint_id;

  v_attempts := COALESCE(v_attempts, 0) + 1;
  v_best_score := GREATEST(COALESCE(v_best_score, 0), p_score);

  -- Upsert attempt
  INSERT INTO user_checkpoint_progress (
    user_id, checkpoint_id, passed, score, attempts, best_score, last_attempt_at
  )
  VALUES (p_user_id, p_checkpoint_id, v_passed, p_score, v_attempts, v_best_score, NOW())
  ON CONFLICT (user_id, checkpoint_id) DO UPDATE SET
    passed = user_checkpoint_progress.passed OR v_passed,
    score = p_score,
    attempts = v_attempts,
    best_score = v_best_score,
    last_attempt_at = NOW(),
    updated_at = NOW();

  -- If passed, unlock all lessons in the checkpoint's review_lessons AND next lesson
  IF v_passed THEN
    -- Unlock reviewed lessons
    UPDATE user_curriculum_progress
    SET unlocked_lessons = (
      SELECT jsonb_agg(DISTINCT val)
      FROM (
        SELECT jsonb_array_elements_text(unlocked_lessons) AS val
        UNION
        SELECT jsonb_array_elements_text(
          (SELECT review_lessons FROM curriculum_checkpoints WHERE id = p_checkpoint_id)
        ) AS val
      ) sub
    ),
    updated_at = NOW()
    WHERE user_id = p_user_id;

    -- Unlock next lesson after checkpoint
    UPDATE user_curriculum_progress
    SET unlocked_lessons = unlocked_lessons || to_jsonb(next_id),
        current_lesson_id = COALESCE(current_lesson_id, next_id),
        updated_at = NOW()
    FROM (
      SELECT cl.id AS next_id
      FROM curriculum_checkpoints cp
      JOIN curriculum_lessons cl ON cl.level_id = cp.level_id
      WHERE cp.id = p_checkpoint_id
        AND cl.sort_order > (
          SELECT MAX(ccl.sort_order)
          FROM curriculum_checkpoints ccp
          JOIN curriculum_lessons ccl ON ccl.kapitel_id = ccp.kapitel_id
          WHERE ccp.id = p_checkpoint_id
        )
      ORDER BY cl.sort_order
      LIMIT 1
    ) next
    WHERE user_curriculum_progress.user_id = p_user_id
      AND NOT (user_curriculum_progress.unlocked_lessons ? next.next_id);
  END IF;

  RETURN jsonb_build_object(
    'passed', v_passed,
    'score', p_score,
    'required', v_required_score,
    'attempts', v_attempts,
    'best_score', v_best_score
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: Update streak (called by complete_lesson)
-- ============================================================
CREATE OR REPLACE FUNCTION update_streak(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_last_date DATE;
  v_streak INTEGER;
  v_today DATE := CURRENT_DATE;
BEGIN
  SELECT last_practice_date, streak INTO v_last_date, v_streak
  FROM user_curriculum_progress WHERE user_id = p_user_id;

  IF v_last_date = v_today THEN
    RETURN; -- already practiced today
  END IF;

  IF v_last_date IS NULL OR v_last_date = v_today - 1 THEN
    v_streak := COALESCE(v_streak, 0) + 1;
  ELSE
    v_streak := 1;
  END IF;

  UPDATE user_curriculum_progress
  SET streak = v_streak, last_practice_date = v_today, updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
