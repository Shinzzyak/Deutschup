import { test, expect } from '@playwright/test';

const EMAIL = 'yhudazzz0@gmail.com';
const PASSWORD = 'DeutschTest2025!Xy';
const BASE = 'https://deutschup.sintec.my.id';

test('Full Autonomous Final', async ({ page }) => {
  test.setTimeout(300000);
  const errors: string[] = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

  // LOGIN
  await page.goto(`${BASE}/sign-in`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);
  await page.locator('input[name="identifier"]').fill(EMAIL);
  await page.waitForTimeout(500);
  await page.locator('button:has-text("Continue")').click();
  await page.waitForTimeout(5000);
  await page.locator('input[name="password"]').click();
  await page.keyboard.type(PASSWORD, { delay: 50 });
  await page.waitForTimeout(1000);
  await page.locator('button:has-text("Continue")').click();
  await page.waitForTimeout(15000);
  
  // Onboarding
  const onboarding = await page.locator('text=Selamat Datang').isVisible().catch(() => false);
  if (onboarding) {
    await page.locator('button:has-text("Mulai")').click({ timeout: 5000 });
    await page.waitForTimeout(2000);
    await page.locator('button:has-text("A1")').first().click({ timeout: 5000 });
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'Lanjut', exact: true }).click({ timeout: 5000 });
    await page.waitForTimeout(2000);
    await page.locator('button:has-text("Percakapan")').click({ timeout: 5000 });
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("Selesai")').click({ timeout: 5000 });
    await page.waitForTimeout(5000);
  }

  // 1. DASHBOARD
  console.log('1. DASHBOARD');
  const dash = await page.textContent('body');
  expect(dash).toContain('King');
  expect(dash).toContain('A1');
  await page.screenshot({ path: 'tests/screenshots/FINAL-01-dashboard.png', fullPage: true });

  // 2. LEVEL A1 (via sidebar)
  console.log('2. LEVEL A1');
  await page.locator('a[href="/level/A1"]').first().click();
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tests/screenshots/FINAL-02-level.png', fullPage: true });
  const level = await page.textContent('body');
  console.log('Level URL:', page.url());
  console.log('Level has Perkenalan:', level?.includes('Perkenalan'));
  console.log('Level has Artikel:', level?.includes('Artikel'));

  // 3. LESSON (click Perkenalan)
  console.log('3. LESSON');
  const lessonLink = page.locator('a:has-text("Perkenalan"), a[href*="a1-1"]').first();
  if (await lessonLink.count() > 0) {
    await lessonLink.click();
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'tests/screenshots/FINAL-03-lesson.png', fullPage: true });
    console.log('Lesson URL:', page.url());
  }

  // 4. PRICING
  console.log('4. PRICING');
  await page.locator('a[href="/pricing"]').first().click();
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tests/screenshots/FINAL-04-pricing.png', fullPage: true });
  const pricing = await page.textContent('body');
  expect(pricing).toContain('Pro');
  expect(pricing).toContain('49.000');

  // 5. PROFILE
  console.log('5. PROFILE');
  await page.locator('a[href="/profile"]').first().click();
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tests/screenshots/FINAL-05-profile.png', fullPage: true });
  const profile = await page.textContent('body');
  expect(profile).toContain(EMAIL);

  // SUMMARY
  const crit = errors.filter(e => !e.includes('422') && !e.includes('clerk') && !e.includes('ingest') && !e.includes('Failed to load resource'));
  console.log('Errors:', errors.length, '| Critical:', crit.length);
  expect(crit.length).toBe(0);
});
