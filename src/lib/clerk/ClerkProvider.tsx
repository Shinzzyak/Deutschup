// ClerkProvider — keys + redirects from env (Vite official names).
// Docs: pure React uses props on components; meta-frameworks prefer env.
// https://clerk.com/docs/guides/development/clerk-environment-variables

import { ClerkProvider as BaseClerkProvider } from '@clerk/clerk-react';
// ⚠️ LOAD-BEARING: `ui: { ClerkUI }` registers @clerk/ui web components in
// clerk-js v6. Without it, <SignIn/> and <GoogleOneTap/> throw
// "Clerk was not loaded with Ui components" → auth fully dead.
// Removal regression 2026-09-01 (guest + sign-in crash). DO NOT REMOVE.
import * as UiPkg from '@clerk/ui';
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
      // ⚠️ LOAD-BEARING (see import note): registers @clerk/ui components in clerk-js v6.
      {...({ ui: { ClerkUI: UiPkg.ui.ClerkUI } } as Record<string, unknown>)}
      signInFallbackRedirectUrl={SIGN_IN_FALLBACK_REDIRECT_URL}
      signUpFallbackRedirectUrl={SIGN_UP_FALLBACK_REDIRECT_URL}
      afterSignOutUrl={SIGN_IN_FALLBACK_REDIRECT_URL}
    >
      {children}
    </BaseClerkProvider>
  );
}

export default ClerkProvider;
