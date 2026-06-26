import { test, expect } from '@playwright/test';

const BASE_URL = 'https://deutschup.sintec.my.id';
const EMAIL = 'yhudazzz0@gmail.com';
const PASSWORD = 'DeutschTest2025!Xy';

test.describe('Full Authenticated Flow — DeutschUp', () => {

  test('1. Login with provided credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/sign-in`);
    await page.waitForTimeout(5000);

    // Fill identifier (email)
    await page.locator('input[name="identifier"]').fill(EMAIL);
    console.log('Filled email');

    await page.screenshot({ path: 'tests/screenshots/AUTH-01-email.png', fullPage: true });

    // Click Continue
    await page.locator('button:has-text("Continue")').click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tests/screenshots/AUTH-02-password.png', fullPage: true });

    // Fill password
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    if (await passwordInput.count() > 0) {
      await passwordInput.fill(PASSWORD);
      console.log('Filled password');

      // Click Continue
      await page.locator('button:has-text("Continue")').click();
      await page.waitForTimeout(8000);
      await page.screenshot({ path: 'tests/screenshots/AUTH-03-result.png', fullPage: true });
      console.log('After login URL:', page.url());

      // Check if logged in
      const html = await page.content();
      const hasLogout = html.includes('Logout') || html.includes('Sign out') || html.includes('Keluar');
      console.log('Logged in:', hasLogout);
    }
  });

  test('2. Verify home page when logged in', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'tests/screenshots/AUTH-04-home.png', fullPage: true });

    const html = await page.content();
    const hasLogout = html.includes('Logout') || html.includes('Sign out') || html.includes('Keluar');
    const hasMasuk = html.includes('Masuk');
    console.log('Has logout:', hasLogout);
    console.log('Has Masuk:', hasMasuk);
    console.log('URL:', page.url());
  });

  test('3. Lessons page', async ({ page }) => {
    await page.goto(`${BASE_URL}/lessons`);
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'tests/screenshots/AUTH-05-lessons.png', fullPage: true });
    console.log('URL:', page.url());

    const html = await page.content();
    const isLanding = html.includes('Belajar Bahasa Jerman Lebih Cepat');
    const hasLessons = html.includes('A1') || html.includes('Lesson') || html.includes('Pelajaran');
    console.log('Is landing:', isLanding);
    console.log('Has lessons:', hasLessons);
  });

  test('4. Dashboard', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'tests/screenshots/AUTH-06-dashboard.png', fullPage: true });
    console.log('URL:', page.url());

    const html = await page.content();
    const isLanding = html.includes('Belajar Bahasa Jerman Lebih Cepat');
    console.log('Is landing:', isLanding);
  });

  test('5. Quiz', async ({ page }) => {
    await page.goto(`${BASE_URL}/quiz`);
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'tests/screenshots/AUTH-07-quiz.png', fullPage: true });
    console.log('URL:', page.url());
  });

  test('6. Profile', async ({ page }) => {
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'tests/screenshots/AUTH-08-profile.png', fullPage: true });
    console.log('URL:', page.url());
  });

  test('7. Admin', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin`);
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'tests/screenshots/AUTH-09-admin.png', fullPage: true });
    console.log('URL:', page.url());

    const html = await page.content();
    const isAdmin = html.includes('Admin') || html.includes('Dashboard') || html.includes('User');
    const isLanding = html.includes('Belajar Bahasa Jerman Lebih Cepat');
    console.log('Has admin content:', isAdmin);
    console.log('Is landing:', isLanding);
  });

  test('8. Settings', async ({ page }) => {
    await page.goto(`${BASE_URL}/settings`);
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'tests/screenshots/AUTH-10-settings.png', fullPage: true });
    console.log('URL:', page.url());
  });

  test('9. Logout', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(4000);

    // Look for user menu/avatar
    const userBtn = page.locator('button:has-text("King"), [class*="avatar"], [class*="user"]').first();
    if (await userBtn.count() > 0 && await userBtn.isVisible()) {
      await userBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'tests/screenshots/AUTH-11-user-menu.png', fullPage: true });

      const logoutBtn = page.locator('button:has-text("Logout"), button:has-text("Sign out"), button:has-text("Keluar")').first();
      if (await logoutBtn.count() > 0) {
        await logoutBtn.click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'tests/screenshots/AUTH-12-logged-out.png', fullPage: true });
        console.log('Logged out, URL:', page.url());
      }
    } else {
      console.log('No user menu found');
    }
  });
});
