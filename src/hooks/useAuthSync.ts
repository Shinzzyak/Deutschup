// Auth Sync Hook
// Bridges Clerk auth with the existing authStore
// Components use this hook to sync Clerk user with authStore

import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useAuthStore } from '../stores/authStore';

export function useAuthSync() {
  const { isSignedIn, isLoaded: clerkLoaded } = useAuth();
  const { user: clerkUser } = useUser();
  const { user: storeUser, loading: storeLoading, setUser } = useAuthStore();

  useEffect(() => {
    if (!clerkLoaded) return;

    if (isSignedIn && clerkUser) {
      // Clerk user is signed in — create user object for store
      const user = {
        id: clerkUser.id,
        email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
        user_metadata: {
          full_name: clerkUser.fullName || clerkUser.firstName || '',
          avatar_url: clerkUser.imageUrl || '',
        },
      } as any;

      // Sync to store (will fetch profile from Supabase)
      setUser(user);
    } else if (!isSignedIn && clerkLoaded) {
      // Signed out from Clerk — clear store
      console.log('[AUTH_SYNC] Clerk signed out, clearing store');
      setUser(null);
    }
  }, [clerkUser, isSignedIn, clerkLoaded, setUser]);

  return {
    user: clerkUser,
    isSignedIn,
    isLoaded: clerkLoaded,
  };
}
