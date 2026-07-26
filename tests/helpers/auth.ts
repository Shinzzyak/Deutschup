import { Page } from '@playwright/test';
import { BASE, E2E_EMAIL, E2E_PASSWORD, NO_CREDENTIALS_REASON, requireCredentials } from './env';

/**
 * Login helper — handles Clerk sign-in + onboarding skip.
 *
 * Credentials come from the environment (E2E_EMAIL / E2E_PASSWORD) and are
 * never defaulted to a real account. Any suite that calls loginAs() must guard
 * itself with requireCredentials(), so a missing account skips loudly instead
 * of failing on an empty sign-in form.
 */
export async function loginAs(page: Page, email?: string, password?: string) {
  const testEmail = email ?? E2E_EMAIL;
  const testPassword = password ?? E2E_PASSWORD;

  if (!testEmail || !testPassword) {
    // Getting here means a spec forgot its requireCredentials() guard.
    throw new Error(`loginAs() dipanggil tanpa kredensial. ${NO_CREDENTIALS_REASON}`);
  }

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

  // Wait for any post-login page
  await page.waitForTimeout(8000);

  // Skip onboarding if present
  await skipOnboarding(page);
}

/**
 * Skip onboarding flow if visible
 */
export async function skipOnboarding(page: Page) {
  const welcomeText = page.locator('text=Selamat Datang');
  const isVisible = await welcomeText.isVisible().catch(() => false);
  if (!isVisible) return;

  await page.locator('button:has-text("Mulai")').click({ timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(1000);
  await page.locator('button:has-text("A1")').first().click({ timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Lanjut', exact: true }).click({ timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(500);
  await page.locator('button:has-text("Percakapan")').click({ timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(500);
  await page.locator('button:has-text("Selesai")').click({ timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(3000);
}

// Re-exported so existing suites keep importing everything they need from one place.
export { BASE, E2E_EMAIL, requireCredentials };
