import { test, expect } from '@playwright/test';
import { BASE, loginAs, requireCredentials } from '../helpers/auth';

test.describe('Authentication Flow (publik)', () => {
  test('sign-in page should render', async ({ page }) => {
    await page.goto(`${BASE}/sign-in`, { waitUntil: 'domcontentloaded' });

    const signInForm = page.locator('input[name="identifier"]');
    await expect(signInForm).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Authentication Flow (butuh akun uji)', () => {
  // Skipped, with the reason printed, when E2E_EMAIL / E2E_PASSWORD are unset.
  requireCredentials();

  test('login should land on authenticated page', async ({ page }) => {
    await loginAs(page);

    // After login + onboarding skip, should be on dashboard or root (authenticated)
    const url = page.url();
    const isAuthenticated = url.includes('dashboard') || url === BASE + '/' || url === BASE;
    expect(isAuthenticated).toBe(true);

    // Should not be on sign-in anymore
    expect(url).not.toContain('sign-in');
  });

  test('dashboard should show user content after login', async ({ page }) => {
    await loginAs(page);

    // Wait for content to render
    await page.waitForTimeout(3000);

    const content = await page.textContent('body');
    // Should have some content (not blank error page)
    expect(content!.length).toBeGreaterThan(50);
  });
});
