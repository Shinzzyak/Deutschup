-- provider_secrets table
-- Stores API keys for AI providers
-- RLS: service_role only
-- Migration: 17_provider_secrets.sql

-- First, secure the existing config table
-- Add RLS to prevent anon access to config table
ALTER TABLE config ENABLE ROW LEVEL SECURITY;

-- Create policy: only service role can access config
CREATE POLICY "Service role only access" ON config
  FOR ALL USING (auth.role() = 'service_role');

-- Now create the provider_secrets table
CREATE TABLE provider_secrets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id TEXT NOT NULL REFERENCES ai_providers(id) ON DELETE CASCADE,
  secret_key TEXT NOT NULL,
  secret_value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(provider_id, secret_key)
);

-- Indexes
CREATE INDEX idx_provider_secrets_provider ON provider_secrets(provider_id);

-- RLS (service role only)
ALTER TABLE provider_secrets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON provider_secrets
  FOR ALL USING (auth.role() = 'service_role');

-- Migrate Gemini API key from config to provider_secrets
-- First, get the current Gemini API key from config
DO $$
DECLARE
  gemini_key TEXT;
BEGIN
  -- Get the Gemini API key from config table (use double quotes for case-sensitive column)
  SELECT "geminiApiKey" INTO gemini_key FROM config WHERE key = 'global';
  
  -- If key exists, insert into provider_secrets
  IF gemini_key IS NOT NULL AND gemini_key != '' THEN
    INSERT INTO provider_secrets (provider_id, secret_key, secret_value)
    VALUES ('gemini', 'api_key', gemini_key)
    ON CONFLICT (provider_id, secret_key) 
    DO UPDATE SET secret_value = gemini_key, updated_at = NOW();
    
    -- Remove the key from config table (set to empty string)
    UPDATE config SET "geminiApiKey" = '' WHERE key = 'global';
  END IF;
END $$;

-- Verify migration
-- This will show the migrated data
SELECT 
  ps.provider_id,
  ps.secret_key,
  LEFT(ps.secret_value, 10) || '...' as masked_value,
  ps.created_at
FROM provider_secrets ps;