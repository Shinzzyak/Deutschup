-- Migration: Fix chat.ts backend subscription enforcement
-- Date: 2026-06-09
-- Purpose: Create user_daily_usage table for Chat AI rate limiting

-- 1. Create the user_daily_usage table
CREATE TABLE IF NOT EXISTS user_daily_usage (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  gemini_count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, date)
);

-- 2. Enable Row Level Security
ALTER TABLE user_daily_usage ENABLE ROW LEVEL SECURITY;

-- 3. Policies
CREATE POLICY "Users can read own usage" ON user_daily_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access" ON user_daily_usage
  FOR ALL USING (auth.role() = 'service_role');

-- 4. Add index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_daily_usage_lookup ON user_daily_usage(user_id, date);
