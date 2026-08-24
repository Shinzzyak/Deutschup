import { verifyToken } from "@clerk/backend";
import { createClient } from "@supabase/supabase-js";
import { clerkVerifyOptions } from "./clerk-config";
// CF Pages injects env — no dotenv / no @google/genai in edge runtime.

export const getSupabaseAdminClient = () => {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

// Get the Supabase client for database operations
export const getDb = () => {
  return getSupabaseAdminClient();
};

export async function getGeminiApiKey() {
  if (process.env.GEMINI_API_KEY?.trim()) return process.env.GEMINI_API_KEY.trim();
  try {
    const { data, error } = await getDb()
      .from('config')
      .select('geminiApiKey')
      .eq('key', 'global')
      .single();

    if (!error && data?.geminiApiKey) {
      return data.geminiApiKey;
    }
  } catch (e) {
    console.error("Error fetching Gemini API Key from Supabase:", e);
  }
  return process.env.GEMINI_API_KEY;
}

/** Legacy helper — REST, not @google/genai SDK. */
export async function getAiClient() {
  const apiKey = await getGeminiApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY tidak ditemukan. Silakan tambahkan di menu Admin atau Secrets.");
  }
  return {
    apiKey,
    generate: async (model: string, prompt: string) => {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }),
      });
      if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);
      const data = await response.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    },
  };
}

export interface VerifiedIdentity {
  internalId: string;
  email?: string;
  /**
   * True only when the auth provider itself asserts this email is verified
   * (Supabase email_confirmed_at, or a Clerk "verified" claim on the token).
   * Never trust `email` for authorization decisions unless this is true.
   */
  emailVerified: boolean;
  provider: 'supabase' | 'clerk';
}

const VERIFIED_FLAG_VALUES = new Set(['true', '1', 'yes', 'verified']);

/** Claim values arrive as boolean, number or string depending on JWT template. */
function isVerifiedFlag(value: unknown): boolean {
  if (value === true) return true;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') return VERIFIED_FLAG_VALUES.has(value.trim().toLowerCase());
  return false;
}

function normalizeEmail(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.toLowerCase().trim();
  return trimmed || undefined;
}

/**
 * Read email + verification status out of a Clerk session token.
 * Clerk only ships these when the JWT template adds them and the claim name
 * differs per template, so accept the common aliases for both — including the
 * `email_addresses` array form where the entry is an object with
 * `{ email_address, verification: { status } }`.
 */
function readEmailClaims(payload: Record<string, any> | null): { email?: string; verified: boolean } {
  if (!payload) return { verified: false };

  const firstEntry = Array.isArray(payload.email_addresses) ? payload.email_addresses[0] : undefined;
  const entryIsObject = !!firstEntry && typeof firstEntry === 'object';
  const entryEmail = normalizeEmail(
    entryIsObject ? (firstEntry.email_address ?? firstEntry.email) : firstEntry
  );

  const email =
    normalizeEmail(payload.email) ||
    normalizeEmail(payload.primary_email_address) ||
    normalizeEmail(payload.email_address) ||
    entryEmail;

  if (!email) return { verified: false };

  const verified =
    isVerifiedFlag(payload.email_verified) ||
    isVerifiedFlag(payload.primary_email_address_verified) ||
    isVerifiedFlag(payload.primary_email_verified) ||
    isVerifiedFlag(payload.email_address_verified) ||
    (entryIsObject && email === entryEmail && isVerifiedFlag(firstEntry.verification?.status));

  return { email, verified };
}

