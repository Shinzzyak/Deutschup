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
  tierData: TierData;
  profileData: ProfileData;
  loading: boolean;
  isRefreshing: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => {
  const updateAuthState = async (session: any) => {
    if (get().isRefreshing) return;
    set({ isRefreshing: true });

    const user = session?.user ?? null;
    let tierData: TierData = { tier: 'free' };
    let profileData: ProfileData = {};

    try {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('tier, tierExpiry, full_name, avatar_url, role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('CRITICAL: Could not fetch profile data:', error.message);
          const { error: createError } = await supabase
            .from('profiles')
            .insert({ id: user.id, tier: 'free', role: 'user' });
          if (createError) console.error('CRITICAL: Profile creation failed:', createError.message);
        } else if (data) {
          tierData = { tier: data.tier || 'free', tierExpiry: data.tierExpiry };
          profileData = { full_name: data.full_name, avatar_url: data.avatar_url, role: data.role };
        }
      }
    } catch (e) {
      console.error('Critical auth sync error:', e);
    } finally {
      // Force Admin Access
      if (user?.email === import.meta.env.VITE_ADMIN_EMAIL) {
        tierData = { ...tierData, tier: 'pro' };
        profileData = { ...profileData, role: 'admin' };
      }
      set({ user, tierData, profileData, loading: false, isRefreshing: false });
    }
  };

  supabase.auth.getSession().then(({ data: { session } }) => updateAuthState(session));
  supabase.auth.onAuthStateChange(async (event, session) => await updateAuthState(session));

  return {
    user: null,
    tierData: { tier: 'free' },
    profileData: {},
    loading: true,
    isRefreshing: false,
    loginWithGoogle: async () => await supabase.auth.signInWithOAuth({ provider: 'google' }),
    logout: async () => await supabase.auth.signOut(),
  };
});
