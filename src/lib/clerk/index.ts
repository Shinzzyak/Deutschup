// IMPLEMENTATION-048B/048G: Clerk Integration Index
// Re-exports Clerk utilities for clean imports

export { ClerkProvider } from "./ClerkProvider";
export { validateClerkJWT, extractUserIdentity, isAdmin } from "./jwt";
export type { ClerkJWTClaims } from "./jwt";

// Canary routing (048G)
export { isCanaryUser, isClerkEnabled, shouldUseClerk, getCanaryStatus, getCanaryEmails, setCanaryEmails } from "./canary";
export { canaryLoginWithGoogle, canaryLogout } from "./canary-auth";
