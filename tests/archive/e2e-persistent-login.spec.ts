import { test as base, expect, chromium } from '@playwright/test';

const EMAIL = 'yhudazzz0@gmail.com';
const PASSWORD = 'DeutschTest2025!Xy';

// Use persistent context to save Clerk session
const test = base.extend({
  context: async ({}, use) => {
    const browser = await chromium.launch();
    const context = await browser.newContext({
      storageState: undefined, // Don't use default storage state
    });
    await use(context);
    await context.close();
    await browser.close();
  },
});

test('Persistent Login - Full Automation', async ({ context }) => {
  test.setTimeout(300000);
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

  // STEP 1: LOGIN
  console.log('\n=== STEP 1: LOGIN ===');
  await page.goto('https://deutschup.sintec.my.id/sign-in', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  // Check if already on dashboard
  if (page.url() === 'https://deutschup.sintec.my.id/') {
    console.log('Already logged in!');
  } else {
    console.log('Logging in...');
    
    // Wait for email input
    const emailInput = page.locator('input[name="identifier"]');
    await emailInput.waitFor({ state: 'visible', timeout: 15000 });
    await emailInput.click();
    await emailInput.fill(EMAIL);
    await page.waitForTimeout(500);
    
    await page.locator('button:has-text("Continue")').click();
    await page.waitForTimeout(3000);
    
    // Wait for password input
    const passwordInput = page.locator('input[name="password"]');
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
    await passwordInput.click();
    await page.keyboard.type(PASSWORD, { delay: 50 });
    await page.waitForTimeout(1000);
    
    // Screenshot before clicking sign in
    await page.screenshot({ path: 'tests/screenshots/PERSIST-01-before-signin.png' });
    
    await page.locator('button:has-text("Continue")').click();
    await page.waitForTimeout(10000);
    
    console.log('URL after login:', page.url());
    await page.screenshot({ path: 'tests/screenshots/PERSIST-02-after-signin.png' });
    
    // Handle onboarding if needed
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
  }

  // STEP 2: VERIFY DASHBOARD
  console.log('\n=== STEP 2: VERIFY DASHBOARD ===');
  await page.goto('https://deutschup.sintec.my.id/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tests/screenshots/PERSIST-03-dashboard.png' });
  
  const dashContent = await page.locator('main, body').first().innerText().catch(() => '');
  console.log('Dashboard content length:', dashContent.length);
  console.log('Has user content:', dashContent.includes('King') || dashContent.includes('XP') || dashContent.includes('Level'));
  console.log('Is landing page:', dashContent.includes('Masuk') || dashContent.includes('Daftar Gratis'));

  // STEP 3: LEVEL A1 & LESSONS
  console.log('\n=== STEP 3: LEVEL A1 & LESSONS ===');
  await page.goto('https://deutschup.sintec.my.id/level/A1', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tests/screenshots/PERSIST-04-level-A1.png' });
  
  const levelContent = await page.locator('main, body').first().innerText().catch(() => '');
  console.log('Level A1 content:', levelContent.substring(0, 300));
  
  // Find lesson links
  const lessonLinks = await page.locator('a[href*="/lesson/"]').all();
  console.log('Lesson links found:', lessonLinks.length);
  
  if (lessonLinks.length > 0) {
    console.log('Opening first lesson...');
    await lessonLinks[0].click();
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'tests/screenshots/PERSIST-05-lesson.png' });
    console.log('Lesson URL:', page.url());
  }

  // STEP 4: PRICING & PAYMENT
  console.log('\n=== STEP 4: PRICING & PAYMENT ===');
  await page.goto('https://deutschup.sintec.my.id/pricing', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tests/screenshots/PERSIST-06-pricing.png' });
  
  const pricingContent = await page.locator('main, body').first().innerText().catch(() => '');
  console.log('Pricing content:', pricingContent.substring(0, 200));
  
  // Click Pro button
  const proBtn = await page.locator('button:has-text("Pilih Pro")').first();
  if (await proBtn.isVisible().catch(() => false)) {
    console.log('Clicking Pro button...');
    await proBtn.click();
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'tests/screenshots/PERSIST-07-checkout.png' });
    console.log('Checkout URL:', page.url());
    
    // Check payment page
    const paymentContent = await page.locator('main, body').first().innerText().catch(() => '');
    console.log('Payment page loaded:', paymentContent.length > 100);
    console.log('Has payment info:', paymentContent.includes('QRIS') || paymentContent.includes('Bayar') || paymentContent.includes('Rp'));
  }

  // STEP 5: PROFILE
  console.log('\n=== STEP 5: PROFILE ===');
  await page.goto('https://deutschup.sintec.my.id/profile', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tests/screenshots/PERSIST-08-profile.png' });
  
  const profileContent = await page.locator('main, body').first().innerText().catch(() => '');
  console.log('Profile content:', profileContent.substring(0, 200));

  // SUMMARY
  console.log('\n=== SUMMARY ===');
  console.log('Total console errors:', errors.length);
  if (errors.length > 0) {
    errors.forEach((e, i) => console.log(`Error ${i+1}: ${e.substring(0, 200)}`));
  }
  
  // Check if we're actually logged in
  const isActuallyLoggedIn = !dashContent.includes('Masuk') && !dashContent.includes('Daftar Gratis');
  console.log('Actually logged in:', isActuallyLoggedIn);
  
  if (!isActuallyLoggedIn) {
    console.log('⚠️ LOGIN FAILED - User is not authenticated!');
  }
});