export async function getVerifiedIdentity(req: any): Promise<VerifiedIdentity | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split('Bearer ')[1];

  // Supabase token: server-verified by Supabase Auth.
  try {
    const { data: { user }, error } = await getSupabaseAdminClient().auth.getUser(token);
    if (!error && user) {
      // Only accept Supabase identities that were provisioned via the Clerk
      // webhook (i.e. have a matching user_identities row). A raw Supabase
      // signup gets a valid JWT but no profile row, so rejecting here blocks
      // the Clerk-only API surface from being used with throwaway Supabase
      // accounts (audit finding VULN-04: payment create + AI usable via
      // Supabase-only signup, bypassing Clerk's anti-abuse controls).
      const { data: ident, error: identErr } = await getDb()
        .from('user_identities')
        .select('internal_id')
        .eq('internal_id', user.id)
        .maybeSingle();
      if (!identErr && ident?.internal_id) {
        return {
          internalId: user.id,
          email: normalizeEmail(user.email),
          emailVerified: Boolean((user as any).email_confirmed_at || (user as any).confirmed_at),
          provider: 'supabase',
        };
      }
      console.warn('[AUTH] Supabase token rejected: no user_identities row for', user.id);
      return null;
    }
  } catch {}

  // Clerk: verify via env (CLERK_JWT_KEY networkless and/or CLERK_SECRET_KEY).
  let payload: Record<string, any> | null = null;
  try {
    const opts = clerkVerifyOptions();
    if (!opts.secretKey && !opts.jwtKey) return null;
    payload = await verifyToken(token, opts as any) as Record<string, any>;
  } catch (e: any) {
    console.warn('[AUTH] Clerk token verification failed:', e.message);
    return null;
  }

  const clerkId = typeof payload?.sub === 'string' ? payload.sub.trim() : '';
  // Session tokens often omit email; accept common claim aliases.
  const { email, verified: emailVerified } = readEmailClaims(payload);

  try {
    if (clerkId) {
      const { data: identity } = await getDb()
        .from('user_identities')
        .select('internal_id, email')
        .eq('clerk_id', clerkId)
        .maybeSingle();
      if (identity?.internal_id) {
        const storedEmail = normalizeEmail(identity.email);
        const resolvedEmail = storedEmail || email;
        return {
          internalId: identity.internal_id,
          email: resolvedEmail,
          // The stored email is only as trustworthy as the token that asserts it:
          // flag it verified only when this token vouches for that exact address.
          emailVerified: emailVerified && !!email && resolvedEmail === email,
          provider: 'clerk',
        };
      }
    }

    // Fallback by email is an identity *takeover* vector when the address is
    // unverified — anyone can claim someone else's address on a fresh Clerk
    // account. Only follow this path for a provider-verified address.
    if (email && emailVerified) {
      const { data: identity } = await getDb()
        .from('user_identities')
        .select('internal_id, email')
        .eq('email', email)
        .maybeSingle();
      if (identity?.internal_id) {
        return {
          internalId: identity.internal_id,
          email: normalizeEmail(identity.email) || email,
          emailVerified: true,
          provider: 'clerk',
        };
      }
    } else if (email) {
      console.warn('[AUTH] skipping by-email identity lookup: email not verified');
    }

    // Auto-provision on first valid Clerk JWT (webhook may lag / never fire).
    // ponytail: RPC only; profiles/tier rows still owned by webhook or first profile write.
    if (clerkId) {
      // Persist the email only when verified, so an unverified claim can never
      // seed a row that a later by-email lookup would resolve to.
      const persistedEmail = emailVerified ? email : undefined;
      const { data: iid, error: upErr } = await getDb().rpc('upsert_user_identity', {
        p_clerk_id: clerkId,
        p_email: persistedEmail || null,
      });
      if (!upErr && iid) {
        return { internalId: iid as string, email, emailVerified, provider: 'clerk' };
      }
      if (upErr) console.warn('[AUTH] upsert_user_identity failed:', upErr.message);
    }
  } catch (e: any) {
    console.error('[AUTH] getVerifiedIdentity clerk lookup error:', e.message);
  }

  return null;
}

export async function getUserTierById(internalId: string): Promise<'free' | 'pro'> {
  try {
    const { data } = await getDb()
      .from('profiles')
      .select('subscription, pro_expires_at, tier, tier_expiry, role')
      .eq('id', internalId)
      .maybeSingle();

    // Admins are Pro. The client already assumes this — src/lib/subscription.ts
    // isUserPro() returns true for role 'admin' before looking at anything else —
    // but the server did not, so an admin whose profile had no pro_expires_at was
    // shown unlimited access while being metered as free tier by checkQuota().
    if (data?.role === 'admin') return 'pro';

    const now = Date.now();
    const proExpires = data?.pro_expires_at || data?.tier_expiry;
    if ((data?.subscription === 'pro' || data?.tier === 'pro') && proExpires && new Date(proExpires).getTime() > now) {
      return 'pro';
    }
  } catch (e: any) {
    console.error('[AUTH] getUserTierById error:', e.message);
  }
  return 'free';
}

/**
 * Admin check, in order of reliability:
 *  1. profiles.role === 'admin' — keyed on the internal id resolved from the
 *     Clerk `sub`, so it works even when the session token carries no email.
 *     This is the path to rely on (see supabase/18_set_admin_role.sql).
 *  2. ADMIN_EMAIL env, and only against a provider-verified email. There is no
 *     hardcoded fallback: with ADMIN_EMAIL unset this path is simply off.
 */
