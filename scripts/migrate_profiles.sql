-- Migration: Add missing profile columns and set admin role
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role varchar(20) DEFAULT 'user';

-- Set admin role for the primary admin
-- Note: This requires knowing the UUID of abdullahalmughiroh@gmail.com
-- Since we can't run this as a query easily, we'll do it via the API or a trigger.
-- However, for now, let's just ensure the columns exist.
