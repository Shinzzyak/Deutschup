import { test } from '@playwright/test';
import { isLocalUrl, resolveBaseUrl } from './target';

/**
 * Every environment-dependent value the e2e suite needs, in one place.
 *
 * Hard rule for this file and everything under tests/: NO credential and NO
 * production hostname may ever be written down here. Both arrive at run time
 * through the environment. A checkout of this repo must not be enough to log
 * in as anybody.
 */

/** Target host. Defaults to the local dev server — see docs/TESTING.md. */
export const BASE = resolveBaseUrl(process.env.E2E_BASE_URL);

/** True when the target is served by Vite on this machine. */
export const isLocalTarget = isLocalUrl(BASE);

/**
 * `/api/*` and the security headers come from Cloudflare Pages, not from Vite.
 * Suites that assert on them only make sense against a deployed target — or a
 * local `wrangler pages dev`, which callers opt into with E2E_EDGE_TESTS=1.
 */
export const edgeTestsEnabled = !isLocalTarget || process.env.E2E_EDGE_TESTS === '1';

export const E2E_EMAIL = (process.env.E2E_EMAIL ?? '').trim();
export const E2E_PASSWORD = process.env.E2E_PASSWORD ?? '';

/** Whether a login-dependent test can run at all. */
export const hasCredentials = E2E_EMAIL !== '' && E2E_PASSWORD !== '';

export const NO_CREDENTIALS_REASON =
  'Butuh akun uji. Set E2E_EMAIL dan E2E_PASSWORD dulu. ' +
  'Pakai akun uji khusus — JANGAN akun admin sungguhan. Panduan: docs/TESTING.md';

export const NO_EDGE_REASON =
  `Target ${BASE} tidak menyajikan /api dan header keamanan Cloudflare. ` +
  'Arahkan E2E_BASE_URL ke host yang sudah ter-deploy, atau set E2E_EDGE_TESTS=1 ' +
  'kalau kamu menjalankan "wrangler pages dev" secara lokal. Panduan: docs/TESTING.md';

export const NO_DEPLOYED_TARGET_REASON =
  `Target ${BASE} adalah dev server Vite: bundel belum di-build, tanpa CDN, ` +
  'jadi angka performa dari sini tidak berarti apa-apa. Arahkan E2E_BASE_URL ke ' +
  'host ter-deploy (atau "wrangler pages dev" + E2E_EDGE_TESTS=1). Panduan: docs/TESTING.md';

/**
 * Skips the enclosing test or describe group when no test account is
 * configured. Call it inside a `test.describe` body or a test body.
 */
export function requireCredentials(): void {
  test.skip(!hasCredentials, NO_CREDENTIALS_REASON);
}

/** Skips the enclosing group when the target has no serverless functions/edge headers. */
export function requireEdgeTarget(): void {
  test.skip(!edgeTestsEnabled, NO_EDGE_REASON);
}

/**
 * Skips the enclosing group unless the target serves a real production build.
 * Same condition as requireEdgeTarget(), different reason: measuring a Vite dev
 * server tells you nothing about how the shipped bundle behaves.
 */
export function requireDeployedTarget(): void {
  test.skip(!edgeTestsEnabled, NO_DEPLOYED_TARGET_REASON);
}

// Say out loud what this run is about to do. A silent skip is how a suite ends
// up "green" for months without ever having run (see docs/TESTING.md).
console.info(`[e2e] target  : ${BASE}${isLocalTarget ? ' (lokal)' : ' (REMOTE — pastikan disengaja)'}`);
console.info(
  hasCredentials
    ? `[e2e] akun uji: ${E2E_EMAIL}`
    : `[e2e] akun uji: TIDAK ADA — tes yang butuh login akan DILEWATI. ${NO_CREDENTIALS_REASON}`,
);