export async function isVerifiedAdmin(req: any): Promise<boolean> {
  const identity = await getVerifiedIdentity(req);
  if (!identity) return false;

  if (identity.internalId) {
    try {
      const { data: profile } = await getDb()
        .from('profiles')
        .select('role')
        .eq('id', identity.internalId)
        .maybeSingle();
      if (profile?.role === 'admin') return true;
    } catch (e: any) {
      console.error('[AUTH] isVerifiedAdmin role check error:', e.message);
    }
  }

  const adminEmail = normalizeEmail(process.env.ADMIN_EMAIL);
  if (!adminEmail) return false;
  if (!identity.emailVerified) return false;

  return !!identity.email && identity.email === adminEmail;
}

export interface QuotaResult {
  allowed: boolean;
  limit: number;
  used: number;
  remaining: number;
  resetAt: number; // epoch ms when the window resets
}

/**
 * Server-side quota enforcement for free-tier users.
 * Pro / admin are always allowed (unlimited).
 *
 * - chat: Free = 10 requests per rolling hour (matches Pricing copy).
 * - generate-mock-test: Free = 1 per rolling 7 days.
 * Other actions are unlimited for all tiers.
 *
 * Counts are derived from the existing ai_usage_log table, so no new
 * migration is required. Reads are non-fatal: on any DB error we fail
 * open to "allowed" to avoid blocking paid users, but log the failure.
 */
export async function checkQuota(
  internalId: string,
  userTier: 'free' | 'pro',
  action: string
): Promise<QuotaResult> {
  const unlimited: QuotaResult = { allowed: true, limit: 0, used: 0, remaining: Infinity, resetAt: 0 };
  if (userTier === 'pro') return unlimited;

  let windowMs: number;
  let limit: number;
  if (action === 'chat') {
    windowMs = 60 * 60 * 1000; // 1 hour
    limit = 10;
  } else if (action === 'generate-mock-test') {
    windowMs = 7 * 24 * 60 * 60 * 1000; // 7 days
    limit = 1;
  } else if (action === 'generate-exercises') {
    // N16: exercises burn Gemini tokens — cap free tier (5/hour).
    windowMs = 60 * 60 * 1000;
    limit = 5;
  } else {
    return unlimited;
  }

  const since = new Date(Date.now() - windowMs).toISOString();
  try {
    const { count, error } = await getDb()
      .from('ai_usage_log')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', internalId)
      .eq('endpoint', action)
      .gte('created_at', since);

    if (error) {
      // Fail closed: a quota-count error must not grant unlimited access.
      // (Previously fail-open here let free users bypass the cap entirely when
      // the log write path was broken — revenue leak confirmed in audit.)
      console.error('[QUOTA] count error:', error.message);
      return { allowed: false, limit, used: limit, remaining: 0, resetAt: Date.now() + windowMs };
    }

    const used = count || 0;
    const resetAt = Date.now() + windowMs;
    return {
      allowed: used < limit,
      limit,
      used,
      remaining: Math.max(0, limit - used),
      resetAt,
    };
  } catch (e: any) {
    console.error('[QUOTA] unexpected error:', e.message);
    return { allowed: false, limit, used: limit, remaining: 0, resetAt: Date.now() + windowMs };
  }
}

export const QUOTA_MESSAGES: Record<string, string> = {
  chat: 'Pengguna Free dapat 10 pesan Herr Deutsch per jam. Silakan tingkatkan ke Pro untuk chat tanpa batas.',
  'generate-mock-test': 'Pengguna Free hanya dapat satu kali Simulasi Ujian per minggu. Silakan tingkatkan ke Pro atau Master untuk akses tanpa batas.',
};

export const adminMiddleware = async (req: any, res: any, next: any) => {
  // Use unified verified admin check — verifies Clerk JWT via @clerk/backend,
  // maps sub → user_identities.clerk_id → internal_id, then profiles.role first
  // and ADMIN_EMAIL (verified email only) as a secondary path.
  const isAdmin = await isVerifiedAdmin(req);
  if (!isAdmin) {
    console.warn('[AdminMiddleware] Access DENIED');
    return res.status(403).json({ error: 'Forbidden: Admin privileges required' });
  }
  console.log('[AdminMiddleware] Access GRANTED via isVerifiedAdmin');
  return next();
};
