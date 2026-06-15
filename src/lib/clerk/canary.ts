// IMPLEMENTATION-048G: Clerk Canary Routing
// Determines which auth runtime to use based on email

const CANARY_EMAILS_KEY = "deutschup_canary_emails";

// Default canary: only admin
function getDefaultCanaryEmails(): string[] {
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
  return adminEmail ? [adminEmail] : [];
}

export function getCanaryEmails(): string[] {
  try {
    const stored = localStorage.getItem(CANARY_EMAILS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return getDefaultCanaryEmails();
}

export function setCanaryEmails(emails: string[]): void {
  localStorage.setItem(CANARY_EMAILS_KEY, JSON.stringify(emails));
}

export function isCanaryUser(email: string | undefined | null): boolean {
  if (!email) return false;
  const canaryEmails = getCanaryEmails();
  return canaryEmails.includes(email.toLowerCase());
}

export function isClerkEnabled(): boolean {
  const key = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  return !!key && key.length > 10;
}

export function shouldUseClerk(email: string | undefined | null): boolean {
  return isClerkEnabled() && isCanaryUser(email);
}

// Diagnostics
export function getCanaryStatus() {
  const clerkEnabled = isClerkEnabled();
  const canaryEmails = getCanaryEmails();
  return {
    clerkEnabled,
    canaryEmails,
    canaryCount: canaryEmails.length,
    publishableKeySet: clerkEnabled,
    publishableKeyPrefix: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.substring(0, 12) + "..." || "NOT SET",
  };
}
