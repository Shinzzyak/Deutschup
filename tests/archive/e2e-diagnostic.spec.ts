import { test, expect } from '@playwright/test';

const EMAIL = 'yhudazzz0@gmail.com';
const PASSWORD = 'DeutschTest2025!Xy';

test.describe('Full Diagnostic', () => {
  test('Login → Onboarding → Dashboard → All Routes', async ({ page }) => {
    test.setTimeout(120000);

    // Collect console errors
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    // Step 1: Go to login
    console.log('STEP 1: Navigate to login');
    await page.goto('https://deutschup.sintec.my.id/sign-in', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tests/screenshots/DIAG-01-login.png' });

    // Step 2: Login via Clerk
    console.log('STEP 2: Login via Clerk');
    const emailInput = page.locator('input[name="identifier"]');
    await emailInput.waitFor({ state: 'visible', timeout: 15000 });
    await emailInput.click();
    await emailInput.fill(EMAIL);
    await page.waitForTimeout(500);

    const continueBtn = page.locator('button:has-text("Continue")');
    await continueBtn.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tests/screenshots/DIAG-02-password.png' });

    const passwordInput = page.locator('input[name="password"]');
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
    await passwordInput.click();
    await page.keyboard.type(PASSWORD, { delay: 50 });
    await page.waitForTimeout(500);

    const signInBtn = page.locator('button:has-text("Continue")');
    await signInBtn.click();
    await page.waitForTimeout(8000);
    await page.screenshot({ path: 'tests/screenshots/DIAG-03-after-login.png' });
    console.log('URL after login:', page.url());

    // Step 3: Check onboarding state
    const isOnOnboarding = page.url().includes('onboarding') || await page.locator('text=Mulai').isVisible().catch(() => false);
    console.log('Is on onboarding:', isOnOnboarding);

    if (isOnOnboarding) {
      console.log('STEP 3: Complete onboarding');
      // Try clicking Mulai
      try {
        await page.locator('button:has-text("Mulai")').click({ timeout: 5000 });
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'tests/screenshots/DIAG-04-level.png' });

        // Select A1
        await page.locator('button:has-text("A1")').click({ timeout: 5000 });
        await page.waitForTimeout(1000);

        // Click Lanjut
        await page.locator('button:has-text("Lanjut")').click({ timeout: 5000 });
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'tests/screenshots/DIAG-05-goal.png' });

        // Select Percakapan
        await page.locator('button:has-text("Percakapan")').click({ timeout: 5000 });
        await page.waitForTimeout(1000);

        // Click Selesai
        await page.locator('button:has-text("Selesai")').click({ timeout: 5000 });
        await page.waitForTimeout(5000);
        await page.screenshot({ path: 'tests/screenshots/DIAG-06-after-onboarding.png' });
        console.log('URL after onboarding:', page.url());
      } catch (e) {
        console.log('Onboarding click failed, trying localStorage bypass');
        await page.evaluate(() => {
          localStorage.setItem('deutschup_onboarding_complete', 'true');
          localStorage.setItem('deutschup_level', 'A1');
          localStorage.setItem('deutschup_goal', 'conversation');
        });
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(5000);
        await page.screenshot({ path: 'tests/screenshots/DIAG-06b-localStorage-bypass.png' });
      }
    }

    // Step 4: Check dashboard
    console.log('STEP 4: Check dashboard');
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    // Try navigating to home
    if (!currentUrl.endsWith('deutschup.sintec.my.id/')) {
      await page.goto('https://deutschup.sintec.my.id/', { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(5000);
    }
    await page.screenshot({ path: 'tests/screenshots/DIAG-07-dashboard.png' });
    console.log('Final URL:', page.url());

    // Check for dashboard content
    const hasDashboard = await page.locator('[class*="dashboard"], [class*="Dashboard"], main').isVisible().catch(() => false);
    const hasProgress = await page.locator('text=XP, text=Progress, text=Level').first().isVisible().catch(() => false);
    console.log('Has Dashboard:', hasDashboard);
    console.log('Has Progress:', hasProgress);

    // Step 5: Test all routes
    console.log('STEP 5: Test all routes');
    const routes = [
      { path: '/', name: 'Home' },
      { path: '/lessons', name: 'Lessons' },
      { path: '/quiz', name: 'Quiz' },
      { path: '/profile', name: 'Profile' },
      { path: '/pricing', name: 'Pricing' },
      { path: '/admin', name: 'Admin' },
    ];

    for (const route of routes) {
      await page.goto(`https://deutschup.sintec.my.id${route.path}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(2000);
      const screenshotName = `DIAG-08-${route.name.toLowerCase()}.png`;
      await page.screenshot({ path: `tests/screenshots/${screenshotName}` });
      console.log(`${route.name}: ${page.url()} | Status: ${page.url().includes(route.path) ? 'OK' : 'REDIRECT'}`);
    }

    // Step 6: Console errors summary
    console.log('\n=== CONSOLE ERRORS ===');
    if (consoleErrors.length === 0) {
      console.log('No console errors!');
    } else {
      consoleErrors.forEach((err, i) => console.log(`${i + 1}. ${err.substring(0, 150)}`));
    }
    console.log(`Total console errors: ${consoleErrors.length}`);
  });
});
