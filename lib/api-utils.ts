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
    res.status(401).json({ error: 'Unauthorized' });
    return next(new Error('Unauthorized'));
  }
  const token = authHeader.split('Bearer ')[1];
  try {
    const { data: { user }, error } = await getSupabaseAdminClient().auth.getUser(token);
    if (error || !user) {
      throw new Error(error?.message || 'Invalid token');
    }
    req.user = user;
    next();
  } catch (e: any) {
    console.error('Auth error:', e.message);
    res.status(401).json({ error: 'Invalid token' });
    return next(new Error(e.message));
  }
};

export const adminMiddleware = async (req: any, res: any, next: any) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const userEmail = req.user?.email;
  
  console.log(`[AdminMiddleware] Checking access for: ${userEmail}`);
  console.log(`[AdminMiddleware] Expected Admin Email: ${adminEmail}`);

  if (adminEmail && userEmail && userEmail.toLowerCase().trim() === adminEmail.toLowerCase().trim()) {
    console.log(`[AdminMiddleware] Access GRANTED via Email Override for: ${userEmail}`);
    return next();
  }

  try {
    const { data: profile, error } = await getDb()
      .from('profiles')
      .select('role')
      .eq('id', req.user?.id)
      .single();

    if (!error && profile?.role === 'admin') {
      console.log(`[AdminMiddleware] Access GRANTED via DB Role for: ${userEmail}`);
      return next();
    }
  } catch (e) {
    console.error(`[AdminMiddleware] DB check error for ${userEmail}:`, e);
  }

  console.warn(`[AdminMiddleware] Access DENIED for: ${userEmail}`);
  res.status(403).json({ 
    error: 'Forbidden: Admin privileges required',
    debug: process.env.NODE_ENV === 'development' ? { userEmail, adminEmail } : undefined 
  });
  return next(new Error('Forbidden'));
};
