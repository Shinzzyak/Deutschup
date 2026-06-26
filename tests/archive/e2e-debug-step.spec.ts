import { test, expect } from '@playwright/test';

const BASE_URL = 'https://deutschup.sintec.my.id';
const EMAIL = 'yhudazzz0@gmail.com';
const PASSWORD = 'DeutschTest2025!Xy';

test('Debug: Step-by-step login with screenshots', async ({ page }) => {
  // Step 1: Go to login
  await page.goto(`${BASE_URL}/sign-in`);
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tests/screenshots/DBG-01-signin.png', fullPage: true });
  console.log('Step 1: On sign-in page');

  // Step 2: Fill email
  const emailInput = page.locator('input[name="identifier"]');
  await emailInput.fill(EMAIL);
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'tests/screenshots/DBG-02-email-filled.png', fullPage: true });
  
  // Verify email was filled correctly
  const emailValue = await emailInput.inputValue();
  console.log('Step 2: Email filled:', emailValue);
  console.log('Email matches:', emailValue === EMAIL);

  // Step 3: Click Continue
  await page.locator('button:has-text("Continue")').click();
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'tests/screenshots/DBG-03-after-continue.png', fullPage: true });
  console.log('Step 3: After Continue click, URL:', page.url());

  // Step 4: Check for errors
  const errorMsg = page.locator('[class*="error"], [class*="alert"], [role="alert"]').first();
  if (await errorMsg.count() > 0) {
    const errorText = await errorMsg.textContent();
    console.log('Step 4: ERROR FOUND:', errorText);
  }

  // Step 5: Fill password
  const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
  if (await passwordInput.count() > 0) {
    await passwordInput.fill(PASSWORD);
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'tests/screenshots/DBG-04-password-filled.png', fullPage: true });
    console.log('Step 5: Password filled');
  } else {
    console.log('Step 5: NO PASSWORD INPUT FOUND');
    // Check page content
    const html = await page.content();
    console.log('Page has "factor-one":', html.includes('factor-one'));
    console.log('Page has "password":', html.includes('password'));
  }

  // Step 6: Click Continue again
  const continueBtn = page.locator('button:has-text("Continue")').first();
  if (await continueBtn.count() > 0 && await continueBtn.isVisible()) {
    await continueBtn.click();
    console.log('Step 6: Clicked Continue');
    
    // Wait for navigation
    await page.waitForTimeout(10000);
    await page.screenshot({ path: 'tests/screenshots/DBG-05-final.png', fullPage: true });
    console.log('Step 7: Final URL:', page.url());

    // Check final state
    const finalHtml = await page.content();
    const hasWelcome = finalHtml.includes('Selamat Datang');
    const hasDashboard = finalHtml.includes('Dashboard');
    const hasLanding = finalHtml.includes('Belajar Bahasa Jerman Lebih Cepat');
    const hasError = finalHtml.includes('error') || finalHtml.includes('incorrect');
    const hasMasuk = finalHtml.includes('Masuk');

    console.log('Has welcome:', hasWelcome);
    console.log('Has dashboard:', hasDashboard);
    console.log('Has landing:', hasLanding);
    console.log('Has error:', hasError);
    console.log('Has Masuk:', hasMasuk);

    // Check for any visible error messages
    const allErrors = await page.locator('[class*="error"], [class*="alert"], [role="alert"]').all();
    for (const err of allErrors) {
      const text = await err.textContent();
      if (text && text.trim().length > 0) {
        console.log('Visible error:', text.trim());
      }
    }
  } else {
    console.log('Step 6: No Continue button found');
  }
});
