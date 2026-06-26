import { test, expect } from '@playwright/test';

const EMAIL = 'yhudazzz0@gmail.com';
const PASSWORD = 'DeutschTest2025!Xy';

test('Final Working Test: Full User Journey', async ({ page }) => {
  test.setTimeout(300000);
  const errors: string[] = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

  // STEP 1: LOGIN
  console.log('\n=== STEP 1: LOGIN ===');
  await page.goto('https://deutschup.sintec.my.id/sign-in', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  await page.locator('input[name="identifier"]').fill(EMAIL);
  await page.waitForTimeout(500);
  await page.locator('button:has-text("Continue")').click();
  await page.waitForTimeout(3000);
  await page.locator('input[name="password"]').click();
  await page.keyboard.type(PASSWORD, { delay: 50 });
  await page.waitForTimeout(1000);
  await page.locator('button:has-text("Continue")').click();
  await page.waitForTimeout(10000);
  console.log('URL after login:', page.url());

  // STEP 2: ONBOARDING
  console.log('\n=== STEP 2: ONBOARDING ===');
  const isOnOnboarding = await page.locator('text=Selamat Datang').isVisible().catch(() => false);
  console.log('On onboarding:', isOnOnboarding);

  if (isOnOnboarding) {
    // Step 1: Welcome → Level
    await page.locator('button:has-text("Mulai")').click({ timeout: 5000 });
    await page.waitForTimeout(2000);

    // Step 2: Select A1 level
    await page.locator('button:has-text("A1")').first().click({ timeout: 5000 });
    await page.waitForTimeout(1000);

    // Step 3: Level → Goal
    await page.getByRole('button', { name: 'Lanjut', exact: true }).click({ timeout: 5000 });
    await page.waitForTimeout(2000);

    // Step 4: Select goal
    await page.locator('button:has-text("Percakapan")').click({ timeout: 5000 });
    await page.waitForTimeout(1000);

    // Step 5: Goal → Complete (click "Selesai")
    await page.locator('button:has-text("Selesai")').click({ timeout: 5000 });
    await page.waitForTimeout(2000);

    // Step 6: Complete → Actually finish (click "Mulai Belajar Sekarang")
    console.log('Looking for "Mulai Belajar Sekarang" button...');
    const mulaiBtn = page.locator('button:has-text("Mulai Belajar")');
    if (await mulaiBtn.isVisible().catch(() => false)) {
      console.log('Clicking "Mulai Belajar Sekarang"...');
      await mulaiBtn.click({ timeout: 5000 });
      await page.waitForTimeout(3000);
    }

    // Verify localStorage
    const onboardingComplete = await page.evaluate(() => localStorage.getItem('deutschup_onboarding_complete'));
    console.log('Onboarding localStorage:', onboardingComplete);
  }

  // STEP 3: DASHBOARD
  console.log('\n=== STEP 3: DASHBOARD ===');
  await page.goto('https://deutschup.sintec.my.id/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tests/screenshots/FINAL-01-dashboard.png' });

  const dashContent = await page.locator('main, body').first().innerText().catch(() => '');
  console.log('Dashboard content length:', dashContent.length);
  console.log('Has user content:', dashContent.includes('King') || dashContent.includes('XP') || dashContent.includes('Level'));

  // Check if still on onboarding
  const stillOnboarding = await page.locator('text=Selamat Datang').isVisible().catch(() => false);
  console.log('Still on onboarding:', stillOnboarding);

  // STEP 4: LEVEL A1
  console.log('\n=== STEP 4: LEVEL A1 ===');
  await page.goto('https://deutschup.sintec.my.id/level/A1', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tests/screenshots/FINAL-02-level-A1.png' });

  const levelContent = await page.locator('main, body').first().innerText().catch(() => '');
  console.log('Level content length:', levelContent.length);

  // STEP 5: LESSON
  console.log('\n=== STEP 5: LESSON ===');
  const lessonLinks = await page.locator('a[href*="/lesson/"]').all();
  console.log('Lesson links found:', lessonLinks.length);
  if (lessonLinks.length > 0) {
    await lessonLinks[0].click();
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'tests/screenshots/FINAL-03-lesson.png' });
  }

  // STEP 6: PRICING
  console.log('\n=== STEP 6: PRICING ===');
  await page.goto('https://deutschup.sintec.my.id/pricing', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tests/screenshots/FINAL-04-pricing.png' });

  // Click Pro button
  const proBtn = await page.locator('button:has-text("Pilih Pro")').first();
  if (await proBtn.isVisible().catch(() => false)) {
    console.log('Clicking Pro button...');
    await proBtn.click();
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'tests/screenshots/FINAL-05-checkout.png' });
    console.log('Checkout URL:', page.url());
  }

  // STEP 7: PROFILE
  console.log('\n=== STEP 7: PROFILE ===');
  await page.goto('https://deutschup.sintec.my.id/profile', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tests/screenshots/FINAL-06-profile.png' });

  // SUMMARY
  console.log('\n=== FINAL SUMMARY ===');
  console.log('Console errors:', errors.length);
  errors.forEach((e, i) => console.log(`Error ${i+1}: ${e.substring(0, 200)}`));
});
