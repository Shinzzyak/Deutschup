/// <reference types="vite/client" />
import { create } from 'zustand';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, type DbUserRow } from '../lib/supabase';

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

async function upsertAndLoadUserProfile(user: SupabaseUser): Promise<DbUserRow | null> {
  const payload = { id: user.id, email: user.email ?? null, tier: 'free', tier_expiry: null, xp: 0, streak: 0 };
  const { error: upsertError } = await supabase.from('users').upsert(payload, { onConflict: 'id' });
  if (upsertError) console.error('Profile upsert failed:', upsertError);

  const { data, error } = await supabase.from('users').select('id,email,tier,tier_expiry,xp,streak').eq('id', user.id).single();
  if (error) {
    console.error('Profile load failed:', error);
    return null;
  }
  return data as DbUserRow;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tierData: { tier: 'free' },
  progressData: { xp: 0, streak: 0 },
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

export const initAuth = () => {
  if (authInitialized) return;

  if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
    window.alert('1. Mantap! Token berhasil kebawa dari Google.');
  }
  authInitialized = true;

  const set = useAuthStore.setState;

  supabase.auth.getSession().then(async ({ data: { session }, error }) => {
    if (error) window.alert(`Error getSession: ${error.message}`);
    if (session?.user) {
      window.alert(`2. Berhasil getSession! Login sukses bre: ${session.user.email}`);
      set({ user: mapSupabaseUser(session.user), loading: false, authError: null });
      const row = await upsertAndLoadUserProfile(session.user);
      if (row) {
        set({
          tierData: { tier: row.tier || 'free', tierExpiry: row.tier_expiry ? new Date(row.tier_expiry).getTime() : undefined },
          progressData: { xp: row.xp ?? 0, streak: row.streak ?? 0 },
        });
      }
    } else {
      set({ user: null, loading: false });
    }
  }).catch((error) => {
    console.error('Session init error:', error);
    set({ loading: false, authError: formatAuthError(error) });
  });

  const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
    window.alert(`3. Auth Event ke-trigger: ${event}`);
    if (session?.user) {
      window.alert(`2. Berhasil getSession! Login sukses bre: ${session.user.email}`);
      set({ user: mapSupabaseUser(session.user), loading: false, authError: null });
      const row = await upsertAndLoadUserProfile(session.user);
      if (row) {
        set({
          tierData: { tier: row.tier || 'free', tierExpiry: row.tier_expiry ? new Date(row.tier_expiry).getTime() : undefined },
          progressData: { xp: row.xp ?? 0, streak: row.streak ?? 0 },
        });
      }
    } else if (event === 'SIGNED_OUT') {
      set({ user: null, tierData: { tier: 'free' }, progressData: { xp: 0, streak: 0 }, loading: false });
    }
  });

  authSubscription = data.subscription;
};

export const cleanupAuth = () => {
  authSubscription?.unsubscribe();
  authSubscription = null;
  authInitialized = false;
};
