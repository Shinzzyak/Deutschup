import { GoogleGenAI } from "@google/genai";
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

export const adminMiddleware = async (req: any, res: any, next: any) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  // For Clerk users, get email from req.user or from body
  const userEmail = req.user?.email || req.body?.email || req.headers['x-user-email'];
  
  console.log(`[AdminMiddleware] Checking access for: ${userEmail}`);
  console.log(`[AdminMiddleware] Expected Admin Email: ${adminEmail}`);

  if (adminEmail && userEmail && userEmail.toLowerCase().trim() === adminEmail.toLowerCase().trim()) {
    console.log(`[AdminMiddleware] Access GRANTED via Email Override for: ${userEmail}`);
    return next();
  }

  // For Clerk users, check role by email in profiles table
  if (userEmail) {
    try {
      // First find the internal user ID from user_identities
      const { data: identity, error: idError } = await getDb()
        .from('user_identities')
        .select('internal_id')
        .eq('email', userEmail.toLowerCase().trim())
        .single();
      
      if (!idError && identity) {
        const { data: profile, error: profileError } = await getDb()
          .from('profiles')
          .select('role')
          .eq('id', identity.internal_id)
          .single();
        
        if (!profileError && profile?.role === 'admin') {
          console.log(`[AdminMiddleware] Access GRANTED via Clerk email lookup for: ${userEmail}`);
          return next();
        }
      }
    } catch (e) {
      console.error(`[AdminMiddleware] Clerk email check error for ${userEmail}:`, e);
    }
  }

  // Fallback: check req.user.id (Supabase auth)
  if (req.user?.id) {
    try {
      const { data: profile, error } = await getDb()
        .from('profiles')
        .select('role')
        .eq('id', req.user.id)
        .single();

      if (!error && profile?.role === 'admin') {
        console.log(`[AdminMiddleware] Access GRANTED via DB Role for: ${userEmail}`);
        return next();
      }
    } catch (e) {
      console.error(`[AdminMiddleware] DB check error for ${userEmail}:`, e);
    }
  }

  console.warn(`[AdminMiddleware] Access DENIED for: ${userEmail}`);
  res.status(403).json({ 
    error: 'Forbidden: Admin privileges required',
    debug: process.env.NODE_ENV === 'development' ? { userEmail, adminEmail } : undefined 
  });
  return next(new Error('Forbidden'));
};
