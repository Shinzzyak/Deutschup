// Clerk config — env-only, names aligned with official docs:
// https://clerk.com/docs/guides/development/clerk-environment-variables
// https://clerk.com/docs/reference/backend/verify-token

const procEnv =
  typeof process !== 'undefined' && process.env ? process.env : ({} as Record<string, string | undefined>);

function pick(...keys: string[]): string {
  for (const k of keys) {
    const v = procEnv[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return '';
}

/** Official Vite: VITE_CLERK_FAPI — Frontend API URL */
export const CLERK_FAPI =
  pick('CLERK_FAPI', 'VITE_CLERK_FAPI', 'CLERK_FRONTEND_API', 'VITE_CLERK_FRONTEND_API') ||
  'https://concrete-sparrow-45.clerk.accounts.dev';

/** @deprecated alias */
export const CLERK_FRONTEND_API = CLERK_FAPI;

/** Official: VITE_CLERK_API_URL — default https://api.clerk.com */
export const CLERK_API_URL =
  pick('CLERK_API_URL', 'VITE_CLERK_API_URL', 'CLERK_BACKEND_API') ||
  'https://api.clerk.com';

/** @deprecated alias */
export const CLERK_BACKEND_API = CLERK_API_URL;

/** JWKS = FAPI + /.well-known/jwks.json (manual JWT path in docs) */
export const CLERK_JWKS_URL =
  pick('CLERK_JWKS_URL', 'VITE_CLERK_JWKS_URL') ||
  `${CLERK_FAPI.replace(/\/$/, '')}/.well-known/jwks.json`;

export const CLERK_ISSUER =
  pick('CLERK_ISSUER', 'VITE_CLERK_ISSUER') ||
  CLERK_FAPI.replace(/\/$/, '');

/** Official Vite: VITE_CLERK_PUBLISHABLE_KEY */
export const CLERK_PUBLISHABLE_KEY = pick(
  'VITE_CLERK_PUBLISHABLE_KEY',
  'CLERK_PUBLISHABLE_KEY'
);

/** Official: CLERK_SECRET_KEY (server only) */
export const CLERK_SECRET_KEY = pick('CLERK_SECRET_KEY');

/**
 * Official networkless PEM: CLERK_JWT_KEY
 * (verifyToken docs + Manual JWT verification)
 * Aliases: CLERK_JWKS_PUBLIC_KEY, CLERK_PEM_PUBLIC_KEY
 */
export const CLERK_JWT_KEY = pick(
  'CLERK_JWT_KEY',
  'CLERK_JWKS_PUBLIC_KEY',
  'CLERK_PEM_PUBLIC_KEY'
).replace(/\\n/g, '\n');

/** @deprecated alias — use CLERK_JWT_KEY */
export const CLERK_JWKS_PUBLIC_KEY = CLERK_JWT_KEY;

export const APP_URL =
  pick('APP_URL', 'VITE_APP_URL') ||
  'https://deutschup.sintec.my.id';

/**
 * Options for @clerk/backend verifyToken().
 * Prefer jwtKey (networkless PEM) when set; else secretKey + Backend API JWKS.
 * authorizedParties required for production-grade azp checks.
 */
export function clerkVerifyOptions(): {
  secretKey?: string;
  jwtKey?: string;
  apiUrl?: string;
  authorizedParties?: string[];
} {
  const opts: {
    secretKey?: string;
    jwtKey?: string;
    apiUrl?: string;
    authorizedParties?: string[];
  } = {};

  if (CLERK_JWT_KEY && CLERK_JWT_KEY.includes('BEGIN PUBLIC KEY')) {
    opts.jwtKey = CLERK_JWT_KEY;
  } else if (CLERK_SECRET_KEY) {
    opts.secretKey = CLERK_SECRET_KEY;
    if (CLERK_API_URL) opts.apiUrl = CLERK_API_URL;
  }

  opts.authorizedParties = [
    APP_URL.replace(/\/$/, ''),
    'https://deutschup.sintec.my.id',
    'https://deutschup.pages.dev',
  ];
  // Session tokens minted via Backend API often omit azp — allow empty party check soft path.
  // verifyToken still validates signature/exp; azp only enforced when present.
  return opts;
}
