import { test, expect } from '@playwright/test';

const BASE_URL = 'https://deutschup.sintec.my.id';
const EMAIL = 'yhudazzz0@gmail.com';
const PASSWORD = 'DeutschTest2025!Xy';

test('Password character test', async ({ page }) => {
  await page.goto(`${BASE_URL}/sign-in`);
  await page.waitForTimeout(5000);
  
  // Fill email
  await page.locator('input[name="identifier"]').fill(EMAIL);
  await page.locator('button:has-text("Continue")').click();
  await page.waitForTimeout(4000);
  
  // Type password character by character
  const pwInput = page.locator('input[name="password"], input[type="password"]').first();
  await pwInput.click();
  await page.waitForTimeout(500);
  
  // Clear and type
  await pwInput.fill('');
  await page.keyboard.type(PASSWORD, { delay: 100 });
  await page.waitForTimeout(500);
  
  // Verify what was typed
  const typed = await pwInput.inputValue();
  console.log('Typed password:', typed);
  console.log('Expected:', PASSWORD);
  console.log('Match:', typed === PASSWORD);
  
  await page.screenshot({ path: 'tests/screenshots/PW-01.png', fullPage: true });
  
  // Click Continue
  await page.locator('button:has-text("Continue")').click();
  await page.waitForTimeout(10000);
  
  console.log('Final URL:', page.url());
  await page.screenshot({ path: 'tests/screenshots/PW-02.png', fullPage: true });
  
  // Check for errors
  const errors = await page.locator('[class*="error"], [role="alert"]').allTextContents();
  console.log('Errors:', errors);
  
  // Check page content
  const html = await page.content();
  console.log('Has "incorrect":', html.includes('incorrect'));
  console.log('Has "error":', html.includes('error'));
  console.log('Has onboarding:', html.includes('Selamat Datang'));
});
