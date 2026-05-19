/// <reference types="vite/client" />
import { create } from 'zustand';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

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
  onAuthStateChanged(auth, async (user) => {
    let tierData: TierData = { tier: 'free' };
    if (user) {
      try {
        const docSnap = await getDoc(doc(db, 'users', user.uid));
        if (docSnap.exists()) {
          tierData = { 
             tier: docSnap.data()?.tier || 'free',
             tierExpiry: docSnap.data()?.tierExpiry
          };
        } else {
          // Initialize empty user doc
          try {
            await setDoc(doc(db, 'users', user.uid), { tier: 'free' });
          } catch(e) {
            handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}`);
          }
        }
        
        // Admin Override
        if (user.email && user.email === import.meta.env.VITE_ADMIN_EMAIL) {
          tierData.tier = 'pro';
        }
      } catch (e) {
        handleFirestoreError(e, OperationType.GET, `users/${user.uid}`);
      }
    }
    set({ user, tierData, loading: false });
  });

  return {
    user: null,
    tierData: { tier: 'free' },
    loading: true,
    loginWithGoogle: async () => {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    },
    logout: async () => {
      await signOut(auth);
    }
  };
});
