-- Migration: Create ai_requests table for AI monitoring
-- Date: 2026-06-10
-- Purpose: Log all AI API requests for monitoring and analytics

-- 1. Create the ai_requests table
CREATE TABLE IF NOT EXISTS ai_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  endpoint TEXT NOT NULL,
  model TEXT NOT NULL,
  latency_ms INTEGER NOT NULL,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_ai_requests_created_at ON ai_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_requests_endpoint ON ai_requests(endpoint);
CREATE INDEX IF NOT EXISTS idx_ai_requests_user_id ON ai_requests(user_id);

-- 3. Enable Row Level Security
ALTER TABLE ai_requests ENABLE ROW LEVEL SECURITY;

-- 4. Policies
CREATE POLICY "Service role full access" ON ai_requests
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can insert own requests" ON ai_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. View for quick stats
CREATE OR REPLACE VIEW v_ai_stats_today AS
SELECT
  COUNT(*) as total_requests,
  ROUND(AVG(latency_ms)) as avg_latency_ms,
  ROUND(COUNT(*) FILTER (WHERE NOT success)::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2) as error_rate_pct,
  COUNT(DISTINCT user_id) as unique_users
FROM ai_requests
WHERE created_at >= CURRENT_DATE;
