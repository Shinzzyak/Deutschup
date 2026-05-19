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
  const payload = {
    id: user.id,
    email: user.email ?? null,
    tier: 'free',
    tier_expiry: null,
    xp: 0,
    streak: 0,
  };

  const { error: upsertError } = await supabase
    .from('users')
    .upsert(payload, { onConflict: 'id' });

  if (upsertError) {
    console.error('Profile upsert failed:', upsertError);
  }

  const { data, error } = await supabase
    .from('users')
    .select('id,email,tier,tier_expiry,xp,streak')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Profile load failed:', error);
    return null;
  }

  return data as DbUserRow;
}

export const useAuthStore = create<AuthState>((set) => {
  const initAuth = async () => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('Session init error:', sessionError);
      set({ loading: false, authError: formatAuthError(sessionError) });
    }

    if (sessionData.session?.user) {
      set({ user: mapSupabaseUser(sessionData.session.user), loading: false });
      upsertAndLoadUserProfile(sessionData.session.user).then((row) => {
        if (!row) return;
        set({
          tierData: { tier: row.tier || 'free', tierExpiry: row.tier_expiry ? new Date(row.tier_expiry).getTime() : undefined },
          progressData: { xp: row.xp ?? 0, streak: row.streak ?? 0 },
        });
      });
    } else {
      set({ loading: false });
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        set({ user: null, tierData: { tier: 'free' }, progressData: { xp: 0, streak: 0 }, loading: false });
        return;
      }

      set({ user: mapSupabaseUser(session.user), loading: false, authError: null });

      const row = await upsertAndLoadUserProfile(session.user);
      if (!row) return;

      set({
        tierData: { tier: row.tier || 'free', tierExpiry: row.tier_expiry ? new Date(row.tier_expiry).getTime() : undefined },
        progressData: { xp: row.xp ?? 0, streak: row.streak ?? 0 },
      });
    });
  };

  initAuth();

  return {
    user: null,
    tierData: { tier: 'free' },
    progressData: { xp: 0, streak: 0 },
    loading: true,
    authError: null,
    loginWithGoogle: async () => {
      set({ authError: null });
      const redirectTo = `${window.location.origin}/`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });

      if (error) {
        console.error('OAuth trigger failed:', error);
        set({ authError: formatAuthError(error), loading: false });
      }
    },
    logout: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout failed:', error);
        set({ authError: formatAuthError(error) });
      }
    },
  };
});
