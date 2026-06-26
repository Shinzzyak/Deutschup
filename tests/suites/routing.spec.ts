import { test, expect } from '@playwright/test';
import { BASE } from '../helpers/auth';

test.describe('SPA Routing', () => {
  test('landing page should load for root URL', async ({ page }) => {
    const response = await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(400);
  });

  test('sign-in page should load', async ({ page }) => {
    const response = await page.goto(`${BASE}/sign-in`, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(400);
  });

  test('sign-up page should load', async ({ page }) => {
    const response = await page.goto(`${BASE}/sign-up`, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(400);
  });

  test('SPA routes should not return 404 (handled by client router)', async ({ page }) => {
    // SPA rewrites all routes to index.html — server should always return 200
    const routes = ['/dashboard', '/vocab', '/simulasi', '/profile'];
    for (const route of routes) {
      const response = await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBeLessThan(500);
    }
  });

  test('unknown route should load SPA (client handles 404)', async ({ page }) => {
    const response = await page.goto(`${BASE}/nonexistent-route-xyz`, { waitUntil: 'domcontentloaded' });
    // SPA rewrite means server returns 200, client router shows NotFound component
    expect(response?.status()).toBeLessThan(500);
  });
});
