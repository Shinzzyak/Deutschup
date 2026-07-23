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
  provider: 'supabase' | 'clerk';
}

export async function getVerifiedIdentity(req: any): Promise<VerifiedIdentity | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split('Bearer ')[1];

  // Supabase token: server-verified by Supabase Auth.
  try {
    const { data: { user }, error } = await getSupabaseAdminClient().auth.getUser(token);
    if (!error && user) {
      return { internalId: user.id, email: user.email, provider: 'supabase' };
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
  const email = payload?.email?.toLowerCase?.().trim?.();

  try {
    if (clerkId) {
      const { data: identity } = await getDb()
        .from('user_identities')
        .select('internal_id, email')
        .eq('clerk_id', clerkId)
        .maybeSingle();
      if (identity?.internal_id) {
        return { internalId: identity.internal_id, email: identity.email || email, provider: 'clerk' };
      }
    }

    if (email) {
      const { data: identity } = await getDb()
        .from('user_identities')
        .select('internal_id, email')
        .eq('email', email)
        .maybeSingle();
      if (identity?.internal_id) {
        return { internalId: identity.internal_id, email: identity.email || email, provider: 'clerk' };
      }
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
      .select('subscription, pro_expires_at, tier, tier_expiry')
      .eq('id', internalId)
      .maybeSingle();

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

export async function isVerifiedAdmin(req: any): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL || 'abdullahalmughiroh@gmail.com';
  const identity = await getVerifiedIdentity(req);
  const email = identity?.email?.toLowerCase().trim();

  if (email && email === adminEmail.toLowerCase().trim()) return true;

  if (identity?.internalId) {
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

  return false;
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
      console.error('[QUOTA] count error:', error.message);
      return unlimited; // fail open
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
    return unlimited;
  }
}

export const QUOTA_MESSAGES: Record<string, string> = {
  chat: 'Pengguna Free dapat 10 pesan Herr Deutsch per jam. Silakan tingkatkan ke Pro untuk chat tanpa batas.',
  'generate-mock-test': 'Pengguna Free hanya dapat satu kali Simulasi Ujian per minggu. Silakan tingkatkan ke Pro atau Master untuk akses tanpa batas.',
};

export const adminMiddleware = async (req: any, res: any, next: any) => {
  // Use unified verified admin check — verifies Clerk JWT via @clerk/backend,
  // maps sub → user_identities.clerk_id → internal_id, checks ADMIN_EMAIL + profiles.role
  const isAdmin = await isVerifiedAdmin(req);
  if (!isAdmin) {
    console.warn('[AdminMiddleware] Access DENIED');
    return res.status(403).json({ error: 'Forbidden: Admin privileges required' });
  }
  console.log('[AdminMiddleware] Access GRANTED via isVerifiedAdmin');
  return next();
};
