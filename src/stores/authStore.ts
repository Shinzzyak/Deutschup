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
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => {
  const updateAuthState = async (session: any) => {
    const user = session?.user ?? null;
    let tierData: TierData = { tier: 'free' };
    let profileData: ProfileData = {};

    if (user) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('tier, tierExpiry, full_name, avatar_url, role')
          .eq('id', user.id)
          .single();

        if (error || !data) {
          console.warn('Could not fetch profile data:', error);
        } else {
          tierData = {
            tier: data.tier || 'free',
            tierExpiry: data.tierExpiry,
          };
          profileData = {
            full_name: data.full_name,
            avatar_url: data.avatar_url,
            role: data.role,
          };
        }

        // Admin Override based on Env
        if (user.email && user.email === import.meta.env.VITE_ADMIN_EMAIL) {
          tierData.tier = 'pro';
          profileData.role = 'admin';
        }
      } catch (e) {
        console.error('Error fetching profile data:', e);
      }
    }
    
    set({ user, tierData, profileData, loading: false });
  };

  // Immediate session recovery on load
  supabase.auth.getSession().then(({ data: { session } }) => {
    updateAuthState(session);
  });

  // Listen for auth changes
  supabase.auth.onAuthStateChange(async (event, session) => {
    await updateAuthState(session);
  });

  return {
    user: null,
    tierData: { tier: 'free' },
    profileData: {},
    loading: true,
    loginWithGoogle: async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) throw error;
    },
    logout: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
  };
});
