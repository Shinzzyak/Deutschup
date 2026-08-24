-- BACKUP-001: Database Backup Procedure
-- DeutschUp Curriculum Migration
-- Date: 2026-06-12
-- Run BEFORE any migration scripts
-- ============================================================

-- 1. CREATE BACKUP TABLES (snapshot current state)
-- These are temporary safety nets, not permanent tables.

-- 1a. Backup progress table
CREATE TABLE IF NOT EXISTS _backup_progress_20260612 AS
SELECT * FROM progress;

-- 1b. Backup profiles table (has subscription columns)
CREATE TABLE IF NOT EXISTS _backup_profiles_20260612 AS
SELECT * FROM profiles;

-- 1c. Backup notes
CREATE TABLE IF NOT EXISTS _backup_notes_20260612 AS
SELECT * FROM notes;

-- 1d. Backup mock_tests
CREATE TABLE IF NOT EXISTS _backup_mock_tests_20260612 AS
SELECT * FROM mock_tests;

-- 2. VERIFICATION QUERIES
-- Run these after backup to confirm row counts match

-- 2a. Row counts
SELECT 'progress' AS tbl, COUNT(*) AS cnt FROM progress
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'notes', COUNT(*) FROM notes
UNION ALL
SELECT 'mock_tests', COUNT(*) FROM mock_tests;

-- 2b. Backup row counts (should match)
SELECT 'backup_progress' AS tbl, COUNT(*) AS cnt FROM _backup_progress_20260612
UNION ALL
SELECT 'backup_profiles', COUNT(*) FROM _backup_profiles_20260612
UNION ALL
SELECT 'backup_notes', COUNT(*) FROM _backup_notes_20260612
UNION ALL
SELECT 'backup_mock_tests', COUNT(*) FROM _backup_mock_tests_20260612;

-- 2c. Spot check: any user with XP > 0 in backup
SELECT user_id, xp, streak, "completedLessons"::text
FROM _backup_progress_20260612
WHERE xp > 0
LIMIT 10;

-- ============================================================
-- RESTORE PROCEDURE (if migration fails)
-- ============================================================
-- Uncomment and run ONLY if rollback is needed:

/*
-- Restore progress
DROP TABLE progress;
CREATE TABLE progress AS SELECT * FROM _backup_progress_20260612;

-- Restore profiles
DROP TABLE profiles;
CREATE TABLE profiles AS SELECT * FROM _backup_profiles_20260612;

-- Restore notes
DROP TABLE notes;
CREATE TABLE notes AS SELECT * FROM _backup_notes_20260612;

-- Restore mock_tests
DROP TABLE mock_tests;
CREATE TABLE mock_tests AS SELECT * FROM _backup_mock_tests_20260612;

-- Re-create indexes (from 02_indexes.sql)
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_lesson_id ON notes(lesson_id);
CREATE INDEX IF NOT EXISTS idx_study_plans_user_id ON study_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_quick_notes_user_id ON quick_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_mock_tests_user_id ON mock_tests(user_id);

-- Re-create triggers (from 04_triggers.sql)
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_progress_updated_at BEFORE UPDATE ON progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_study_plans_updated_at BEFORE UPDATE ON study_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quick_notes_updated_at BEFORE UPDATE ON quick_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Re-create RLS policies (from 03_rls.sql)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
-- ... (see full 03_rls.sql for all policies)
*/

-- ============================================================
-- CLEANUP (after migration is verified, remove backup tables)
-- ============================================================
-- Run this ONLY after migration is confirmed working in production:

/*
DROP TABLE IF EXISTS _backup_progress_20260612;
DROP TABLE IF EXISTS _backup_profiles_20260612;
DROP TABLE IF EXISTS _backup_notes_20260612;
DROP TABLE IF EXISTS _backup_mock_tests_20260612;
*/
