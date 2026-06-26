import { test, expect } from '@playwright/test';

const EMAIL = 'yhudazzz0@gmail.com';
const PASSWORD = 'DeutschTest2025!Xy';

test.describe('Full Diagnostic v2', () => {
  test('Login → Onboarding → Dashboard → All Routes', async ({ page }) => {
    test.setTimeout(120000);

    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    // Step 1: Login
    console.log('STEP 1: Login');
    await page.goto('https://deutschup.sintec.my.id/sign-in', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    const emailInput = page.locator('input[name="identifier"]');
    await emailInput.waitFor({ state: 'visible', timeout: 15000 });
    await emailInput.click();
    await emailInput.fill(EMAIL);
    await page.waitForTimeout(500);

    await page.locator('button:has-text("Continue")').click();
    await page.waitForTimeout(3000);

    const passwordInput = page.locator('input[name="password"]');
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
    await passwordInput.click();
    await page.keyboard.type(PASSWORD, { delay: 50 });
    await page.waitForTimeout(500);

    await page.locator('button:has-text("Continue")').click();
    await page.waitForTimeout(8000);
    console.log('URL after login:', page.url());
    await page.screenshot({ path: 'tests/screenshots/DIAG2-01-after-login.png' });

    // Step 2: Complete onboarding
    const isOnOnboarding = page.url().includes('onboarding') || await page.locator('text=Selamat Datang').isVisible().catch(() => false);
    console.log('Is on onboarding:', isOnOnboarding);

    if (isOnOnboarding) {
      console.log('STEP 2: Complete onboarding');
      
      // Click Mulai
      await page.locator('button:has-text("Mulai")').click({ timeout: 5000 });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'tests/screenshots/DIAG2-02-level.png' });

      // Select A1
      await page.locator('button:has-text("A1")').first().click({ timeout: 5000 });
      await page.waitForTimeout(1000);

      // Click Lanjut button (not the B2 level card which also says "Lanjut")
      await page.getByRole('button', { name: 'Lanjut', exact: true }).click({ timeout: 5000 });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'tests/screenshots/DIAG2-03-goal.png' });

      // Select Percakapan
      await page.locator('button:has-text("Percakapan")').click({ timeout: 5000 });
      await page.waitForTimeout(1000);

      // Click Selesai (goes to complete step)
      await page.locator('button:has-text("Selesai")').click({ timeout: 5000 });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'tests/screenshots/DIAG2-04-complete.png' });

      // Click Mulai Belajar Sekarang (final step)
      try {
        await page.locator('button:has-text("Mulai Belajar")').click({ timeout: 5000 });
      } catch {
        // If button not found, try the rocket button
        await page.locator('button:has-text("Mulai Belajar Sekarang")').click({ timeout: 5000 });
      }
      await page.waitForTimeout(5000);
      await page.screenshot({ path: 'tests/screenshots/DIAG2-05-after-onboard.png' });
      console.log('URL after onboarding:', page.url());
    } else {
      // Skip onboarding via localStorage
      console.log('Skipping onboarding via localStorage');
      await page.evaluate(() => {
        localStorage.setItem('deutschup_onboarding_complete', 'true');
        localStorage.setItem('deutschup_level', 'A1');
        localStorage.setItem('deutschup_goal', 'conversation');
      });
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(5000);
    }

    // Step 3: Dashboard check
    console.log('STEP 3: Dashboard');
    await page.goto('https://deutschup.sintec.my.id/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'tests/screenshots/DIAG2-06-dashboard.png' });
    console.log('Dashboard URL:', page.url());

    // Step 4: Test all routes
    console.log('STEP 4: Test routes');
    const routes = ['/', '/lessons', '/quiz', '/profile', '/pricing', '/admin', '/chat'];
    for (const route of routes) {
      await page.goto(`https://deutschup.sintec.my.id${route}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(2000);
      const name = route === '/' ? 'home' : route.slice(1);
      await page.screenshot({ path: `tests/screenshots/DIAG2-07-${name}.png` });
      const onSameRoute = page.url().includes(route === '/' ? 'deutschup.sintec.my.id/' : route);
      console.log(`${name}: ${onSameRoute ? '✅' : '❌ REDIRECT'} → ${page.url()}`);
    }

    // Console errors
    console.log('\n=== CONSOLE ERRORS ===');
    consoleErrors.forEach((err, i) => console.log(`${i + 1}. ${err.substring(0, 200)}`));
    console.log(`Total: ${consoleErrors.length}`);
  });
});
