import { Page, expect } from '@playwright/test';

const BASE = 'https://deutschup.sintec.my.id';

/**
 * Login helper — handles Clerk sign-in + onboarding skip
 * Uses env vars for credentials (never hardcode)
 */
export async function loginAs(page: Page, email?: string, password?: string) {
  const testEmail = email || process.env.E2E_TEST_EMAIL || 'e2etest@deutschup.test';
  const testPassword = password || process.env.E2E_TEST_PASSWORD || '';

  await page.goto(`${BASE}/sign-in`, { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Wait for Clerk to load
  const identifierInput = page.locator('input[name="identifier"]');
  await identifierInput.waitFor({ state: 'visible', timeout: 15000 });
  await identifierInput.fill(testEmail);

  const continueBtn = page.locator('button:has-text("Continue")').first();
  await continueBtn.click();

  // Password step
  const passwordInput = page.locator('input[name="password"]');
  await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
  await passwordInput.fill(testPassword);
  await continueBtn.click();

  // Wait for redirect
  await page.waitForURL('**/dashboard**', { timeout: 30000 }).catch(() => {
    // May land on onboarding instead
  });

  // Skip onboarding if present
  await skipOnboarding(page);
}

/**
 * Skip onboarding flow if visible
 */
export async function skipOnboarding(page: Page) {
  const welcomeText = page.locator('text=Selamat Datang');
  if (await welcomeText.isVisible().catch(() => false)) {
    await page.locator('button:has-text("Mulai")').click({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("A1")').first().click({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Lanjut', exact: true }).click({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(500);
    await page.locator('button:has-text("Percakapan")').click({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(500);
    await page.locator('button:has-text("Selesai")').click({ timeout: 5000 }).catch(() => {});
    await page.waitForURL('**/dashboard**', { timeout: 15000 }).catch(() => {});
  }
}

/**
 * Wait for page to be interactive (not just loaded)
 */
export async function waitForInteractive(page: Page) {
  await page.waitForLoadState('networkidle');
  // Wait for React to hydrate
  await page.waitForSelector('#root', { state: 'attached', timeout: 10000 });
}

export { BASE };
