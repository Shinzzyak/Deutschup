import { test } from '@playwright/test';
const EMAIL = 'yhudazzz0@gmail.com';
const PASSWORD = 'DeutschTest2025!Xy';
const BASE = 'https://deutschup.sintec.my.id';

test('Vocab Trainer', async ({ page }) => {
  test.setTimeout(180000);
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
  // Navigate to Vocab Trainer
  await page.goto(`${BASE}/vocab`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tests/screenshots/E2E-vocab-trainer.png', fullPage: true });
  const content = await page.textContent('body');
  console.log('URL:', page.url());
  // Check for vocab content
  console.log('Has flashcard:', content?.includes('flashcard') || content?.includes('Flashcard'));
  console.log('Has list view:', content?.includes('List') || content?.includes('Daftar'));
  console.log('Has word count:', content?.match(/\d+\s*(words?|kata|vocab)/i)?.[0]);
  console.log('Content preview:', content?.substring(0, 500));
});
