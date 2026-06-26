import { test } from '@playwright/test';
const EMAIL = 'yhudazzz0@gmail.com';
const PASSWORD = 'DeutschTest2025!Xy';
const BASE = 'https://deutschup.sintec.my.id';

test('Admin retest', async ({ page }) => {
  test.setTimeout(180000);
  // Login
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
  // Onboarding
  const ob = await page.locator('text=Selamat Datang').isVisible().catch(() => false);
  if (ob) {
    await page.locator('button:has-text("Mulai")').click({ timeout: 5000 });
    await page.waitForTimeout(2000);
    await page.locator('button:has-text("A1")').first().click({ timeout: 5000 });
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'Lanjut', exact: true }).click({ timeout: 5000 });
    await page.waitForTimeout(2000);
    await page.locator('button:has-text("Percakapan")').click({ timeout: 5000 });
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("Selesai")').click({ timeout: 5000 });
    await page.waitForTimeout(5000);
  }
  // Admin
  await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(10000);
  await page.screenshot({ path: 'tests/screenshots/E2E-admin-v3.png', fullPage: true });
  const content = await page.textContent('body');
  console.log('URL:', page.url());
  console.log('Has Admin Panel:', content?.includes('Admin Panel'));
  console.log('Has Total Users:', content?.includes('Total Users'));
  console.log('Has Pengguna:', content?.includes('Pengguna'));
  console.log('Has Konfigurasi:', content?.includes('Konfigurasi'));
  console.log('Preview:', content?.substring(0, 500));
});
