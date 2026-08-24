import { defineConfig } from '@playwright/test';
import { devPortOf, isLocalUrl, resolveBaseUrl } from './tests/helpers/target';

/**
 * E2E target.
 *
 * The default is the LOCAL dev server, never production. `npm run test:e2e`
 * with nothing set used to sign into the live site with a real admin account
 * and click through it. Aiming at a deployed host is an explicit decision now:
 *
 *   E2E_BASE_URL=https://<host> npm run test:e2e
 *
 * See docs/TESTING.md.
 */
const baseURL = resolveBaseUrl(process.env.E2E_BASE_URL);
const localTarget = isLocalUrl(baseURL);

if (!localTarget) {
  // Loud on purpose: such a run can create real rows and real payment records.
  console.warn(
    `\n[e2e] PERINGATAN: menyasar host non-lokal ${baseURL}.\n` +
      '[e2e] Pastikan ini disengaja dan akun uji yang dipakai BUKAN akun admin.\n',
  );
}

export default defineConfig({
  testDir: './tests/suites',
  timeout: 120000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: false, // Sequential for resource constraints
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1, // Single worker for 2GB VPS
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],
  use: {
    baseURL,
    // Only on failure. Screenshotting every passing test against a signed-in
    // account is what filled playwright-report/ with pictures of a real
    // dashboard, which then landed in the working tree.
    screenshot: 'only-on-failure',
    video: 'off',
    trace: 'on-first-retry',
    headless: true,
    // Resource constraints on 2GB VPS
    launchOptions: {
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--disable-extensions',
      ],
    },
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        viewport: { width: 1280, height: 720 },
      },
    },
  ],
  outputDir: './tests/results',
  // Start Vite automatically for local runs; an already-running dev server is
  // reused. Never started when the target is remote.
  webServer: localTarget
    ? {
        command: `npm run dev -- --port ${devPortOf(baseURL)} --strictPort`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
      }
    : undefined,
});
