// IMPLEMENTATION-048B: Clerk JWT Validation Helper (POC)
// Validates Clerk JWTs and extracts claims for Supabase RLS compatibility

import { verify } from "https://esm.sh/@clerk/backend/jwt";

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "";
const CLERK_JWKS_URL = `https://clerk.${CLERK_PUBLISHABLE_KEY.split("_")[1] || "placeholder"}/.well-known/jwks.json`;

export interface ClerkJWTClaims {
  sub: string;           // Clerk user ID
  email?: string;
  is_admin?: boolean;
  role?: string;
  user_metadata?: {
    role?: string;
  };
  app_metadata?: {
    role?: string;
  };
}

/**
 * Validate a Clerk JWT and extract claims.
 * For POC: returns claims without full verification.
 * Production: use @clerk/backend verify token.
 */
export async function validateClerkJWT(token: string): Promise<ClerkJWTClaims | null> {
  try {
    // In production, verify with Clerk's JWKS
    // For POC, decode without verification (trust the token comes from Clerk)
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload as ClerkJWTClaims;
  } catch {
    return null;
  }
}

/**
 * Extract user identity from Clerk JWT claims.
 * Maps Clerk sub → internal UUID via user_identities table.
 */
export async function extractUserIdentity(
  claims: ClerkJWTClaims,
  supabaseClient: any
): Promise<{ internalId: string; clerkId: string } | null> {
  const { data, error } = await supabaseClient.rpc("resolve_user_id", {
    p_clerk_id: claims.sub,
  });

  if (error || !data) return null;

  return {
    internalId: data,
    clerkId: claims.sub,
  };
}

/**
 * Check if Clerk JWT claims indicate admin role.
 */
export function isAdmin(claims: ClerkJWTClaims): boolean {
  return (
    claims.is_admin === true ||
    claims.user_metadata?.role === "admin" ||
    claims.app_metadata?.role === "admin"
  );
}
