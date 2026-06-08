-- Migration: Create orders table for payment tracking
-- Run this in Supabase SQL Editor or via CLI

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL DEFAULT 'pro',
  status TEXT NOT NULL DEFAULT 'pending',
  amount INTEGER,
  payment_method TEXT,
  paid_at TIMESTAMPTZ,
  paid_reff_num TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Users can read their own orders
CREATE POLICY "Users can read own orders" ON orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own orders (for payment creation)
CREATE POLICY "Users can insert own orders" ON orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role can update orders (for webhook callbacks)
CREATE POLICY "Service role can update orders" ON orders
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
