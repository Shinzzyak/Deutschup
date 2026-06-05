/// <reference types="vite/client" />
import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface TierData {
  tier: 'free' | 'pro';
  tierExpiry?: number;
}

interface ProfileData {
  full_name?: string;
  avatar_url?: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  session: any;
  tierData: TierData;
  profileData: ProfileData;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const SESSION_CACHE = 'deutschup_session';

function cacheSession(session: any) {
  try {
    if (session?.user) {
      localStorage.setItem(SESSION_CACHE, JSON.stringify({
        user: session.user,
        expires_at: session.expires_at,
      }));
    } else {
      localStorage.removeItem(SESSION_CACHE);
    }
  } catch {}
}

function loadCachedUser(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_CACHE);
    if (!raw) return null;
    const { user, expires_at } = JSON.parse(raw);
    if (!user || !expires_at) return null;
    // Only use cache if not expired
    if (Date.now() > expires_at * 1000) {
      localStorage.removeItem(SESSION_CACHE);
      return null;
    }
    console.log('[AUTH] cache hit:', user.email);
    return user;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => {
  const updateAuthState = async (session: any) => {
    console.log('[AUTH] updateAuthState called, session:', session?.user?.email ?? 'null');

    const user = session?.user ?? null;
    let tierData: TierData = { tier: 'free' };
    let profileData: ProfileData = {};

    const PROFILE_TIMEOUT_MS = 10000;

    try {
      if (user) {
        console.log('[AUTH] fetching profile for:', user.id);

        const profilePromise = supabase
          .from('users')
          .select('tier, tierExpiry, full_name, avatar_url, role')
          .eq('id', user.id)
          .single();

        const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) =>
          setTimeout(
            () => resolve({ data: null, error: new Error('[AUTH] profile fetch timeout') }),
            PROFILE_TIMEOUT_MS
          )
        );

        const result = await Promise.race([profilePromise, timeoutPromise]);
        const { data, error } = result;

        if (error) {
          console.error('[AUTH] profile fetch error:', error.message);
          // Only try insert if it wasn't a timeout (timeout = unknown state)
          if (error.message !== '[AUTH] profile fetch timeout') {
            try {
              const { error: createError } = await supabase
                .from('users')
                .insert({ id: user.id, tier: 'free', role: 'user' });
              if (createError) console.error('[AUTH] profile create error:', createError.message);
            } catch (insertErr) {
              console.error('[AUTH] profile insert exception:', insertErr);
            }
          }
        } else if (data) {
          tierData = { tier: data.tier || 'free', tierExpiry: data.tierExpiry };
          profileData = { full_name: data.full_name, avatar_url: data.avatar_url, role: data.role };
          console.log('[AUTH] profile loaded:', profileData.role, tierData.tier);
        }
      }
    } catch (e) {
      console.error('[AUTH] sync error:', e);
    }

    // Admin override
    if (user?.email === import.meta.env.VITE_ADMIN_EMAIL) {
      tierData = { ...tierData, tier: 'pro' };
      profileData = { ...profileData, role: 'admin' };
      console.log('[AUTH] admin override applied');
    }

    cacheSession(session);
    console.log('[AUTH] final state -> user:', user?.email ?? 'null', 'role:', profileData.role ?? 'none', 'loading: false');
    set({ user, session, tierData, profileData, loading: false });
  };

  // BOOT: instant restore from cache
  const cachedUser = loadCachedUser();
  if (cachedUser) {
    console.log('[AUTH] boot: cache user set immediately');
    set({ user: cachedUser, loading: true });
  }

  // getSession() triggers Supabase internal session recovery from localStorage.
  // Its result is DISCARDED — onAuthStateChange is the only state setter.
  supabase.auth.getSession().then(({ data }) => {
    console.log('[AUTH] getSession resolved:', data.session?.user?.email ?? 'null', '(IGNORED — waiting for onAuthStateChange)');
  });

  // SINGLE SOURCE OF TRUTH — only onAuthStateChange updates state
  // Safety: force loading=false after 15s even if onAuthStateChange never fires
  setTimeout(() => {
    const state = useAuthStore.getState();
    if (state.loading) {
      console.warn('[AUTH] SAFETY TIMEOUT — forcing loading=false after 15s');
      set({ loading: false });
    }
  }, 15000);

  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('[AUTH] onAuthStateChange:', event, session?.user?.email ?? 'null');
    await updateAuthState(session);
  });

  return {
    user: cachedUser,
    session: null,
    tierData: { tier: 'free' },
    profileData: {},
    loading: true,
    loginWithGoogle: async () => await supabase.auth.signInWithOAuth({ provider: 'google' }),
    logout: async () => {
      await supabase.auth.signOut();
      cacheSession(null);
      set({ user: null, session: null, tierData: { tier: 'free' }, profileData: {}, loading: false });
    },
  };
});
