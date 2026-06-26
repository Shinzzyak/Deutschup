import { test, expect } from '@playwright/test';

const BASE_URL = 'https://deutschup.sintec.my.id';
const TEST_EMAIL = 'e2etest@deutschup.test';
const TEST_PASSWORD = 'Z8vN3xK9mP2wQ7bL!';

test.describe('Full Auth Flow — Fixed', () => {

  test('1. Sign up via Clerk form', async ({ page }) => {
    await page.goto(`${BASE_URL}/sign-up`);
    await page.waitForTimeout(5000);

    // Dump all input elements to debug
    const inputs = await page.locator('input').all();
    console.log('Total inputs found:', inputs.length);
    for (const input of inputs) {
      const name = await input.getAttribute('name');
      const type = await input.getAttribute('type');
      const placeholder = await input.getAttribute('placeholder');
      console.log(`  Input: name=${name}, type=${type}, placeholder=${placeholder}`);
    }

    // Try to find and fill form
    const firstName = page.locator('input[name="firstName"]').first();
    const lastName = page.locator('input[name="lastName"]').first();
    const username = page.locator('input[name="username"]').first();
    const email = page.locator('input[name="email_address"], input[type="email"]').first();
    const password = page.locator('input[name="password"], input[type="password"]').first();

    console.log('firstName count:', await firstName.count());
    console.log('lastName count:', await lastName.count());
    console.log('username count:', await username.count());
    console.log('email count:', await email.count());
    console.log('password count:', await password.count());

    if (await firstName.count() > 0) await firstName.fill('E2E');
    if (await lastName.count() > 0) await lastName.fill('Test');
    if (await username.count() > 0) await username.fill('e2etest');
    if (await email.count() > 0) await email.fill(TEST_EMAIL);
    if (await password.count() > 0) await password.fill(TEST_PASSWORD);

    await page.screenshot({ path: 'tests/screenshots/FIXED-01-signup.png', fullPage: true });

    // Find submit button
    const submitBtn = page.locator('button[type="submit"]').first();
    console.log('Submit button count:', await submitBtn.count());
    if (await submitBtn.count() > 0) {
      const isVisible = await submitBtn.isVisible();
      console.log('Submit button visible:', isVisible);
      if (isVisible) {
        await submitBtn.click();
        await page.waitForTimeout(5000);
        await page.screenshot({ path: 'tests/screenshots/FIXED-02-signup-result.png', fullPage: true });
        console.log('After signup URL:', page.url());
      }
    }
  });

  test('2. Login via Clerk form', async ({ page }) => {
    await page.goto(`${BASE_URL}/sign-in`);
    await page.waitForTimeout(5000);

    // Find all inputs
    const inputs = await page.locator('input').all();
    console.log('Total inputs:', inputs.length);

    // Find email input
    const email = page.locator('input[name="email_address"], input[type="email"], input[placeholder*="email" i]').first();
    console.log('Email count:', await email.count());

    if (await email.count() > 0) {
      await email.fill(TEST_EMAIL);
      console.log('Filled email');

      await page.screenshot({ path: 'tests/screenshots/FIXED-03-login-email.png', fullPage: true });

      // Find and click Continue
      const buttons = await page.locator('button').all();
      console.log('Total buttons:', buttons.length);
      for (const btn of buttons) {
        const text = await btn.textContent();
        const type = await btn.getAttribute('type');
        const visible = await btn.isVisible();
        console.log(`  Button: text="${text?.trim()}", type=${type}, visible=${visible}`);
      }

      const continueBtn = page.locator('button[type="submit"]').first();
      if (await continueBtn.count() > 0 && await continueBtn.isVisible()) {
        await continueBtn.click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'tests/screenshots/FIXED-04-login-password.png', fullPage: true });

        // Enter password
        const password = page.locator('input[type="password"], input[name="password"]').first();
        if (await password.count() > 0) {
          await password.fill(TEST_PASSWORD);
          console.log('Filled password');

          const signInBtn = page.locator('button[type="submit"]').first();
          if (await signInBtn.count() > 0 && await signInBtn.isVisible()) {
            await signInBtn.click();
            await page.waitForTimeout(5000);
            await page.screenshot({ path: 'tests/screenshots/FIXED-05-login-result.png', fullPage: true });
            console.log('After login URL:', page.url());
          }
        }
      }
    }
  });

  test('3. Check auth state after login', async ({ page }) => {
    // Navigate to app and check if logged in
    await page.goto(BASE_URL);
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'tests/screenshots/FIXED-06-home-auth.png', fullPage: true });

    const html = await page.content();
    const hasLogout = html.includes('Logout') || html.includes('Sign out') || html.includes('Keluar');
    const hasMasuk = html.includes('Masuk');
    console.log('Has logout button:', hasLogout);
    console.log('Has Masuk link:', hasMasuk);
    console.log('URL:', page.url());
  });

  test('4. Lessons page', async ({ page }) => {
    await page.goto(`${BASE_URL}/lessons`);
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'tests/screenshots/FIXED-07-lessons.png', fullPage: true });
    console.log('URL:', page.url());
  });

  test('5. Admin page', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin`);
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'tests/screenshots/FIXED-08-admin.png', fullPage: true });
    console.log('URL:', page.url());

    const html = await page.content();
    const isAdmin = html.includes('Admin') || html.includes('Dashboard') || html.includes('User');
    console.log('Has admin content:', isAdmin);
  });
});
