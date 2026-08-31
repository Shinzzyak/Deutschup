// ClerkProvider — keys + redirects from env (Vite official names).
// Docs: pure React uses props on components; meta-frameworks prefer env.
// https://clerk.com/docs/guides/development/clerk-environment-variables

import { ClerkProvider as BaseClerkProvider } from '@clerk/clerk-react';
import {
  CLERK_PUBLISHABLE_KEY,
  isClerkEnabled,
  SIGN_IN_FALLBACK_REDIRECT_URL,
  SIGN_UP_FALLBACK_REDIRECT_URL,
} from './config';

interface ClerkProviderProps {
  children: React.ReactNode;
}

export function ClerkProvider({ children }: ClerkProviderProps) {
  if (!isClerkEnabled()) {
    console.warn('[CLERK] VITE_CLERK_PUBLISHABLE_KEY not set, Clerk disabled');
    return <>{children}</>;
  }

  return (
    <BaseClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      clerkJSVersion="6"
      signInFallbackRedirectUrl={SIGN_IN_FALLBACK_REDIRECT_URL}
      signUpFallbackRedirectUrl={SIGN_UP_FALLBACK_REDIRECT_URL}
      afterSignOutUrl={SIGN_IN_FALLBACK_REDIRECT_URL}
    >
      {children}
    </BaseClerkProvider>
  );
}

export default ClerkProvider;
