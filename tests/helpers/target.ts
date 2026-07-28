/**
 * Resolves the e2e target host.
 *
 * Deliberately dependency-free (no `@playwright/test` import) so that both
 * `playwright.config.ts` and the test helpers can share one implementation
 * without the config pulling test-runner globals into its own module graph.
 *
 * The default is the LOCAL dev server. Aiming the suite at production must be
 * an explicit act (`E2E_BASE_URL=https://...`), never the fallback — a run that
 * silently hits production logs in as a real user and writes real rows.
 */

export const DEFAULT_BASE_URL = 'http://localhost:5173';

/** Vite's default dev port; used when the target URL omits one. */
const DEFAULT_DEV_PORT = '5173';

/**
 * Normalises the configured target: trims, drops trailing slashes, falls back
 * to the local dev server when the variable is unset or blank.
 */
export function resolveBaseUrl(raw?: string | null): string {
  const value = (raw ?? '').trim();
  return (value || DEFAULT_BASE_URL).replace(/\/+$/, '');
}

/**
 * True when the target runs on this machine. Local targets are served by Vite,
 * which has neither the Cloudflare Pages functions behind `/api/*` nor the
 * security headers from `public/_headers`, so suites that assert on those are
 * skipped rather than failed.
 */
export function isLocalUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host === 'localhost' || host === '127.0.0.1' || host === '::1' || host === '0.0.0.0';
  } catch {
    return false;
  }
}

/** Port Playwright should start the dev server on, taken from the target URL. */
export function devPortOf(url: string): string {
  try {
    return new URL(url).port || DEFAULT_DEV_PORT;
  } catch {
    return DEFAULT_DEV_PORT;
  }
}
