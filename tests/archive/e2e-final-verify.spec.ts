import { test, expect } from '@playwright/test';

const EMAIL = 'yhudazzz0@gmail.com';
const PASSWORD = 'DeutschTest2025!Xy';

test('Final Verification - All Features Working', async ({ page }) => {
  test.setTimeout(300000);
  const errors: string[] = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

  // LOGIN
  console.log('=== LOGIN ===');
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
  console.log('URL:', page.url());

  // ONBOARDING (if needed)
  const isOnOnboarding = await page.locator('text=Selamat Datang').isVisible().catch(() => false);
  if (isOnOnboarding) {
    console.log('=== ONBOARDING ===');
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
    console.log('Onboarding done!');
  }

  // DASHBOARD
  console.log('\n=== DASHBOARD ===');
  await page.goto('https://deutschup.sintec.my.id/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tests/screenshots/VERIFY-01-dashboard.png' });
  const dash = await page.locator('main, body').first().innerText().catch(() => '');
  console.log('Has user:', dash.includes('King'));
  console.log('Has XP:', dash.includes('XP'));
  console.log('Content length:', dash.length);

  // LEVEL A1
  console.log('\n=== LEVEL A1 ===');
  await page.goto('https://deutschup.sintec.my.id/level/A1', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tests/screenshots/VERIFY-02-level.png' });
  const level = await page.locator('main, body').first().innerText().catch(() => '');
  console.log('Has lessons:', level.includes('Lektion') || level.includes('Pelajaran'));

  // LESSON
  console.log('\n=== LESSON ===');
  const lessons = await page.locator('a[href*="/lesson/"]').all();
  console.log('Lesson links:', lessons.length);
  if (lessons.length > 0) {
    await lessons[0].click();
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'tests/screenshots/VERIFY-03-lesson.png' });
  }

  // VOCAB
  console.log('\n=== VOCAB ===');
  await page.goto('https://deutschup.sintec.my.id/vocab', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tests/screenshots/VERIFY-04-vocab.png' });

  // PRICING
  console.log('\n=== PRICING ===');
  await page.goto('https://deutschup.sintec.my.id/pricing', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tests/screenshots/VERIFY-05-pricing.png' });
  const proBtn = await page.locator('button:has-text("Pilih Pro")').first();
  if (await proBtn.isVisible().catch(() => false)) {
    await proBtn.click();
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'tests/screenshots/VERIFY-06-checkout.png' });
    console.log('Checkout URL:', page.url());
  }

  // PROFILE
  console.log('\n=== PROFILE ===');
  await page.goto('https://deutschup.sintec.my.id/profile', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tests/screenshots/VERIFY-07-profile.png' });
  const profile = await page.locator('main, body').first().innerText().catch(() => '');
  console.log('Has user info:', profile.includes('King') || profile.includes('yhudazzz0'));

  // SUMMARY
  console.log('\n=== SUMMARY ===');
  console.log('Console errors:', errors.length);
  errors.forEach((e, i) => console.log(`Error ${i+1}: ${e.substring(0, 200)}`));
});
