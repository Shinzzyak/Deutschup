/// <reference types="vite/client" />
import { create } from 'zustand';
import { User, onAuthStateChanged, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

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
  // Tangkap hasil redirect login (penting untuk browser mobile)
  getRedirectResult(auth).catch((error) => {
    console.error('Google redirect login failed:', error);
  });

  onAuthStateChanged(auth, async (user) => {
    let tierData: TierData = { tier: 'free' };

    try {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          tierData = {
            tier: docSnap.data()?.tier || 'free',
            tierExpiry: docSnap.data()?.tierExpiry,
          };
        } else {
          await setDoc(docRef, { tier: 'free' });
        }

        // Admin override (UI-level only)
        if (user.email && user.email === import.meta.env.VITE_ADMIN_EMAIL) {
          tierData.tier = 'pro';
        }
      }
    } catch (error) {
      // Jangan throw di sini supaya loading tidak nyangkut terus
      console.error('Auth state sync failed:', error);
    } finally {
      set({ user, tierData, loading: false });
    }
  });

  return {
    user: null,
    tierData: { tier: 'free' },
    loading: true,
    loginWithGoogle: async () => {
      try {
        const provider = new GoogleAuthProvider();
        await signInWithRedirect(auth, provider);
      } catch (error) {
        console.error('Google login failed:', error);
        set({ loading: false });
        throw error;
      }
    },
    logout: async () => {
      await signOut(auth);
    }
  };
});
