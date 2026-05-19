/// <reference types="vite/client" />
import { create } from 'zustand';
import { User, onAuthStateChanged, signInWithRedirect, signInWithPopup, getRedirectResult, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export interface TierData {
  tier: 'free' | 'pro';
  tierExpiry?: number;
}


function formatAuthError(error: any) {
  const code = error?.code || 'unknown';
  const message = error?.message || 'Unknown error';
  return `Error dari Firebase: ${code} | ${message}`;
}

interface AuthState {
  user: User | null;
  tierData: TierData;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  authError?: string | null;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => {
  // Tangkap hasil redirect login (penting untuk browser mobile)
  getRedirectResult(auth).catch((error) => {
    const msg = formatAuthError(error);
    console.error('Google redirect login failed:', error);
    set({ loading: false, authError: msg });
    if (typeof window !== 'undefined') window.alert(msg);
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
    authError: null,
    loginWithGoogle: async () => {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      try {
        set({ authError: null });

        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (isMobile) {
          await signInWithRedirect(auth, provider);
          return;
        }

        await signInWithPopup(auth, provider);
      } catch (error: any) {
        const msg = formatAuthError(error);
        console.error('Google login failed:', error);
        set({ loading: false, authError: msg });
        if (typeof window !== 'undefined') window.alert(msg);
        throw error;
      }
    },
    logout: async () => {
      await signOut(auth);
    }
  };
});
