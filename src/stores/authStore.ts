/// <reference types="vite/client" />
import { create } from 'zustand';
import { User, onAuthStateChanged, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signOut } from 'firebase/auth';
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

export const useAuthStore = create<AuthState>((set, get) => {
  const initAuth = async () => {
    try {
      const result = await getRedirectResult(auth);
      if (result?.user) {
        set({ user: result.user, loading: true });
      }
    } catch (error: any) {
      const msg = formatAuthError(error);
      console.error('Google redirect login failed:', error);
      set({ loading: false, authError: msg });
      if (typeof window !== 'undefined') window.alert(msg);
    }

    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        set({ user: null, tierData: { tier: 'free' }, loading: false });
        return;
      }

      // Set state login dulu, jangan nunggu Firestore
      set({ user });

      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          set({
            tierData: {
              tier: data?.tier || 'free',
              tierExpiry: data?.tierExpiry,
            },
            loading: false,
          });
        } else {
          await setDoc(docRef, { tier: 'free' });
          set({ tierData: { tier: 'free' }, loading: false });
        }

        if (user.email && user.email === import.meta.env.VITE_ADMIN_EMAIL) {
          set((state) => ({ tierData: { ...state.tierData, tier: 'pro' }, loading: false }));
        }
      } catch (error) {
        console.error('Auth state sync failed:', error);
        set({ loading: false });
      }
    });
  };

  initAuth();

  return {
    user: null,
    tierData: { tier: 'free' },
    loading: true,
    authError: null,
    loginWithGoogle: async () => {
      set({ loading: true, authError: null });

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      try {
        await signInWithRedirect(auth, provider);
      } catch (error: any) {
        const msg = formatAuthError(error);
        console.error('Login trigger failed:', error);
        set({ loading: false, authError: msg });
        if (typeof window !== 'undefined') window.alert(msg);
      }
    },
    logout: async () => {
      await signOut(auth);
    }
  };
});
