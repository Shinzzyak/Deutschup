// Clerk Auth Configuration — env only.

import { CLERK_PUBLISHABLE_KEY, isClerkEnabled } from './config';

export { isClerkEnabled };

// Always use Clerk when enabled (no canary routing)
export function shouldUseClerk(_email?: string | undefined | null): boolean {
  return isClerkEnabled();
}

export const isCanaryUser = shouldUseClerk;

export function getCanaryStatus() {
  const clerkEnabled = isClerkEnabled();
  return {
    clerkEnabled,
    publishableKeySet: clerkEnabled,
    publishableKeyPrefix: CLERK_PUBLISHABLE_KEY
      ? CLERK_PUBLISHABLE_KEY.substring(0, 12) + '...'
      : 'NOT SET',
    message: clerkEnabled
      ? 'Clerk is default auth for all users'
      : 'Clerk disabled, using Supabase',
  };
}
