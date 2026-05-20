/// <reference types="vite/client" />
import { create } from 'zustand';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface TierData {
  tier: 'free' | 'pro';
  tierExpiry?: number;
}

export interface ProgressData {
  xp: number;
  streak: number;
}

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string;
  photoURL: string;
  getIdToken: () => Promise<string | undefined>;
}

interface AuthState {
  user: AppUser | null;
  tierData: TierData;
  progressData: ProgressData;
  loading: boolean;
  authError?: string | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

function mapSupabaseUser(user: SupabaseUser): AppUser {
  return {
    uid: user.id,
    email: user.email ?? null,
    displayName: (user.user_metadata?.full_name as string) || (user.user_metadata?.name as string) || user.email || 'Siswa',
    photoURL: (user.user_metadata?.avatar_url as string) || '',
    getIdToken: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session?.access_token;
    },
  };
}

function formatAuthError(error: any) {
  return `Supabase Auth Error: ${error?.message || 'Unknown error'}`;
}

const defaultTier: TierData = { tier: 'free' };
const defaultProgress: ProgressData = { xp: 0, streak: 0 };

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tierData: defaultTier,
  progressData: defaultProgress,
  loading: true,
  authError: null,
  loginWithGoogle: async () => {
    set({ loading: true, authError: null });
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: 'https://deutschup.sintec.my.id' },
      });
      if (error) throw error;
    } catch (error: any) {
      console.error('Google login failed:', error);
      set({ loading: false, authError: formatAuthError(error) });
    }
  },
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout failed:', error);
      set({ authError: formatAuthError(error) });
    }
  },
}));

let authInitialized = false;
let authSubscription: { unsubscribe: () => void } | null = null;

async function syncUserData(user: SupabaseUser) {
  const set = useAuthStore.setState;

  // bypass spinner: let user in immediately
  set({ user: mapSupabaseUser(user), loading: false, authError: null });

  try {
    await supabase.from('users').upsert(
      { id: user.id, email: user.email ?? null },
      { onConflict: 'id' }
    );

    const { data } = await supabase
      .from('users')
      .select('tier,tier_expiry,xp,streak')
      .eq('id', user.id)
      .single();

    if (data) {
      set({
        tierData: {
          tier: data.tier || 'free',
          tierExpiry: data.tier_expiry ? new Date(data.tier_expiry).getTime() : undefined,
        },
        progressData: {
          xp: data.xp || 0,
          streak: data.streak || 0,
        },
      });
    }
  } catch (err) {
    console.error('Sync gagal:', err);
  } finally {
    set({ loading: false });
  }
}

export const initAuth = async () => {
  if (authInitialized) return;
  authInitialized = true;

  const set = useAuthStore.setState;

  // 1) hydrate current session immediately
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      set({ user: null, loading: false, tierData: defaultTier, progressData: defaultProgress });
    } else {
      await syncUserData(session.user);
    }
  } catch {
    set({ user: null, loading: false, tierData: defaultTier, progressData: defaultProgress });
  } finally {
    // Safety net agar authLoading tidak menggantung
    set((state) => ({ ...state, loading: false }));
  }

  // 2) subscribe to future auth transitions
  const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_OUT' || !session?.user) {
      set({ user: null, loading: false, tierData: defaultTier, progressData: defaultProgress });
      return;
    }

    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
      await syncUserData(session.user);
    }
  });

  authSubscription = data.subscription;
};

export const cleanupAuth = () => {
  authSubscription?.unsubscribe();
  authSubscription = null;
  authInitialized = false;
};
