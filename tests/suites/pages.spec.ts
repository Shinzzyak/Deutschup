import { test, expect } from '@playwright/test';
import { BASE, E2E_EMAIL, loginAs, requireCredentials } from '../helpers/auth';

test.describe('Page Rendering', () => {
  // Every test here needs a signed-in session.
  requireCredentials();

  test.beforeEach(async ({ page }) => {
    await loginAs(page);
  });

  const pages = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Vocab', path: '/vocab' },
    { name: 'Profile', path: '/profile' },
    { name: 'Catatan', path: '/catatan' },
    // Kept from the deleted tests/archive/ scripts: the level view is the entry
    // point of the whole curriculum and nothing else covered it.
    { name: 'Level A1', path: '/level/A1' },
  ];

  for (const { name, path } of pages) {
    test(`${name} page should render without errors`, async ({ page }) => {
      await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000);

      // Should not show error boundary
      const hasError = await page.locator('text=Something went wrong').isVisible().catch(() => false);
      expect(hasError).toBe(false);

      // Should not be blank
      const content = await page.textContent('body');
      expect(content!.length).toBeGreaterThan(50);

      // A protected route must not bounce an authenticated user back to sign-in.
      expect(page.url()).not.toContain('sign-in');
    });
  }

  test('Simulasi page should render', async ({ page }) => {
    await page.goto(`${BASE}/simulasi`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    const content = await page.textContent('body');
    expect(content!.length).toBeGreaterThan(50);

    const hasError = await page.locator('text=Something went wrong').isVisible().catch(() => false);
    expect(hasError).toBe(false);
  });

  test('Profile page belongs to the signed-in account', async ({ page }) => {
    await page.goto(`${BASE}/profile`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    // The address is rendered as text in one place and as an input value in
    // another, so look at both rather than pinning the check to today's layout.
    const bodyText = (await page.textContent('body')) ?? '';
    const inputValues = await page
      .locator('input')
      .evaluateAll((nodes) => nodes.map((n) => (n as HTMLInputElement).value).join(' '));

    expect(`${bodyText} ${inputValues}`).toContain(E2E_EMAIL);
  });
});
