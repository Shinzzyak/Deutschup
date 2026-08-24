-- STEP 2: CREATE INDEXES

CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_lesson_id ON notes(lesson_id);
CREATE INDEX IF NOT EXISTS idx_study_plans_user_id ON study_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_quick_notes_user_id ON quick_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_mock_tests_user_id ON mock_tests(user_id);
