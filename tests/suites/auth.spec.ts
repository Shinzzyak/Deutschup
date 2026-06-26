import { test, expect } from '@playwright/test';
import { BASE, loginAs, skipOnboarding } from '../helpers/auth';

// Skip if no test credentials
const hasCredentials = !!process.env.E2E_TEST_PASSWORD;

test.describe('Authentication Flow', () => {
  test.skip(!hasCredentials, 'E2E_TEST_PASSWORD not set');

  test('sign-in page should render', async ({ page }) => {
    await page.goto(`${BASE}/sign-in`, { waitUntil: 'domcontentloaded' });

    // Clerk sign-in component should load
    const signInForm = page.locator('input[name="identifier"]');
    await expect(signInForm).toBeVisible({ timeout: 15000 });
  });

  test('sign-up page should render', async ({ page }) => {
    await page.goto(`${BASE}/sign-up`, { waitUntil: 'domcontentloaded' });

    const signUpForm = page.locator('input[name="identifier"]');
    await expect(signUpForm).toBeVisible({ timeout: 15000 });
  });

  test('login should redirect to dashboard', async ({ page }) => {
    await loginAs(page);

    // Should be on dashboard
    await expect(page).toHaveURL(/dashboard/);
  });

  test('dashboard should show user content after login', async ({ page }) => {
    await loginAs(page);

    // Should see dashboard elements
    const content = await page.textContent('body');
    const hasDashboardContent =
      content?.includes('Dashboard') ||
      content?.includes('Level') ||
      content?.includes('Selamat');
    expect(hasDashboardContent).toBe(true);
  });
});
