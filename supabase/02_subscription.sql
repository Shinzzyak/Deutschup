-- Migration: Subscription system
-- Run this in Supabase SQL Editor after 01_tables.sql

-- Add subscription columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription TEXT DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pro_expires_at TIMESTAMPTZ;

-- Backfill: set existing tier='pro' users
UPDATE profiles SET subscription = 'pro' WHERE tier = 'pro' AND pro_expires_at IS NULL;
UPDATE profiles SET pro_expires_at = tier_expiry WHERE tier = 'pro' AND pro_expires_at IS NULL;

-- Add index for subscription queries
CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON profiles(subscription);
CREATE INDEX IF NOT EXISTS idx_profiles_pro_expires_at ON profiles(pro_expires_at);
