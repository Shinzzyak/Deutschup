-- Migration: AI Provider & Model Management Foundation
-- Creates tables for provider management, model management, and usage tracking

-- 1. AI Providers table
CREATE TABLE IF NOT EXISTS ai_providers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0, -- lower = higher priority
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'degraded', 'down', 'disabled')),
  config JSONB DEFAULT '{}', -- provider-specific config (base URL, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. AI Models table
CREATE TABLE IF NOT EXISTS ai_models (
  id TEXT PRIMARY KEY,
  provider_id TEXT NOT NULL REFERENCES ai_providers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  is_primary BOOLEAN DEFAULT false,
  is_fallback BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}', -- model-specific config (temperature, max tokens, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AI Usage Log (extends existing ai_requests)
CREATE TABLE IF NOT EXISTS ai_usage_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  provider_id TEXT NOT NULL,
  model_id TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  latency_ms INTEGER,
  tokens_in INTEGER DEFAULT 0,
  tokens_out INTEGER DEFAULT 0,
  cost_usd NUMERIC(10,6) DEFAULT 0,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. AI Provider Stats (materialized view for dashboard)
CREATE OR REPLACE VIEW v_ai_provider_stats AS
SELECT
  provider_id,
  model_id,
  DATE(created_at) as date,
  COUNT(*) as total_requests,
  COUNT(*) FILTER (WHERE success) as successful_requests,
  COUNT(*) FILTER (WHERE NOT success) as failed_requests,
  ROUND(AVG(latency_ms)::NUMERIC, 0) as avg_latency_ms,
  SUM(tokens_in) as total_tokens_in,
  SUM(tokens_out) as total_tokens_out,
  SUM(cost_usd) as total_cost_usd
FROM ai_usage_log
GROUP BY provider_id, model_id, DATE(created_at);

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_ai_models_provider ON ai_models(provider_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_log_provider ON ai_usage_log(provider_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_log_model ON ai_usage_log(model_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_log_created ON ai_usage_log(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_usage_log_user ON ai_usage_log(user_id);

-- 6. RLS (service role only — admin API uses service role)
ALTER TABLE ai_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manage ai_providers" ON ai_providers
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role manage ai_models" ON ai_models
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role manage ai_usage_log" ON ai_usage_log
  FOR ALL USING (auth.role() = 'service_role');

-- 7. Updated at trigger
CREATE OR REPLACE FUNCTION update_ai_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ai_providers_updated_at
  BEFORE UPDATE ON ai_providers
  FOR EACH ROW EXECUTE FUNCTION update_ai_timestamp();

CREATE TRIGGER ai_models_updated_at
  BEFORE UPDATE ON ai_models
  FOR EACH ROW EXECUTE FUNCTION update_ai_timestamp();

-- 8. Seed providers (priority order: DeepSeek > Mimo > Gemini > future)
INSERT INTO ai_providers (id, name, enabled, priority, status, config) VALUES
  ('deepseek', 'DeepSeek', true, 1, 'active', '{"baseUrl": "https://api.deepseek.com"}'),
  ('mimo', 'Xiaomi MiMo', true, 2, 'active', '{"baseUrl": "https://api.xiaomimimo.com/v1"}'),
  ('gemini', 'Google Gemini', false, 3, 'disabled', '{"baseUrl": "https://generativelanguage.googleapis.com"}'),
  ('openai', 'OpenAI', false, 4, 'disabled', '{"baseUrl": "https://api.openai.com"}'),
  ('claude', 'Anthropic Claude', false, 5, 'disabled', '{"baseUrl": "https://api.anthropic.com"}'),
  ('qwen', 'Qwen (Alibaba)', false, 6, 'disabled', '{"baseUrl": "https://dashscope.aliyuncs.com"}')
ON CONFLICT (id) DO NOTHING;

-- 9. Seed models
INSERT INTO ai_models (id, provider_id, name, display_name, enabled, is_primary, is_fallback, config) VALUES
  -- DeepSeek models (primary)
  ('deepseek-v4-flash', 'deepseek', 'deepseek-v4-flash', 'DeepSeek V4 Flash', true, true, false, '{"temperature": 0.7}'),
  -- Mimo models (fallback)
  ('mimo-v2.5', 'mimo', 'mimo-v2-pro', 'Mimo v2.5', true, false, true, '{"temperature": 0.7}'),
  -- Gemini models (disabled by default)
  ('gemini-3-flash', 'gemini', 'gemini-3-flash-preview', 'Gemini 3 Flash', false, false, false, '{"temperature": 0.7}'),
  ('gemini-2-flash', 'gemini', 'gemini-2.0-flash', 'Gemini 2.0 Flash', false, false, false, '{"temperature": 0.7}'),
  ('gemma-3-1b', 'gemini', 'gemma-3-1b-it', 'Gemma 3 1B', false, false, false, '{"temperature": 0.5}'),
  -- OpenAI models (disabled by default)
  ('gpt-4o', 'openai', 'gpt-4o', 'GPT-4o', false, false, false, '{"temperature": 0.7}'),
  ('gpt-4o-mini', 'openai', 'gpt-4o-mini', 'GPT-4o Mini', false, false, false, '{"temperature": 0.7}'),
  -- Claude models (disabled by default)
  ('claude-4-sonnet', 'claude', 'claude-4-sonnet-20250514', 'Claude 4 Sonnet', false, false, false, '{"temperature": 0.7}'),
  -- Qwen models (disabled by default)
  ('qwen-max', 'qwen', 'qwen-max', 'Qwen Max', false, false, false, '{"temperature": 0.7}')
ON CONFLICT (id) DO NOTHING;
