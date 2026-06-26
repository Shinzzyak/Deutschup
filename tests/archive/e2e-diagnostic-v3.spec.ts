import { test, expect } from '@playwright/test';

const EMAIL = 'yhudazzz0@gmail.com';
const PASSWORD = 'DeutschTest2025!Xy';

test.describe('Full Diagnostic v3', () => {
  test('Login → Onboarding → Dashboard → All Routes', async ({ page }) => {
    test.setTimeout(180000);

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

    // Step 2: Complete onboarding
    const isOnOnboarding = await page.locator('text=Selamat Datang').isVisible().catch(() => false);
    console.log('Is on onboarding:', isOnOnboarding);

    if (isOnOnboarding) {
      console.log('STEP 2: Complete onboarding');
      
      await page.locator('button:has-text("Mulai")').click({ timeout: 5000 });
      await page.waitForTimeout(2000);

      await page.locator('button:has-text("A1")').first().click({ timeout: 5000 });
      await page.waitForTimeout(1000);

      await page.getByRole('button', { name: 'Lanjut', exact: true }).click({ timeout: 5000 });
      await page.waitForTimeout(2000);

      await page.locator('button:has-text("Percakapan")').click({ timeout: 5000 });
      await page.waitForTimeout(1000);

      await page.locator('button:has-text("Selesai")').click({ timeout: 5000 });
      await page.waitForTimeout(2000);

      try {
        await page.locator('button:has-text("Mulai Belajar")').click({ timeout: 5000 });
      } catch {
        // Already on dashboard
      }
      await page.waitForTimeout(5000);
      console.log('URL after onboarding:', page.url());
    }

    // Step 3: Dashboard check
    console.log('STEP 3: Dashboard');
    await page.goto('https://deutschup.sintec.my.id/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'tests/screenshots/DIAG3-01-dashboard.png' });

    // Check dashboard content
    const hasWelcome = await page.locator('text=Selamat').first().isVisible().catch(() => false);
    const hasXP = await page.locator('text=/\\d+ XP/').first().isVisible().catch(() => false);
    console.log('Dashboard - Welcome:', hasWelcome, 'XP:', hasXP);

    // Step 4: Test correct routes
    console.log('STEP 4: Test routes');
    const routes = [
      { path: '/', name: 'home' },
      { path: '/level/A1', name: 'level-a1' },
      { path: '/vocab', name: 'vocab' },
      { path: '/catatan', name: 'catatan' },
      { path: '/simulasi', name: 'simulasi' },
      { path: '/pricing', name: 'pricing' },
      { path: '/profile', name: 'profile' },
      { path: '/admin', name: 'admin' },
      { path: '/admin/ai', name: 'admin-ai' },
    ];

    for (const route of routes) {
      await page.goto(`https://deutschup.sintec.my.id${route.path}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `tests/screenshots/DIAG3-02-${route.name}.png` });
      
      const currentUrl = page.url();
      const isCorrectRoute = route.path === '/' 
        ? currentUrl === 'https://deutschup.sintec.my.id/' 
        : currentUrl.includes(route.path);
      console.log(`${route.name}: ${isCorrectRoute ? '✅' : '❌'} → ${currentUrl}`);
    }

    // Console errors
    console.log('\n=== CONSOLE ERRORS ===');
    if (consoleErrors.length === 0) {
      console.log('✅ No console errors!');
    } else {
      consoleErrors.forEach((err, i) => console.log(`${i + 1}. ${err.substring(0, 200)}`));
    }
    console.log(`Total: ${consoleErrors.length}`);
  });
});
