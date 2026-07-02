/// <reference types="vite/client" />
import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import { supabase, dbProxy } from '../lib/supabase';
import { resolveInternalId } from '../lib/clerk/identity';
import { captureAuth } from './debugStore';

export interface TierData {
  tier: 'free' | 'pro';
  tierExpiry?: number;
  subscription?: 'free' | 'pro';
  pro_expires_at?: string | null;
  role?: string;
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
  profileLoaded: boolean;
  setUser: (user: User | null) => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const SESSION_CACHE = 'deutschup_session';
const PROFILE_CACHE_PREFIX = 'deutschup_profile_';

function cacheProfile(userId: string, tierData: TierData, profileData: ProfileData) {
  try {
    localStorage.setItem(`${PROFILE_CACHE_PREFIX}${userId}`, JSON.stringify({
      tierData, profileData, cachedAt: Date.now(),
    }));
  } catch {}
}

function loadCachedProfile(userId: string): { tierData: TierData; profileData: ProfileData } | null {
  try {
    const raw = localStorage.getItem(`${PROFILE_CACHE_PREFIX}${userId}`);
    if (!raw) return null;
    const { tierData, profileData, cachedAt } = JSON.parse(raw);
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
        user: session.user, expires_at: session.expires_at,
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
      tier: effectiveTier, tierExpiry: data.tier_expiry,
      subscription: data.subscription || 'free',
      pro_expires_at: data.pro_expires_at, role: data.role || 'user',
    },
    profileData: {
      full_name: data.full_name, avatar_url: data.avatar_url, role: data.role,
    },
  };
}

async function fetchProfile(set: any, clerkUserId: string) {
  console.log('[AUTH_STATE] fetchProfile:', { clerkUserId: clerkUserId.substring(0, 12) });
  let tierData: TierData = { tier: 'free' };
  let profileData: ProfileData = {};

  let userId: string;
  try {
    const resolved = await resolveInternalId(clerkUserId);
    if (!resolved) {
      console.error('[AUTH] Could not resolve Clerk ID to internal UUID:', clerkUserId.substring(0, 12));
      set({ tierData, profileData, profileLoaded: true });
      return;
    }
    userId = resolved;
  } catch (resolveErr) {
    console.error('[AUTH] resolveUserId error:', resolveErr);
    set({ tierData, profileData, profileLoaded: true });
    return;
  }

  const cached = loadCachedProfile(userId);
  if (cached) {
    tierData = cached.tierData;
    profileData = cached.profileData;
    set({ tierData, profileData, profileLoaded: true });
  }

  try {
    const PROFILE_TIMEOUT_MS = 3000;
    const profilePromise = dbProxy('get-profile', { userId });
    const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) =>
      setTimeout(() => resolve({ data: null, error: new Error('[AUTH] profile fetch timeout') }), PROFILE_TIMEOUT_MS)
    );
    const result: any = await Promise.race([profilePromise, timeoutPromise]);

    if (result.error) {
      console.error('[AUTH] profile fetch error:', result.error);
      if (result.error !== '[AUTH] profile fetch timeout') {
        try {
          const createResult = await dbProxy('upsert-profile', { userId, full_name: '', tier: 'free', role: 'user', subscription: 'free' });
          if (createResult.error) console.error('[AUTH] profile create error:', createResult.error);
        } catch (insertErr) {
          console.error('[AUTH] profile insert exception:', insertErr);
        }
      }
    } else if (result.data) {
      const parsed = parseProfileData(result.data);
      tierData = parsed.tierData;
      profileData = parsed.profileData;
      cacheProfile(userId, tierData, profileData);
    }
  } catch (e) {
    console.error('[AUTH] sync error:', e);
  }

  console.log('[AUTH_STATE] profile set:', { userId: userId.substring(0, 8), tier: tierData.tier });
  set({ tierData, profileData, profileLoaded: true });
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  session: null,
  tierData: { tier: 'free' },
  profileData: {},
  loading: false,
  profileLoaded: false,
  setUser: (user: User | null) => {
    const currentUser = get().user;
    if (user && (!currentUser || currentUser.id !== user.id)) {
      console.log('[AUTH_STATE] setUser:', { userId: user.id.substring(0, 8) });
      try { localStorage.removeItem(`${PROFILE_CACHE_PREFIX}${user.id}`); } catch {}
      set({ user, loading: false });
      fetchProfile(set, user.id);
    } else if (!user && currentUser) {
      console.log('[AUTH_STATE] setUser null — signing out');
      set({ user: null, session: null, tierData: { tier: 'free' }, profileData: {}, loading: false, profileLoaded: false });
    }
  },
  loginWithGoogle: async () => {
    console.log('[AUTH_STATE] loginWithGoogle — redirecting to Clerk sign-in');
    window.location.href = '/sign-in';
  },
  logout: async () => {
    const currentUser = get().user;
    console.log('[AUTH] logout — clearing state');
    try {
      const clerk = (window as any).Clerk;
      if (clerk && typeof clerk.signOut === 'function') await clerk.signOut();
    } catch (e) { console.warn('[AUTH] Clerk signOut failed:', e); }
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('clerk-') || key.startsWith('__clerk')) localStorage.removeItem(key);
    });
    await supabase.auth.signOut();
    cacheSession(null);
    const userId = currentUser?.id;
    if (userId) localStorage.removeItem(`${PROFILE_CACHE_PREFIX}${userId}`);
    set({ user: null, session: null, tierData: { tier: 'free' }, profileData: {}, loading: false, profileLoaded: false });
    window.location.href = '/';
  },
}));
