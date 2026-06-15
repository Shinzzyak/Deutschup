// IMPLEMENTATION-048B: Clerk Provider Component (POC)
// Wraps app with ClerkProvider while keeping Supabase Auth intact

import { ClerkProvider as BaseClerkProvider } from "@clerk/clerk-react";

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "";

interface ClerkProviderProps {
  children: React.ReactNode;
}

export function ClerkProvider({ children }: ClerkProviderProps) {
  // POC: Only render ClerkProvider if key is configured
  // This allows the app to work without Clerk during development
  if (!CLERK_PUBLISHABLE_KEY) {
    console.warn("[CLERK-POC] VITE_CLERK_PUBLISHABLE_KEY not set, Clerk disabled");
    return <>{children}</>;
  }

  return (
    <BaseClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      {children}
    </BaseClerkProvider>
  );
}

export default ClerkProvider;
