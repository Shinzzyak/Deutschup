import { createClient } from '@supabase/supabase-js';
import { getAuthHeaders } from './auth-headers';

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
  // HTTP status of the proxy response; 0 when the request never reached the server.
  // Callers use it to tell "not allowed yet" (403) from a real outage (5xx).
  status?: number;
}

export async function dbProxy(action: string, params?: Record<string, any>): Promise<ProxyResponse> {
  const base = window.location.origin;
  const query = new URLSearchParams({ action }).toString();
  // Reads stay on POST unless they were already GET — GET responses can be
  // cached by intermediaries, and every payload here is per-user.
  const isGet = ['get-profile', 'get-orders'].includes(action);

  try {
    const url = `${base}/api/db-proxy?${query}`;
    const headers = await getAuthHeaders();

    const res = isGet
      ? await fetch(`${url}&${new URLSearchParams(params || {}).toString()}`, { headers })
      : await fetch(url, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify(params || {}),
        });

    if (!res.ok) {
      const text = await res.text();
      // Errors come back as { error: "..." }; fall back to the raw body.
      let message = text;
      try {
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed.error === 'string') message = parsed.error;
      } catch {
        // not JSON — keep the raw text
      }
      return { error: message || `HTTP ${res.status}`, status: res.status };
    }
    return { data: await res.json(), status: res.status };
  } catch (e: any) {
    console.error('[DB-PROXY] fetch error:', e.message);
    return { error: e.message, status: 0 };
  }
}

// Expose user email for dbProxy
// Set by useAuthSync when Clerk user is available
