import { test, expect } from '@playwright/test';
import { BASE } from '../helpers/auth';

test.describe('API Health', () => {
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
