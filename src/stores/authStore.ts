/// <reference types="vite/client" />
import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { shouldUseClerk } from '../lib/clerk/canary';
import { captureAuth } from './debugStore';

export interface TierData {
  tier: 'free' | 'pro';
  tierExpiry?: number;
  subscription?: 'free' | 'pro';
  pro_expires_at?: string | null;
}

interface ProfileData {
  full_name?: string;
  avatar_url?: string;
  role?: string;
  tier?: string;
}

interface AuthState {
  user: User | null;
  session: any;
  tierData: TierData;
  profileData: ProfileData;
  loading: boolean;
  profileLoaded: boolean; // P1: tracks if profile has been hydrated
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const SESSION_CACHE = 'deutschup_session';
const PROFILE_CACHE_PREFIX = 'deutschup_profile_';

// P3: Cache profile in localStorage
function cacheProfile(userId: string, tierData: TierData, profileData: ProfileData) {
  try {
    localStorage.setItem(`${PROFILE_CACHE_PREFIX}${userId}`, JSON.stringify({
      tierData,
      profileData,
      cachedAt: Date.now(),
    }));
  } catch {}
}

function loadCachedProfile(userId: string): { tierData: TierData; profileData: ProfileData } | null {
  try {
    const raw = localStorage.getItem(`${PROFILE_CACHE_PREFIX}${userId}`);
    if (!raw) return null;
    const { tierData, profileData, cachedAt } = JSON.parse(raw);
    // Use cache if less than 24h old
    if (Date.now() - cachedAt > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(`${PROFILE_CACHE_PREFIX}${userId}`);
      return null;
    }
    return { tierData, profileData };
  } catch {
    return null;
  }
}

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
    if (Date.now() > expires_at * 1000) {
      localStorage.removeItem(SESSION_CACHE);
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

function parseProfileData(data: any): { tierData: TierData; profileData: ProfileData } {
  const now = Date.now();
  const isPro = data.subscription === 'pro' && data.pro_expires_at && new Date(data.pro_expires_at).getTime() > now;
  const effectiveTier = isPro ? 'pro' : 'free';

  return {
    tierData: {
      tier: effectiveTier,
      tierExpiry: data.tier_expiry,
      subscription: data.subscription || 'free',
      pro_expires_at: data.pro_expires_at,
    },
    profileData: {
      full_name: data.full_name,
      avatar_url: data.avatar_url,
      role: data.role,
    },
  };
}

export const useAuthStore = create<AuthState>((set, get) => {
  const updateAuthState = async (session: any, isInitial = false) => {
    const user = session?.user ?? null;
    console.log('[AUTH_STATE] updateAuthState called:', { isInitial, hasUser: !!user, userId: user?.id?.substring(0, 8), email: user?.email });
    let tierData: TierData = { tier: 'free' };
    let profileData: ProfileData = {};

    // P3: Instant cache hydration on initial load
    if (user && isInitial) {
      const cached = loadCachedProfile(user.id);
      if (cached) {
        tierData = cached.tierData;
        profileData = cached.profileData;
        // P1: Render immediately with cached data, don't block
        cacheSession(session);
        set({ user, session, tierData, profileData, loading: false, profileLoaded: true });
      }
    }

    try {
      if (user) {
        // P2: 3s timeout instead of 10s
        const PROFILE_TIMEOUT_MS = 3000;

        const profilePromise = supabase
          .from('profiles')
          .select('tier, tier_expiry, full_name, avatar_url, role, subscription, pro_expires_at')
          .eq('id', user.id)
          .maybeSingle();

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
          if (error.message !== '[AUTH] profile fetch timeout') {
            try {
              const { error: createError } = await supabase
                .from('profiles')
                .insert({ id: user.id, tier: 'free', role: 'user' });
              if (createError) console.error('[AUTH] profile create error:', createError.message);
            } catch (insertErr) {
              console.error('[AUTH] profile insert exception:', insertErr);
            }
          }
        } else if (data) {
          const parsed = parseProfileData(data);
          tierData = parsed.tierData;
          profileData = parsed.profileData;
          // P3: Cache fresh profile data
          cacheProfile(user.id, tierData, profileData);
        }
      }
    } catch (e) {
      console.error('[AUTH] sync error:', e);
    }

    // Admin override
    if (user?.email === import.meta.env.VITE_ADMIN_EMAIL) {
      tierData = { ...tierData, tier: 'pro' };
      profileData = { ...profileData, role: 'admin' };
    }

    cacheSession(session);
    console.log('[AUTH_STATE] final set:', { hasUser: !!user, userId: user?.id?.substring(0, 8), loading: false });
    captureAuth(user ? 'SIGNED_IN' : 'SIGNED_OUT', user?.id?.substring(0, 8));
    set({ user, session, tierData, profileData, loading: false, profileLoaded: true });
  };

  // BOOT: instant restore from cache
  const cachedUser = loadCachedUser();
  console.log('[AUTH_STATE] boot:', { hasCachedUser: !!cachedUser, cachedUserId: cachedUser?.id?.substring(0, 8) });
  if (cachedUser) {
    // P1: Start with cached profile if available
    const cached = loadCachedProfile(cachedUser.id);
    if (cached) {
      set({
        user: cachedUser,
        loading: false, // P1: Don't block render
        profileLoaded: true,
        tierData: cached.tierData,
        profileData: cached.profileData,
      });
    } else {
      set({ user: cachedUser, loading: true, profileLoaded: false });
    }
  }

  // getSession() triggers Supabase internal session recovery
  supabase.auth.getSession().then(() => {});

  // Safety: force loading=false after 5s (reduced from 15s)
  setTimeout(() => {
    const state = useAuthStore.getState();
    if (state.loading) {
      console.warn('[AUTH] SAFETY TIMEOUT — forcing loading=false after 5s');
      set({ loading: false, profileLoaded: state.profileLoaded });
    }
  }, 5000);

  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('[AUTH_STATE] onAuthStateChange:', { event, hasSession: !!session, hasUser: !!session?.user });
    await updateAuthState(session, true);
  });

