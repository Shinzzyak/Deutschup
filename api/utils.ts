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
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
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
    return;
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
  }
};

export const adminMiddleware = async (req: any, res: any, next: any) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  
  if (adminEmail && req.user?.email && req.user.email === adminEmail) {
    return next();
  }

  try {
    const { data: profile, error } = await getDb()
      .from('profiles')
      .select('role')
      .eq('id', req.user?.id)
      .single();

    if (!error && profile?.role === 'admin') {
      return next();
    }
  } catch (e) {
    console.error('Admin check error:', e);
  }

  res.status(403).json({ error: 'Forbidden' });
};
