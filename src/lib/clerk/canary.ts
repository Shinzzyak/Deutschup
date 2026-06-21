// Clerk Auth Configuration
// Clerk is now the default auth for ALL users (admin + regular)
// Supabase is used for database only

export function isClerkEnabled(): boolean {
  const key = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  return !!key && key.length > 10;
}

// Always use Clerk when enabled (no more canary routing)
export function shouldUseClerk(email?: string | undefined | null): boolean {
  return isClerkEnabled();
}

// Alias for backward compatibility
export const isCanaryUser = shouldUseClerk;

// Diagnostics
export function getCanaryStatus() {
  const clerkEnabled = isClerkEnabled();
  return {
    clerkEnabled,
    publishableKeySet: clerkEnabled,
    publishableKeyPrefix: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.substring(0, 12) + "..." || "NOT SET",
    message: clerkEnabled ? 'Clerk is default auth for all users' : 'Clerk disabled, using Supabase'
  };
}
