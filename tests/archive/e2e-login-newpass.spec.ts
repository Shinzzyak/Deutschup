import { test, expect } from '@playwright/test';

const EMAIL = 'yhudazzz0@gmail.com';
const PASSWORD = 'DeutschTest2025!Xy';

test('Login with new password', async ({ page }) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

  console.log('=== LOGIN TEST ===');
  await page.goto('https://deutschup.sintec.my.id/sign-in', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Fill email
  const emailInput = page.locator('input[name="identifier"]');
  await emailInput.waitFor({ state: 'visible', timeout: 15000 });
  await emailInput.click();
  await emailInput.fill(EMAIL);
  await page.waitForTimeout(500);
  
  await page.locator('button:has-text("Continue")').click();
  await page.waitForTimeout(3000);

  // Fill password
  const passwordInput = page.locator('input[name="password"]');
  await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
  await passwordInput.click();
  await page.keyboard.type(PASSWORD, { delay: 50 });
  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'tests/screenshots/NEWPASS-01-password-filled.png' });

  // Click Sign In
  await page.locator('button:has-text("Continue")').click();
  await page.waitForTimeout(10000);

  console.log('URL after login:', page.url());
  await page.screenshot({ path: 'tests/screenshots/NEWPASS-02-after-login.png' });

  // Check if logged in
  const dashContent = await page.locator('main, body').first().innerText().catch(() => '');
  console.log('Content length:', dashContent.length);
  console.log('Has user content:', dashContent.includes('King') || dashContent.includes('XP') || dashContent.includes('Level'));
  console.log('Is landing page:', dashContent.includes('Masuk') || dashContent.includes('Daftar Gratis'));

  // If on dashboard, test other pages
  if (page.url() === 'https://deutschup.sintec.my.id/') {
    console.log('\n=== TESTING OTHER PAGES ===');
    
    // Level A1
    await page.goto('https://deutschup.sintec.my.id/level/A1', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'tests/screenshots/NEWPASS-03-level-A1.png' });
    
    const levelContent = await page.locator('main, body').first().innerText().catch(() => '');
    console.log('Level A1 has lessons:', levelContent.includes('Lektion') || levelContent.includes('Pelajaran'));
    
    // Pricing
    await page.goto('https://deutschup.sintec.my.id/pricing', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'tests/screenshots/NEWPASS-04-pricing.png' });
    
    // Click Pro button
    const proBtn = await page.locator('button:has-text("Pilih Pro")').first();
    if (await proBtn.isVisible().catch(() => false)) {
      console.log('Clicking Pro button...');
      await proBtn.click();
      await page.waitForTimeout(5000);
      await page.screenshot({ path: 'tests/screenshots/NEWPASS-05-checkout.png' });
      console.log('Checkout URL:', page.url());
    }
  }

  console.log('\n=== SUMMARY ===');
  console.log('Console errors:', errors.length);
  errors.forEach((e, i) => console.log(`Error ${i+1}: ${e.substring(0, 200)}`));
});
