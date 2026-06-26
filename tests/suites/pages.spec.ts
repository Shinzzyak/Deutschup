import { test, expect } from '@playwright/test';
import { BASE, loginAs } from '../helpers/auth';

test.describe('Page Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page);
  });

  const pages = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Vocab', path: '/vocab' },
    { name: 'Profile', path: '/profile' },
    { name: 'Catatan', path: '/catatan' },
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
});
