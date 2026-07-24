// Client Clerk config — official Vite env names:
// https://clerk.com/docs/guides/development/clerk-environment-variables
// Pure React/Vite: use props on <ClerkProvider> for redirects (docs); keys via VITE_*.

const e = import.meta.env;

/** Official Vite publishable key */
export const CLERK_PUBLISHABLE_KEY: string =
  (e.VITE_CLERK_PUBLISHABLE_KEY as string) || '';

/**
 * Official: VITE_CLERK_FAPI — Frontend API URL.
 * Fallback alias VITE_CLERK_FRONTEND_API (our earlier name).
 */
export const CLERK_FAPI: string =
  (e.VITE_CLERK_FAPI as string) ||
  (e.VITE_CLERK_FRONTEND_API as string) ||
  'https://clerk.sintec.my.id';

/** @deprecated alias */
export const CLERK_FRONTEND_API = CLERK_FAPI;

/** Official debug default: VITE_CLERK_API_URL → https://api.clerk.com */
export const CLERK_API_URL: string =
  (e.VITE_CLERK_API_URL as string) || 'https://api.clerk.com';

export const CLERK_JWKS_URL: string =
  (e.VITE_CLERK_JWKS_URL as string) ||
  `${CLERK_FAPI.replace(/\/$/, '')}/.well-known/jwks.json`;

export const CLERK_ISSUER: string =
  (e.VITE_CLERK_ISSUER as string) ||
  CLERK_FAPI.replace(/\/$/, '');

/**
 * Redirect fallbacks — official Vite names (preferred over deprecated AFTER_*).
 * Pure React also accepts these as ClerkProvider props.
 */
export const SIGN_IN_FALLBACK_REDIRECT_URL: string =
  (e.VITE_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL as string) ||
  (e.VITE_APP_URL as string) ||
  'https://deutschup.sintec.my.id';

export const SIGN_UP_FALLBACK_REDIRECT_URL: string =
  (e.VITE_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL as string) ||
  SIGN_IN_FALLBACK_REDIRECT_URL;

export const APP_URL: string =
  (e.VITE_APP_URL as string) ||
  SIGN_IN_FALLBACK_REDIRECT_URL;

export function isClerkEnabled(): boolean {
  return Boolean(CLERK_PUBLISHABLE_KEY && CLERK_PUBLISHABLE_KEY.length > 10);
}
