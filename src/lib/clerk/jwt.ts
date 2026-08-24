// Clerk JWT helpers — config from env (src/lib/clerk/config.ts), not Dashboard.

import {
  CLERK_JWKS_URL,
  CLERK_PUBLISHABLE_KEY,
  isClerkEnabled,
} from './config';

export interface ClerkJWTClaims {
  sub: string;
  email?: string;
  is_admin?: boolean;
  role?: string;
  user_metadata?: { role?: string };
  app_metadata?: { role?: string };
  azp?: string;
  iss?: string;
}

export { CLERK_JWKS_URL, CLERK_PUBLISHABLE_KEY, isClerkEnabled };

/**
 * Decode Clerk JWT payload (client-side identity mapping only).
 * Cryptographic verification is server-side via CLERK_SECRET_KEY / jwtKey.
 */
export async function validateClerkJWT(token: string): Promise<ClerkJWTClaims | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const json = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as ClerkJWTClaims;
  } catch {
    return null;
  }
}

export async function extractUserIdentity(
  claims: ClerkJWTClaims,
  supabaseClient: any
): Promise<{ internalId: string; clerkId: string } | null> {
  const { data, error } = await supabaseClient.rpc('resolve_user_id', {
    p_clerk_id: claims.sub,
  });
  if (error || !data) return null;
  return { internalId: data, clerkId: claims.sub };
}

export function isAdmin(claims: ClerkJWTClaims): boolean {
  return (
    claims.is_admin === true ||
    claims.user_metadata?.role === 'admin' ||
    claims.app_metadata?.role === 'admin'
  );
}
