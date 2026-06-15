// IMPLEMENTATION-048B: Identity Mapping Utility (POC)
// Client-side helpers for working with user_identities table

import { supabase } from "../supabase";

/**
 * Resolve a Clerk user ID to internal UUID.
 * Falls back to auth.uid() if no mapping exists.
 */
export async function resolveInternalId(
  clerkUserId: string,
  fallbackInternalId?: string
): Promise<string | null> {
  const { data, error } = await supabase.rpc("resolve_user_id", {
    p_clerk_id: clerkUserId,
  });

  if (error || !data) {
    // No mapping found — use fallback (e.g., auth.uid())
    return fallbackInternalId || null;
  }

  return data;
}

/**
 * Resolve an internal UUID to Clerk user ID.
 */
export async function resolveClerkId(internalUserId: string): Promise<string | null> {
  const { data, error } = await supabase.rpc("resolve_clerk_id", {
    p_internal_id: internalUserId,
  });

  if (error || !data) return null;
  return data;
}

/**
 * Create or update a user identity mapping.
 */
export async function upsertIdentity(
  clerkUserId: string,
  email?: string
): Promise<string | null> {
  const { data, error } = await supabase.rpc("upsert_user_identity", {
    p_clerk_id: clerkUserId,
    p_email: email || null,
  });

  if (error || !data) return null;
  return data;
}
