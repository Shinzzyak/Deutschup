import { GoogleGenAI } from "@google/genai";
import { verifyToken } from "@clerk/backend";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

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

export async function getAiClient() {
  const apiKey = await getGeminiApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY tidak ditemukan. Silakan tambahkan di menu Admin atau Secrets.");
  }
  return new GoogleGenAI({ 
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'deutschup-api' } }
  });
}

export const runMiddleware = (req: any, res: any, fn: any) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) return reject(result);
      if (res.headersSent) return reject(new Error('Headers sent'));
      return resolve(result);
    });
  });
};

export const authMiddleware = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    // For Clerk users, token might be missing — allow through with userId validation
    console.log('[authMiddleware] No Bearer token — Clerk user flow');
    return next();
  }
  const token = authHeader.split('Bearer ')[1];
  
  // Try Clerk token first (check if it looks like a Clerk token)
  if (token.startsWith('eyJ') || token.length > 100) {
    // Likely a Clerk token — validate userId from body instead
    console.log('[authMiddleware] Clerk token detected — validating via userId');
    return next();
  }
  
  // Try Supabase token
  try {
    const { data: { user }, error } = await getSupabaseAdminClient().auth.getUser(token);
    if (error || !user) {
      // Supabase auth failed — try Clerk flow
      console.log('[authMiddleware] Supabase auth failed — allowing Clerk flow');
      return next();
    }
    req.user = user;
    next();
  } catch (e: any) {
    console.error('Auth error:', e.message);
    // Don't reject — allow Clerk flow
    return next();
  }
};

export function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(Buffer.from(parts[1], 'base64url').toString());
  } catch { return null; }
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

  // Clerk token: verify signature first, then map Clerk subject to internal UUID.
  let payload: Record<string, any> | null = null;
  try {
    if (!process.env.CLERK_SECRET_KEY) return null;
    payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY }) as Record<string, any>;
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
