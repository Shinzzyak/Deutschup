import { test, expect } from '@playwright/test';

const EMAIL = 'yhudazzz0@gmail.com';
const PASSWORD = 'DeutschTest2025!Xy';

test('Debug Login Flow', async ({ page }) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

  // Go to sign-in
  console.log('1. Going to sign-in page...');
  await page.goto('https://deutschup.sintec.my.id/sign-in', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  console.log('URL:', page.url());
  await page.screenshot({ path: 'tests/screenshots/DEBUG-01-signin.png' });

  // Wait for email input
  console.log('2. Looking for email input...');
  const emailInput = page.locator('input[name="identifier"]');
  const emailVisible = await emailInput.isVisible().catch(() => false);
  console.log('Email input visible:', emailVisible);

  if (emailVisible) {
    await emailInput.click();
    await emailInput.fill(EMAIL);
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'tests/screenshots/DEBUG-02-email-filled.png' });

    // Click Continue
    console.log('3. Clicking Continue...');
    await page.locator('button:has-text("Continue")').click();
    await page.waitForTimeout(3000);
    console.log('URL after Continue:', page.url());
    await page.screenshot({ path: 'tests/screenshots/DEBUG-03-after-continue.png' });

    // Wait for password input
    console.log('4. Looking for password input...');
    const passwordInput = page.locator('input[name="password"]');
    const passwordVisible = await passwordInput.isVisible().catch(() => false);
    console.log('Password input visible:', passwordVisible);

    if (passwordVisible) {
      await passwordInput.click();
      await page.waitForTimeout(500);
      
      // Type password slowly
      await page.keyboard.type(PASSWORD, { delay: 100 });
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'tests/screenshots/DEBUG-04-password-filled.png' });

      // Click Continue/Sign in
      console.log('5. Clicking Sign In...');
      await page.locator('button:has-text("Continue")').click();
      await page.waitForTimeout(10000);
      console.log('URL after Sign In:', page.url());
      await page.screenshot({ path: 'tests/screenshots/DEBUG-05-after-signin.png' });
    } else {
      console.log('Password input not found!');
      await page.screenshot({ path: 'tests/screenshots/DEBUG-04-no-password.png' });
    }
  } else {
    console.log('Email input not found!');
    await page.screenshot({ path: 'tests/screenshots/DEBUG-02-no-email.png' });
  }

  // Check final state
  console.log('\n=== FINAL STATE ===');
  console.log('Final URL:', page.url());
  console.log('Console errors:', errors.length);
  errors.forEach((e, i) => console.log(`Error ${i+1}: ${e.substring(0, 200)}`));
});
