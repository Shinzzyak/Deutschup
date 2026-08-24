-- IMPLEMENTATION-048B: Clerk Identity Mapping Layer (POC)
-- Creates user_identities table for mapping internal UUID ↔ Clerk user ID
-- Does NOT modify any existing tables or RLS policies

-- 1. Create mapping table
CREATE TABLE IF NOT EXISTS public.user_identities (
  internal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Index for reverse lookups (Clerk ID → internal UUID)
CREATE INDEX IF NOT EXISTS idx_user_identities_clerk_id ON public.user_identities(clerk_id);

-- 3. RLS — disabled for POC (service_role only, no anon access)
ALTER TABLE public.user_identities ENABLE ROW LEVEL SECURITY;

-- Service role has full access
CREATE POLICY "Service role manages identities" ON public.user_identities
  FOR ALL USING (auth.role() = 'service_role');

-- 4. Helper function: resolve Clerk ID → internal UUID
CREATE OR REPLACE FUNCTION public.resolve_user_id(p_clerk_id TEXT)
RETURNS UUID AS $$
  SELECT internal_id FROM public.user_identities WHERE clerk_id = p_clerk_id;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 5. Helper function: resolve internal UUID → Clerk ID
CREATE OR REPLACE FUNCTION public.resolve_clerk_id(p_internal_id UUID)
RETURNS TEXT AS $$
  SELECT clerk_id FROM public.user_identities WHERE internal_id = p_internal_id;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 6. Helper function: upsert identity (used by webhook)
CREATE OR REPLACE FUNCTION public.upsert_user_identity(
  p_clerk_id TEXT,
  p_email TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_internal_id UUID;
BEGIN
  INSERT INTO public.user_identities (clerk_id, email)
  VALUES (p_clerk_id, p_email)
  ON CONFLICT (clerk_id) DO UPDATE
    SET email = COALESCE(EXCLUDED.email, user_identities.email),
        updated_at = NOW()
  RETURNING internal_id INTO v_internal_id;

  RETURN v_internal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Grant execute to service role
GRANT EXECUTE ON FUNCTION public.resolve_user_id(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.resolve_clerk_id(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.upsert_user_identity(TEXT, TEXT) TO service_role;

-- 8. Verify
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_identities' AND schemaname = 'public') THEN
    RAISE NOTICE 'user_identities table created successfully';
  ELSE
    RAISE EXCEPTION 'Failed to create user_identities table';
  END IF;
END $$;
