-- STEP 3: ENABLE RLS + CREATE POLICIES

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_tests ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Progress
CREATE POLICY "Users can view own progress" ON progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON progress FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notes
CREATE POLICY "Users can view own notes" ON notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notes" ON notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON notes FOR DELETE USING (auth.uid() = user_id);

-- Study Plans
CREATE POLICY "Users can view own study_plans" ON study_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own study_plans" ON study_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own study_plans" ON study_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own study_plans" ON study_plans FOR DELETE USING (auth.uid() = user_id);

-- Quick Notes
CREATE POLICY "Users can view own quick_notes" ON quick_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own quick_notes" ON quick_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quick_notes" ON quick_notes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Mock Tests
CREATE POLICY "Users can view own mock_tests" ON mock_tests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mock_tests" ON mock_tests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
