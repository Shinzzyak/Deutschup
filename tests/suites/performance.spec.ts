import { test, expect } from '@playwright/test';
import { BASE } from '../helpers/auth';
import { requireDeployedTarget } from '../helpers/env';

// Phase 6: Performance Tests
// Lightweight — no Lighthouse, just Playwright metrics
//
// These budgets describe the shipped bundle. A Vite dev server serves unbundled
// modules and recompiles on first hit, so running them locally measures the dev
// server, not the product — skipped there rather than failed.

test.describe('Performance: Page Load', () => {
  requireDeployedTarget();

  test('landing page loads under 3 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - start;

    console.log(`Landing page load: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(3000);
  });

  test('sign-in page loads under 3 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto(`${BASE}/sign-in`, { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - start;

    console.log(`Sign-in page load: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(3000);
  });

  test('SPA navigation is fast (client-side)', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });

    // Navigate to sign-in (client-side if SPA)
    const start = Date.now();
    await page.goto(`${BASE}/sign-in`, { waitUntil: 'domcontentloaded' });
    const navTime = Date.now() - start;

    console.log(`SPA navigation: ${navTime}ms`);
    expect(navTime).toBeLessThan(2000);
  });
});

test.describe('Performance: Resource Size', () => {
  requireDeployedTarget();

  test('total page weight under 5MB', async ({ page }) => {
    let totalBytes = 0;
    page.on('response', async (response) => {
      try {
        const body = await response.body();
        totalBytes += body.length;
      } catch {
        // Some responses can't be read (opaque, etc.)
      }
    });

    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });

    const totalMB = totalBytes / 1024 / 1024;
    console.log(`Total page weight: ${totalMB.toFixed(2)} MB`);
    expect(totalMB).toBeLessThan(5);
  });

  test('no single asset exceeds 2MB', async ({ page }) => {
    const largeAssets: { url: string; size: number }[] = [];

    page.on('response', async (response) => {
      try {
        const body = await response.body();
        if (body.length > 2 * 1024 * 1024) {
          largeAssets.push({
            url: response.url().split('?')[0].slice(-80),
            size: body.length,
          });
        }
      } catch {}
    });

    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });

    if (largeAssets.length > 0) {
      console.log('Large assets:', largeAssets);
    }
    expect(largeAssets.length).toBe(0);
  });
});

test.describe('Performance: Network Efficiency', () => {
  requireDeployedTarget();

  test('minimal 404 requests', async ({ page }) => {
    const notFound: string[] = [];
    page.on('response', (response) => {
      if (response.status() === 404) {
        notFound.push(response.url().split('?')[0].slice(-60));
      }
    });

    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });

    if (notFound.length > 0) {
      console.log('404 requests:', notFound);
    }
    // Allow max 2 non-critical 404s (favicon, etc.)
    expect(notFound.length).toBeLessThanOrEqual(2);
  });

  test('minimal redirect chains', async ({ page }) => {
    let redirectCount = 0;
    page.on('response', (response) => {
      if (response.status() >= 300 && response.status() < 400) {
        redirectCount++;
      }
    });

    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });

    console.log(`Redirects: ${redirectCount}`);
    expect(redirectCount).toBeLessThan(5);
  });
});
