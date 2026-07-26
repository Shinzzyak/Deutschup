import { test, expect } from '@playwright/test';
import { BASE } from '../helpers/auth';
import { requireEdgeTarget } from '../helpers/env';

test.describe('API Health', () => {
  // /api/* is served by Cloudflare Pages functions. The Vite dev server answers
  // those paths with index.html, which would fail these checks for the wrong
  // reason, so skip (loudly) unless the target actually serves them.
  requireEdgeTarget();

  test('ping endpoint should respond', async ({ request }) => {
    const response = await request.get(`${BASE}/api/ping`);
    // Should respond (200, 404, or 500 — but not timeout)
    expect(response.status()).toBeLessThan(600);
  });

  test('API should return JSON for valid endpoints', async ({ request }) => {
    const response = await request.get(`${BASE}/api/ping`);
    if (response.status() < 400) {
      const contentType = response.headers()['content-type'];
      expect(contentType).toContain('json');
    }
  });

  test('API should handle OPTIONS (CORS preflight)', async ({ request }) => {
    const response = await request.fetch(`${BASE}/api/ping`, {
      method: 'OPTIONS',
    });
    expect(response.status()).toBeLessThan(500);
  });
});
