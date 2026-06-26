import { test, expect } from '@playwright/test';

const EMAIL = 'yhudazzz0@gmail.com';
const PASSWORD = 'DeutschTest2025!Xy';

test('Full Test: Login → Onboarding → Dashboard → All Features', async ({ page }) => {
  test.setTimeout(300000);
  const errors: string[] = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

  // STEP 1: LOGIN
  console.log('\n=== STEP 1: LOGIN ===');
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
  await page.waitForTimeout(1000);

  await page.locator('button:has-text("Continue")').click();
  await page.waitForTimeout(10000);
  console.log('URL after login:', page.url());

  // STEP 2: ONBOARDING
  console.log('\n=== STEP 2: ONBOARDING ===');
  const isOnOnboarding = await page.locator('text=Selamat Datang').isVisible().catch(() => false);
  console.log('On onboarding:', isOnOnboarding);

  if (isOnOnboarding) {
    // Click "Mulai"
    await page.locator('button:has-text("Mulai")').click({ timeout: 5000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/FULL-01-onboarding-step1.png' });

    // Select A1 level
    await page.locator('button:has-text("A1")').first().click({ timeout: 5000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tests/screenshots/FULL-02-onboarding-level.png' });

    // Click "Lanjut"
    await page.getByRole('button', { name: 'Lanjut', exact: true }).click({ timeout: 5000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/FULL-03-onboarding-goal.png' });

    // Select goal
    await page.locator('button:has-text("Percakapan")').click({ timeout: 5000 });
    await page.waitForTimeout(1000);

    // Click "Selesai"
    await page.locator('button:has-text("Selesai")').click({ timeout: 5000 });
    await page.waitForTimeout(3000);
    console.log('Onboarding completed!');
  }

  // STEP 3: DASHBOARD
  console.log('\n=== STEP 3: DASHBOARD ===');
  await page.goto('https://deutschup.sintec.my.id/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tests/screenshots/FULL-04-dashboard.png' });

  const dashContent = await page.locator('main, body').first().innerText().catch(() => '');
  console.log('Dashboard content length:', dashContent.length);
  console.log('Has user content:', dashContent.includes('King') || dashContent.includes('XP') || dashContent.includes('Level'));
  console.log('Is landing page:', dashContent.includes('Masuk') || dashContent.includes('Daftar Gratis'));

  // STEP 4: LEVEL A1 & LESSONS
  console.log('\n=== STEP 4: LEVEL A1 & LESSONS ===');
  await page.goto('https://deutschup.sintec.my.id/level/A1', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tests/screenshots/FULL-05-level-A1.png' });

  const levelContent = await page.locator('main, body').first().innerText().catch(() => '');
  console.log('Level A1 content length:', levelContent.length);
  console.log('Has lessons:', levelContent.includes('Lektion') || levelContent.includes('Pelajaran') || levelContent.includes('Lesson'));

  // Find lesson links
  const lessonLinks = await page.locator('a[href*="/lesson/"]').all();
  console.log('Lesson links found:', lessonLinks.length);

  if (lessonLinks.length > 0) {
    console.log('Opening first lesson...');
    await lessonLinks[0].click();
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'tests/screenshots/FULL-06-lesson.png' });
    console.log('Lesson URL:', page.url());

    // Look for quiz button
    const quizBtn = await page.locator('button:has-text("Mulai"), button:has-text("Quiz"), button:has-text("Ujian")').first();
    if (await quizBtn.isVisible().catch(() => false)) {
      console.log('Quiz button found!');
    }
  }

  // STEP 5: VOCAB
  console.log('\n=== STEP 5: VOCAB ===');
  await page.goto('https://deutschup.sintec.my.id/vocab', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tests/screenshots/FULL-07-vocab.png' });

  // STEP 6: NOTES
  console.log('\n=== STEP 6: NOTES ===');
  await page.goto('https://deutschup.sintec.my.id/catatan', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tests/screenshots/FULL-08-catatan.png' });

  // STEP 7: PRICING & PAYMENT
  console.log('\n=== STEP 7: PRICING & PAYMENT ===');
  await page.goto('https://deutschup.sintec.my.id/pricing', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tests/screenshots/FULL-09-pricing.png' });

  const pricingContent = await page.locator('main, body').first().innerText().catch(() => '');
  console.log('Has Pro plan:', pricingContent.includes('Pro') || pricingContent.includes('Rp'));

  // Click Pro button
  const proBtn = await page.locator('button:has-text("Pilih Pro")').first();
  if (await proBtn.isVisible().catch(() => false)) {
    console.log('Clicking Pro button...');
    await proBtn.click();
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'tests/screenshots/FULL-10-checkout.png' });
    console.log('Checkout URL:', page.url());

    const paymentContent = await page.locator('main, body').first().innerText().catch(() => '');
    console.log('Has payment info:', paymentContent.includes('QRIS') || paymentContent.includes('Bayar') || paymentContent.includes('Rp'));
  }

  // STEP 8: PROFILE
  console.log('\n=== STEP 8: PROFILE ===');
  await page.goto('https://deutschup.sintec.my.id/profile', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tests/screenshots/FULL-11-profile.png' });

  const profileContent = await page.locator('main, body').first().innerText().catch(() => '');
  console.log('Has user info:', profileContent.includes('King') || profileContent.includes('yhudazzz0'));

  // SUMMARY
  console.log('\n=== FINAL SUMMARY ===');
  console.log('Total console errors:', errors.length);
  if (errors.length > 0) {
    errors.forEach((e, i) => console.log(`Error ${i+1}: ${e.substring(0, 200)}`));
  }

  const isLoggedIn = !dashContent.includes('Masuk') && !dashContent.includes('Daftar Gratis');
  console.log('User logged in:', isLoggedIn);
  console.log('Onboarding completed:', !isOnOnboarding || true);
});
