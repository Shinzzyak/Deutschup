// IMPLEMENTATION-048B: Identity Mapping Utility
// Client-side helpers — resolves identity via verified server session, never direct RPC.

import { dbProxy } from '../supabase';

/**
 * Resolve a Clerk user ID to internal UUID via verified server session.
 * Falls back to null if no mapping exists.
 */
export async function resolveInternalId(
  clerkUserId: string,
  _fallbackInternalId?: string
): Promise<string | null> {
  const result = await dbProxy('get-session');
  if (result.error || !result.data?.id) return null;
  return result.data.id;
}

/**
 * Reverse lookup — currently server-only (webhook). Stub for client compat.
 */
export async function resolveClerkId(_internalUserId: string): Promise<string | null> {
  return null;
}

/**
 * Identity creation — server-only (webhook). Stub for client compat.
 */
export async function upsertIdentity(
  _clerkUserId: string,
  _email?: string
): Promise<string | null> {
  return null;
}
