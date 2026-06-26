import { test, expect } from '@playwright/test';
import { BASE } from '../helpers/auth';

test.describe('Landing Page', () => {
  test('should load without errors', async ({ page }) => {
    const response = await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(400);

    // Wait for React to render
    await page.waitForSelector('#root', { state: 'attached', timeout: 10000 });
    const content = await page.textContent('body');
    expect(content?.length).toBeGreaterThan(0);
  });

  test('should have SEO meta tags', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });

    const title = await page.title();
    expect(title).toContain('DeutschUp');

    const description = await page.getAttribute('meta[name="description"]', 'content');
    expect(description).toBeTruthy();
  });

  test('should have proper lang attribute', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });

    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBe('id');
  });

  test('should not crash on load', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });

    // Should not show error boundary
    const hasError = await page.locator('text=Something went wrong').isVisible().catch(() => false);
    expect(hasError).toBe(false);
  });
});
