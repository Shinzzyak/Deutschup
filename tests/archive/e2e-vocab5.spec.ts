import { test } from '@playwright/test';
const EMAIL = 'yhudazzz0@gmail.com';
const PASSWORD = 'DeutschTest2025!Xy';
const BASE = 'https://deutschup.sintec.my.id';

test('Vocab Trainer', async ({ page }) => {
  test.setTimeout(120000);
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
  // Wait for dashboard
  await page.waitForTimeout(3000);
  console.log('After login URL:', page.url());
  // Navigate to vocab
  await page.goto(`${BASE}/vocab`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(8000);
  console.log('Vocab URL:', page.url());
  await page.screenshot({ path: 'tests/screenshots/E2E-vocab5.png', fullPage: true });
  const content = await page.textContent('body');
  console.log('Has Vocab:', content?.includes('Vocab'));
  console.log('Has flashcard:', content?.includes('flashcard') || content?.includes('Flashcard'));
  console.log('Preview:', content?.substring(0, 500));
});
