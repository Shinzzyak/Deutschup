import { createClient } from '@supabase/supabase-js';

// 🔒 SECURITY: Anon key only — NEVER bundle service role key in client
// Profile/fetch operations go through /api/db-proxy (server-side)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Helper: call secure DB proxy
// Only whitelisted actions allowed server-side
interface ProxyResponse {
  data?: any;
  error?: string;
}

export async function dbProxy(action: string, params?: Record<string, any>): Promise<ProxyResponse> {
  const base = window.location.origin;
  const query = new URLSearchParams({ action }).toString();
  const isGet = ['get-profile', 'get-orders'].includes(action);

  try {
    const url = `${base}/api/db-proxy?${query}`;
    const headers: Record<string, string> = {
      'x-user-email': (window as any).__CLERK_USER_EMAIL || '',
    };

    const res = isGet
      ? await fetch(`${url}&${new URLSearchParams(params || {}).toString()}`, { headers })
      : await fetch(url, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify(params || {}),
        });

    if (!res.ok) {
      const text = await res.text();
      return { error: text };
    }
    return { data: await res.json() };
  } catch (e: any) {
    console.error('[DB-PROXY] fetch error:', e.message);
    return { error: e.message };
  }
}

// Expose user email for dbProxy
// Set by useAuthSync when Clerk user is available
