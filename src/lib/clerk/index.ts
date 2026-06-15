// IMPLEMENTATION-048B: Clerk Integration Index (POC)
// Re-exports Clerk utilities for clean imports

export { ClerkProvider } from "./ClerkProvider";
export { validateClerkJWT, extractUserIdentity, isAdmin } from "./jwt";
export type { ClerkJWTClaims } from "./jwt";
