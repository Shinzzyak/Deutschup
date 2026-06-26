import { test, expect } from '@playwright/test';

const BASE_URL = 'https://deutschup.sintec.my.id';
const TEST_EMAIL = 'e2etest@deutschup.test';
const TEST_PASSWORD = 'Z8vN3xK9mP2wQ7bL!';

test.describe('Full Auth Flow — Working', () => {

  test('1. Sign up new user', async ({ page }) => {
    await page.goto(`${BASE_URL}/sign-up`);
    await page.waitForTimeout(5000);

    // Fill form
    await page.locator('input[name="firstName"]').fill('E2E');
    await page.locator('input[name="lastName"]').fill('Test');
    await page.locator('input[name="username"]').fill('e2etest');
    await page.locator('input[name="emailAddress"]').fill(TEST_EMAIL);
    await page.locator('input[name="password"]').fill(TEST_PASSWORD);

    await page.screenshot({ path: 'tests/screenshots/WORK-01-signup.png', fullPage: true });

    // Click Continue
    await page.locator('button:has-text("Continue")').click();
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'tests/screenshots/WORK-02-signup-result.png', fullPage: true });

    // Check if Turnstile appeared
    const hasTurnstile = await page.locator('[class*="turnstile"], iframe[src*="turnstile"], [id*="cf-"]').count() > 0;
    console.log('Turnstile appeared:', hasTurnstile);
    console.log('URL after signup:', page.url());
  });

  test('2. Login with test user', async ({ page }) => {
    await page.goto(`${BASE_URL}/sign-in`);
    await page.waitForTimeout(5000);

    // Fill identifier (email or username)
    await page.locator('input[name="identifier"]').fill(TEST_EMAIL);
    console.log('Filled identifier');

    await page.screenshot({ path: 'tests/screenshots/WORK-03-login-identifier.png', fullPage: true });

    // Click Continue
    await page.locator('button:has-text("Continue")').click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tests/screenshots/WORK-04-login-password.png', fullPage: true });

    // Fill password
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    if (await passwordInput.count() > 0) {
      await passwordInput.fill(TEST_PASSWORD);
      console.log('Filled password');

      // Click Continue again
      await page.locator('button:has-text("Continue")').click();
      await page.waitForTimeout(5000);
      await page.screenshot({ path: 'tests/screenshots/WORK-05-login-result.png', fullPage: true });
      console.log('After login URL:', page.url());
    }
  });

  test('3. Verify auth state', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'tests/screenshots/WORK-06-home.png', fullPage: true });

    const html = await page.content();
    const hasLogout = html.includes('Logout') || html.includes('Sign out') || html.includes('Keluar');
    const hasMasuk = html.includes('Masuk');
    console.log('Has logout:', hasLogout);
    console.log('Has Masuk:', hasMasuk);
    console.log('URL:', page.url());
  });

  test('4. Lessons', async ({ page }) => {
    await page.goto(`${BASE_URL}/lessons`);
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'tests/screenshots/WORK-07-lessons.png', fullPage: true });
    console.log('URL:', page.url());
  });

  test('5. Dashboard', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'tests/screenshots/WORK-08-dashboard.png', fullPage: true });
    console.log('URL:', page.url());
  });

  test('6. Quiz', async ({ page }) => {
    await page.goto(`${BASE_URL}/quiz`);
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'tests/screenshots/WORK-09-quiz.png', fullPage: true });
    console.log('URL:', page.url());
  });

  test('7. Profile', async ({ page }) => {
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'tests/screenshots/WORK-10-profile.png', fullPage: true });
    console.log('URL:', page.url());
  });

  test('8. Admin', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin`);
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'tests/screenshots/WORK-11-admin.png', fullPage: true });
    console.log('URL:', page.url());

    const html = await page.content();
    const isAdmin = html.includes('Admin') || html.includes('Dashboard') || html.includes('User');
    console.log('Has admin content:', isAdmin);
  });

  test('9. Logout', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(4000);

    // Try to find user menu
    const userBtn = page.locator('button:has-text("Avres"), [class*="avatar"], [class*="user-menu"]').first();
    if (await userBtn.count() > 0 && await userBtn.isVisible()) {
      await userBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'tests/screenshots/WORK-12-user-menu.png', fullPage: true });

      const logoutBtn = page.locator('button:has-text("Logout"), button:has-text("Sign out"), button:has-text("Keluar")').first();
      if (await logoutBtn.count() > 0) {
        await logoutBtn.click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'tests/screenshots/WORK-13-logout.png', fullPage: true });
        console.log('Logged out, URL:', page.url());
      }
    }
  });
});
