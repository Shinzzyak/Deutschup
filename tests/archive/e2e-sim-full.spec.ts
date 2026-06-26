import { test, expect } from '@playwright/test';

const EMAIL = 'yhudazzz0@gmail.com';
const PASSWORD = 'DeutschTest2025!Xy';

test('Full Simulation: Login → Dashboard → Lessons → Quiz → Pricing', async ({ page }) => {
  test.setTimeout(300000);
  const errors: string[] = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

  // LOGIN
  console.log('=== STEP 1: LOGIN ===');
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
  console.log('After login URL:', page.url());

  // ONBOARDING
  const isOnOnboarding = await page.locator('text=Selamat Datang').isVisible().catch(() => false);
  console.log('On onboarding:', isOnOnboarding);
  
  if (isOnOnboarding) {
    console.log('=== STEP 2: ONBOARDING ===');
    await page.locator('button:has-text("Mulai")').click({ timeout: 5000 });
    await page.waitForTimeout(2000);
    await page.locator('button:has-text("A1")').first().click({ timeout: 5000 });
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'Lanjut', exact: true }).click({ timeout: 5000 });
    await page.waitForTimeout(2000);
    await page.locator('button:has-text("Percakapan")').click({ timeout: 5000 });
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("Selesai")').click({ timeout: 5000 });
    await page.waitForTimeout(3000);
  }

  // DASHBOARD
  console.log('=== STEP 3: DASHBOARD ===');
  await page.goto('https://deutschup.sintec.my.id/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tests/screenshots/FULL-01-dashboard.png' });
  console.log('Dashboard URL:', page.url());

  // LEVEL A1
  console.log('=== STEP 4: LEVEL A1 ===');
  await page.goto('https://deutschup.sintec.my.id/level/A1', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tests/screenshots/FULL-02-level-A1.png' });
  console.log('Level A1 URL:', page.url());

  // Check if we see lessons
  const levelContent = await page.locator('main, body').first().innerText().catch(() => '');
  console.log('Has A1 content:', levelContent.includes('A1') || levelContent.includes('Lektion'));
  console.log('Content length:', levelContent.length);

  // FIRST LESSON
  console.log('=== STEP 5: FIRST LESSON ===');
  const lessonLinks = await page.locator('a[href*="/lesson/"]').all();
  console.log('Lesson links found:', lessonLinks.length);
  
  if (lessonLinks.length > 0) {
    await lessonLinks[0].click();
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'tests/screenshots/FULL-03-lesson.png' });
    console.log('Lesson URL:', page.url());

    // Look for quiz button
    const quizBtn = await page.locator('button:has-text("Mulai"), button:has-text("Quiz"), button:has-text("Ujian")').first();
    if (await quizBtn.isVisible().catch(() => false)) {
      console.log('Quiz button found!');
      await quizBtn.click();
      await page.waitForTimeout(5000);
      await page.screenshot({ path: 'tests/screenshots/FULL-04-quiz.png' });
    }
  }

  // VOCAB
  console.log('=== STEP 6: VOCAB ===');
  await page.goto('https://deutschup.sintec.my.id/vocab', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tests/screenshots/FULL-05-vocab.png' });

  // NOTES
  console.log('=== STEP 7: NOTES ===');
  await page.goto('https://deutschup.sintec.my.id/catatan', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tests/screenshots/FULL-06-catatan.png' });

  // PRICING
  console.log('=== STEP 8: PRICING ===');
  await page.goto('https://deutschup.sintec.my.id/pricing', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tests/screenshots/FULL-07-pricing.png' });

  // Try clicking Pro button
  const proBtn = await page.locator('button:has-text("Pilih Pro")').first();
  if (await proBtn.isVisible().catch(() => false)) {
    console.log('Pro button found - clicking...');
    await proBtn.click();
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'tests/screenshots/FULL-08-checkout.png' });
    console.log('After Pro click URL:', page.url());
  }

  // PROFILE
  console.log('=== STEP 9: PROFILE ===');
  await page.goto('https://deutschup.sintec.my.id/profile', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tests/screenshots/FULL-09-profile.png' });

  // SUMMARY
  console.log('\n=== SUMMARY ===');
  console.log('Total console errors:', errors.length);
  if (errors.length > 0) {
    errors.forEach((e, i) => console.log(`Error ${i+1}: ${e.substring(0, 200)}`));
  }
  
  expect(errors.length).toBe(0);
});
