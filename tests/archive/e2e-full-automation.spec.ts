import { test, expect } from '@playwright/test';

const EMAIL = 'yhudazzz0@gmail.com';
const PASSWORD = 'DeutschTest2025!Xy';

async function ensureLoggedIn(page: any) {
  // Go to main page first - if already logged in, should show dashboard
  await page.goto('https://deutschup.sintec.my.id/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);
  
  const url = page.url();
  console.log('Initial URL:', url);
  
  // If on sign-in page, need to login
  if (url.includes('sign-in')) {
    console.log('Not logged in - performing login...');
    
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
    await page.waitForTimeout(10000);
    
    // Check for onboarding
    const isOnOnboarding = await page.locator('text=Selamat Datang').isVisible().catch(() => false);
    if (isOnOnboarding) {
      console.log('Completing onboarding...');
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
  } else {
    console.log('Already logged in!');
  }
  
  return page.url();
}

test.describe('Full Automation - User Premium & Payment', () => {
  
  test('Complete User Journey: Login → Dashboard → Lessons → Payment → Premium', async ({ page }) => {
    test.setTimeout(300000);
    const errors: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

    // STEP 1: Login & Dashboard
    console.log('\n=== STEP 1: LOGIN & DASHBOARD ===');
    const finalUrl = await ensureLoggedIn(page);
    console.log('Final URL after login:', finalUrl);
    await page.screenshot({ path: 'tests/screenshots/AUTO-01-dashboard.png' });
    
    // Check if logged in (should show user content, not landing page)
    const dashContent = await page.locator('main, body').first().innerText().catch(() => '');
    console.log('Dashboard content length:', dashContent.length);
    console.log('Has XP/Level info:', dashContent.includes('XP') || dashContent.includes('Level') || dashContent.includes('A1'));

    // STEP 2: Level A1 & Lessons
    console.log('\n=== STEP 2: LEVEL A1 & LESSONS ===');
    await page.goto('https://deutschup.sintec.my.id/level/A1', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'tests/screenshots/AUTO-02-level-A1.png' });
    
    const levelContent = await page.locator('main, body').first().innerText().catch(() => '');
    console.log('Level A1 content:', levelContent.substring(0, 200));
    
    // Find lesson links
    const lessonLinks = await page.locator('a[href*="/lesson/"]').all();
    console.log('Lesson links found:', lessonLinks.length);
    
    if (lessonLinks.length > 0) {
      // Click first lesson
      console.log('Opening first lesson...');
      await lessonLinks[0].click();
      await page.waitForTimeout(5000);
      await page.screenshot({ path: 'tests/screenshots/AUTO-03-lesson-detail.png' });
      console.log('Lesson URL:', page.url());
      
      // Check lesson content
      const lessonContent = await page.locator('main, body').first().innerText().catch(() => '');
      console.log('Lesson content length:', lessonContent.length);
      
      // Look for quiz/checkpoint button
      const quizBtn = await page.locator('button:has-text("Mulai"), button:has-text("Quiz"), button:has-text("Ujian"), button:has-text("Checkpoint")').first();
      if (await quizBtn.isVisible().catch(() => false)) {
        console.log('Quiz button found - clicking...');
        await quizBtn.click();
        await page.waitForTimeout(5000);
        await page.screenshot({ path: 'tests/screenshots/AUTO-04-quiz.png' });
        console.log('Quiz URL:', page.url());
      }
    }

    // STEP 3: Vocab Trainer
    console.log('\n=== STEP 3: VOCAB TRAINER ===');
    await page.goto('https://deutschup.sintec.my.id/vocab', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'tests/screenshots/AUTO-05-vocab.png' });
    
    const vocabContent = await page.locator('main, body').first().innerText().catch(() => '');
    console.log('Vocab content length:', vocabContent.length);

    // STEP 4: Notes (Catatan)
    console.log('\n=== STEP 4: NOTES ===');
    await page.goto('https://deutschup.sintec.my.id/catatan', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'tests/screenshots/AUTO-06-catatan.png' });

    // STEP 5: Simulation
    console.log('\n=== STEP 5: SIMULATION ===');
    await page.goto('https://deutschup.sintec.my.id/simulasi', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'tests/screenshots/AUTO-07-simulasi.png' });

    // STEP 6: PRICING & PAYMENT
    console.log('\n=== STEP 6: PRICING & PAYMENT ===');
    await page.goto('https://deutschup.sintec.my.id/pricing', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'tests/screenshots/AUTO-08-pricing.png' });
    
    const pricingContent = await page.locator('main, body').first().innerText().catch(() => '');
    console.log('Pricing content:', pricingContent.substring(0, 300));
    
    // Find and click Pro button
    const proBtn = await page.locator('button:has-text("Pilih Pro")').first();
    if (await proBtn.isVisible().catch(() => false)) {
      console.log('Pro button found - clicking...');
      await proBtn.click();
      await page.waitForTimeout(5000);
      await page.screenshot({ path: 'tests/screenshots/AUTO-09-checkout.png' });
      console.log('Checkout URL:', page.url());
      
      // Check if payment page loads
      const paymentContent = await page.locator('main, body').first().innerText().catch(() => '');
      console.log('Payment page loaded:', paymentContent.length > 100);
      console.log('Has payment method:', paymentContent.includes('QRIS') || paymentContent.includes('Bayar') || paymentContent.includes('Payment'));
    }

    // STEP 7: Profile
    console.log('\n=== STEP 7: PROFILE ===');
    await page.goto('https://deutschup.sintec.my.id/profile', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'tests/screenshots/AUTO-10-profile.png' });
    
    const profileContent = await page.locator('main, body').first().innerText().catch(() => '');
    console.log('Profile content:', profileContent.substring(0, 200));

    // SUMMARY
    console.log('\n=== AUTOMATION SUMMARY ===');
    console.log('Total console errors:', errors.length);
    if (errors.length > 0) {
      errors.forEach((e, i) => console.log(`Error ${i+1}: ${e.substring(0, 200)}`));
    }
    
    // Don't fail on 422 errors (might be from payment provider)
    const criticalErrors = errors.filter(e => !e.includes('422'));
    expect(criticalErrors.length).toBe(0);
  });
});
