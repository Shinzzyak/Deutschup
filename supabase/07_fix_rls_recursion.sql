-- 07_fix_rls_recursion.sql
-- REG-005: Remove recursive admin policies on profiles
-- Date: 2026-06-11
-- Root cause: Admin policies query profiles from within profiles → infinite recursion

-- Step 1: Drop recursive policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Step 2: Verify user policies exist (from 03_rls.sql)
-- These should already exist:
-- "Users can view own profile"   — SELECT — auth.uid() = id
-- "Users can update own profile"  — UPDATE — auth.uid() = id
-- "Users can insert own profile"  — INSERT — auth.uid() = id

-- Step 3: Test
-- SELECT * FROM profiles LIMIT 1;  -- Should succeed without recursion
