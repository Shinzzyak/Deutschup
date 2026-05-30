/// <reference types="vite/client" />
import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface TierData {
  tier: 'free' | 'pro';
  tierExpiry?: number;
}

interface AuthState {
  user: User | null;
  tierData: TierData;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => {
  // Initialize auth state listener
  supabase.auth.onAuthStateChange(async (event, session) => {
    const user = session?.user ?? null;
    let tierData: TierData = { tier: 'free' };

    if (user) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('tier, tierExpiry')
          .eq('id', user.id)
          .single();

        if (error || !data) {
          console.warn('Could not fetch profile tier data:', error);
        } else {
          tierData = {
            tier: data.tier || 'free',
            tierExpiry: data.tierExpiry,
          };
        }

        // Admin Override
        if (user.email && user.email === import.meta.env.VITE_ADMIN_EMAIL) {
          tierData.tier = 'pro';
        }
      } catch (e) {
        console.error('Error fetching profile tier data:', e);
      }
    }
    
    set({ user, tierData, loading: false });
  });

  return {
    user: null,
    tierData: { tier: 'free' },
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
