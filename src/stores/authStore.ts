/// <reference types="vite/client" />
import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
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
  // Fetch profile data from Supabase (database only)
  const fetchProfile = async (userId: string) => {
    console.log('[AUTH_STATE] fetchProfile:', { userId: userId.substring(0, 8) });
    let tierData: TierData = { tier: 'free' };
    let profileData: ProfileData = {};

    // Check cache first
    const cached = loadCachedProfile(userId);
    if (cached) {
      tierData = cached.tierData;
      profileData = cached.profileData;
      // Return cached data immediately, fetch fresh in background
      set({ tierData, profileData, profileLoaded: true });
    }

    try {
      // 3s timeout for profile fetch
      const PROFILE_TIMEOUT_MS = 3000;

      const profilePromise = supabase
        .from('profiles')
        .select('tier, tier_expiry, full_name, avatar_url, role, subscription, pro_expires_at')
        .eq('id', userId)
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
              .insert({ id: userId, tier: 'free', role: 'user' });
            if (createError) console.error('[AUTH] profile create error:', createError.message);
          } catch (insertErr) {
            console.error('[AUTH] profile insert exception:', insertErr);
          }
        }
      } else if (data) {
        const parsed = parseProfileData(data);
        tierData = parsed.tierData;
        profileData = parsed.profileData;
        // Cache fresh profile data
        cacheProfile(userId, tierData, profileData);
      }
    } catch (e) {
      console.error('[AUTH] sync error:', e);
    }

    console.log('[AUTH_STATE] profile set:', { userId: userId.substring(0, 8), tier: tierData.tier });
    set({ tierData, profileData, profileLoaded: true });
  };

  return {
    // Set user from Clerk (called by useAuthSync hook)
    setUser: (user: User | null) => {
      const currentUser = get().user;
      if (user && (!currentUser || currentUser.id !== user.id)) {
        console.log('[AUTH_STATE] setUser:', { userId: user.id.substring(0, 8) });
        set({ user, loading: false });
        // Fetch profile from Supabase database
        fetchProfile(user.id);
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
      
      // Clear Clerk localStorage keys
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('clerk-') || key.startsWith('__clerk')) {
          localStorage.removeItem(key);
        }
      });
      
      // Sign out from Supabase (for database connection)
      await supabase.auth.signOut();
      
      // Clear cached session
      cacheSession(null);
      const userId = currentUser?.id;
      if (userId) localStorage.removeItem(`${PROFILE_CACHE_PREFIX}${userId}`);
      
      set({ user: null, session: null, tierData: { tier: 'free' }, profileData: {}, loading: false, profileLoaded: false });
      
      // Redirect to home page
      window.location.href = '/';
    },
  };
});
