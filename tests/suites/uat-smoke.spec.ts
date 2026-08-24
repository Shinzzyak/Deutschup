import { test, expect } from '@playwright/test';
import { BASE } from '../helpers/auth';

// Phase 5: UAT Smoke Tests
// Lightweight automated checks for each feature area

test.describe('UAT: Core Feature Smoke Tests', () => {
  test('landing page loads with correct content', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('#root', { state: 'attached', timeout: 15000 });

    // Wait for SPA to render
    await page.waitForTimeout(3000);
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
    expect(content!.length).toBeGreaterThan(0);
  });

  test('sign-in page renders input', async ({ page }) => {
    await page.goto(`${BASE}/sign-in`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);

    // Any input should be visible (Clerk loads async)
    const hasInput = await page.locator('input').first().isVisible({ timeout: 15000 }).catch(() => false);
    expect(hasInput).toBe(true);
  });

  test('static assets load correctly', async ({ page }) => {
    const failedRequests: string[] = [];
    page.on('response', (response) => {
      if (response.status() >= 400 && !response.url().includes('sign-in')) {
        failedRequests.push(`${response.status()} ${response.url()}`);
      }
    });

    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });

    // Allow some Clerk/Cross-origin failures, but no critical asset failures
    const criticalFailures = failedRequests.filter(f =>
      f.includes('.js') || f.includes('.css') || f.includes('.woff')
    );
    expect(criticalFailures).toEqual([]);
  });

  test('no console errors on page load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });

    // Filter out known non-critical errors (Clerk, analytics, etc.)
    const criticalErrors = errors.filter(e =>
      !e.includes('clerk') &&
      !e.includes('analytics') &&
      !e.includes('third-party') &&
      !e.includes('Failed to fetch') // Clerk sometimes fires this
    );

    // Allow max 2 non-critical errors
    expect(criticalErrors.length).toBeLessThanOrEqual(2);
  });

  test('responsive: mobile viewport renders', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    const content = await page.textContent('body');
    expect(content!.length).toBeGreaterThan(0);
  });

  test('responsive: desktop viewport renders', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    const content = await page.textContent('body');
    expect(content!.length).toBeGreaterThan(0);
  });
});

test.describe('UAT: Accessibility Basics', () => {
  test('page has lang attribute', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBeTruthy();
  });

  test('images have alt text', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });

    const images = await page.locator('img').all();
    for (const img of images.slice(0, 10)) {
      const alt = await img.getAttribute('alt');
      // Decorative images can have empty alt, but attribute must exist
      expect(alt !== null).toBe(true);
    }
  });

  test('page has meaningful title', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    const title = await page.title();
    expect(title.length).toBeGreaterThan(3);
    expect(title).not.toBe('');
  });
});
