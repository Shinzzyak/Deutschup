import { test, expect } from '@playwright/test';

const BASE_URL = 'https://deutschup.sintec.my.id';
const TEST_EMAIL = 'e2etest@deutschup.test';
const TEST_PASSWORD = 'Z8vN3xK9mP2wQ7bL!';

test.describe('Full Auth Flow — Clerk E2E', () => {

  test('1. Sign up new user via Clerk', async ({ page }) => {
    await page.goto(`${BASE_URL}/sign-up`);
    await page.waitForTimeout(4000);

    // Clerk renders in iframe — find it
    const clerkFrame = page.frameLocator('iframe').first();
    const frameExists = await clerkFrame.locator('body').count() > 0;
    console.log('Clerk iframe found:', frameExists);

    if (frameExists) {
      // Fill First name
      const firstName = clerkFrame.locator('input[name="firstName"], input[placeholder*="First"]').first();
      if (await firstName.count() > 0) {
        await firstName.fill('E2E');
        console.log('Filled firstName');
      }

      // Fill Last name
      const lastName = clerkFrame.locator('input[name="lastName"], input[placeholder*="Last"]').first();
      if (await lastName.count() > 0) {
        await lastName.fill('Test');
        console.log('Filled lastName');
      }

      // Fill Username
      const username = clerkFrame.locator('input[name="username"]').first();
      if (await username.count() > 0) {
        await username.fill('e2etest');
        console.log('Filled username');
      }

      // Fill Email
      const email = clerkFrame.locator('input[name="email_address"], input[type="email"]').first();
      if (await email.count() > 0) {
        await email.fill(TEST_EMAIL);
        console.log('Filled email');
      }

      // Fill Password
      const password = clerkFrame.locator('input[name="password"], input[type="password"]').first();
      if (await password.count() > 0) {
        await password.fill(TEST_PASSWORD);
        console.log('Filled password');
      }

      await page.screenshot({ path: 'tests/screenshots/AUTH-01-signup-filled.png', fullPage: true });

      // Click Continue button
      const continueBtn = clerkFrame.locator('button[type="submit"], button:has-text("Continue")').first();
      if (await continueBtn.count() > 0) {
        await continueBtn.click({ timeout: 5000 }).catch(e => console.log('Click failed:', e.message));
        await page.waitForTimeout(5000);
        await page.screenshot({ path: 'tests/screenshots/AUTH-02-signup-result.png', fullPage: true });
        console.log('Signup result URL:', page.url());
      }
    }
  });

  test('2. Login with test user', async ({ page }) => {
    await page.goto(`${BASE_URL}/sign-in`);
    await page.waitForTimeout(4000);

    // Find Clerk iframe
    const clerkFrame = page.frameLocator('iframe').first();
    const frameExists = await clerkFrame.locator('body').count() > 0;
    console.log('Clerk iframe found:', frameExists);

    if (frameExists) {
      // Fill email
      const email = clerkFrame.locator('input[name="email_address"], input[type="email"], input[placeholder*="email" i]').first();
      if (await email.count() > 0) {
        await email.fill(TEST_EMAIL);
        console.log('Filled email');

        await page.screenshot({ path: 'tests/screenshots/AUTH-03-login-email.png', fullPage: true });

        // Click Continue
        const continueBtn = clerkFrame.locator('button[type="submit"], button:has-text("Continue")').first();
        if (await continueBtn.count() > 0) {
          await continueBtn.click({ timeout: 5000 }).catch(e => console.log('Click failed:', e.message));
          await page.waitForTimeout(3000);
          await page.screenshot({ path: 'tests/screenshots/AUTH-04-login-password.png', fullPage: true });

          // Fill password
          const password = clerkFrame.locator('input[type="password"], input[name="password"]').first();
          if (await password.count() > 0) {
            await password.fill(TEST_PASSWORD);
            console.log('Filled password');

            // Click Continue again
            const signInBtn = clerkFrame.locator('button[type="submit"], button:has-text("Continue")').first();
            if (await signInBtn.count() > 0) {
              await signInBtn.click({ timeout: 5000 }).catch(e => console.log('Click failed:', e.message));
              await page.waitForTimeout(5000);
              await page.screenshot({ path: 'tests/screenshots/AUTH-05-login-result.png', fullPage: true });
              console.log('Login result URL:', page.url());
            }
          }
        }
      }
    }
  });

  test('3. Navigate lessons after login', async ({ page }) => {
    // This test assumes user is logged in from previous test
    await page.goto(`${BASE_URL}/lessons`);
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'tests/screenshots/AUTH-06-lessons.png', fullPage: true });
    console.log('Lessons URL:', page.url());

    const html = await page.content();
    // Check if we see actual lesson content or landing page
    const isLanding = html.includes('Belajar Bahasa Jerman Lebih Cepat');
    const isLessons = html.includes('A1') || html.includes('Lesson') || html.includes('Pelajaran');
    console.log('Is landing page:', isLanding);
    console.log('Has lesson content:', isLessons);
  });

  test('4. Navigate quiz after login', async ({ page }) => {
    await page.goto(`${BASE_URL}/quiz`);
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'tests/screenshots/AUTH-07-quiz.png', fullPage: true });
    console.log('Quiz URL:', page.url());
  });

  test('5. Navigate profile after login', async ({ page }) => {
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'tests/screenshots/AUTH-08-profile.png', fullPage: true });
    console.log('Profile URL:', page.url());
  });

  test('6. Navigate admin after login', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin`);
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'tests/screenshots/AUTH-09-admin.png', fullPage: true });
    console.log('Admin URL:', page.url());

    const html = await page.content();
    const isAdmin = html.includes('Admin') || html.includes('admin') || html.includes('Dashboard') || html.includes('User Management');
    console.log('Admin panel content:', isAdmin);
  });

  test('7. Logout', async ({ page }) => {
    // Try to find user menu and logout
    await page.goto(BASE_URL);
    await page.waitForTimeout(4000);

    // Look for user avatar/menu
    const userMenu = page.locator('[class*="avatar"], [class*="user-menu"], [data-testid*="user"]').first();
    if (await userMenu.count() > 0) {
      await userMenu.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'tests/screenshots/AUTH-10-user-menu.png', fullPage: true });

      const logoutBtn = page.locator('button:has-text("Logout"), button:has-text("Sign out"), button:has-text("Keluar")').first();
      if (await logoutBtn.count() > 0) {
        await logoutBtn.click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'tests/screenshots/AUTH-11-logout-result.png', fullPage: true });
        console.log('Logged out, URL:', page.url());
      }
    }
  });
});
