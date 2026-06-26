import { test } from '@playwright/test';
const EMAIL = 'yhudazzz0@gmail.com';
const PASSWORD = 'DeutschTest2025!Xy';
const BASE = 'https://deutschup.sintec.my.id';

test('Admin Screenshot', async ({ page }) => {
  test.setTimeout(120000);
  await page.goto(`${BASE}/sign-in`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);
  await page.locator('input[name="identifier"]').fill(EMAIL);
  await page.waitForTimeout(500);
  await page.locator('button:has-text("Continue")').click();
  await page.waitForTimeout(5000);
  await page.locator('input[name="password"]').click();
  await page.keyboard.type(PASSWORD, { delay: 50 });
  await page.waitForTimeout(1000);
  await page.locator('button:has-text("Continue")').click();
  await page.waitForTimeout(15000);
  // Admin page
  await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(10000);
  await page.screenshot({ path: 'tests/screenshots/NEW-admin-v2.png', fullPage: true });
  console.log('Admin screenshot saved');
  const content = await page.textContent('body');
  console.log('Has Admin Panel:', content?.includes('Admin Panel'));
  console.log('Has Total Users:', content?.includes('Total Users'));
  console.log('Has Pengguna:', content?.includes('Pengguna'));
});