  return {
    user: cachedUser,
    session: null,
    tierData: cachedUser ? (loadCachedProfile(cachedUser.id)?.tierData || { tier: 'free' }) : { tier: 'free' },
    profileData: cachedUser ? (loadCachedProfile(cachedUser.id)?.profileData || {}) : {},
    loading: !cachedUser,
    profileLoaded: !!cachedUser && !!loadCachedProfile(cachedUser.id),
    loginWithGoogle: async () => { 
      const currentUser = get().user;
      const useClerk = shouldUseClerk(currentUser?.email);
      console.log('[AUTH_STATE] loginWithGoogle:', { hasCurrentUser: !!currentUser, useClerk });
      
      if (useClerk) {
        console.log('[AUTH] Canary user detected — using Clerk login');
        // Clerk login will be handled by ClerkSignIn component
        // For now, redirect to sign-in page
        window.location.href = '/sign-in';
        return;
      }
      
      await supabase.auth.signInWithOAuth({ provider: 'google' }); 
    },
    logout: async () => {
      const currentUser = get().user;
      // Canary-aware logout
      if (shouldUseClerk(currentUser?.email)) {
        console.log('[AUTH] Canary logout — signing out from Supabase + clearing Clerk state');
        // Also clear any Clerk localStorage keys
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('clerk-') || key.startsWith('__clerk')) {
            localStorage.removeItem(key);
          }
        });
      }
      await supabase.auth.signOut();
      cacheSession(null);
      const userId = currentUser?.id;
      if (userId) localStorage.removeItem(`${PROFILE_CACHE_PREFIX}${userId}`);
      set({ user: null, session: null, tierData: { tier: 'free' }, profileData: {}, loading: false, profileLoaded: false });
      
      // Redirect to home page
      window.location.href = '/';
    },
  };
});
