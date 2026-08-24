import { test, expect } from '@playwright/test';
import { BASE } from '../helpers/auth';

/**
 * Pricing is the only page where a wrong number costs money, and it is public,
 * so it can be checked without any account at all.
 *
 * Rescued from tests/archive/e2e-final-autonomous.spec.ts, which asserted the
 * same two facts ("Pro" and "49.000") but only reachable after logging into
 * production as an admin. Everything else in that file was screenshots.
 */
test.describe('Pricing (publik)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/pricing`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('#root', { state: 'attached', timeout: 15000 });
  });

  test('halaman pricing tampil tanpa error boundary', async ({ page }) => {
    const hasError = await page.locator('text=Something went wrong').isVisible().catch(() => false);
    expect(hasError).toBe(false);

    const content = await page.textContent('body');
    expect(content!.length).toBeGreaterThan(50);
  });

  test('menampilkan kedua paket: Free dan Pro', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Free', exact: true })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('heading', { name: 'Pro', exact: true })).toBeVisible({ timeout: 15000 });
  });

  test('harga Pro tetap Rp 49.000', async ({ page }) => {
    // Tolerant of the thousands separator and of spacing after "Rp", but not of
    // the amount itself — that is the product fact worth guarding.
    await expect(page.getByText(/49[.,]000/).first()).toBeVisible({ timeout: 15000 });
  });

  test('pengunjung anonim diarahkan ke sign-in untuk berlangganan', async ({ page }) => {
    await expect(page.locator('a[href="/sign-in"]').first()).toBeVisible({ timeout: 15000 });
  });
});
