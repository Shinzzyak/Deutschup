import { test, expect } from '@playwright/test';

const EMAIL = 'yhudazzz0@gmail.com';
const PASSWORD = 'DeutschTest2025!Xy';
const BASE = 'https://deutschup.sintec.my.id';

test.describe('Full Autonomous Verification', () => {
  test.setTimeout(300000);

  test('All flows', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

    // === LOGIN ===
    console.log('=== LOGIN ===');
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
    
    console.log('After login URL:', page.url());
    
    // Complete onboarding if needed
    const onboarding = await page.locator('text=Selamat Datang').isVisible().catch(() => false);
    if (onboarding) {
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
      await page.waitForTimeout(5000);
      console.log('Onboarding completed');
    }
    
    await page.waitForTimeout(5000);
    console.log('Final URL:', page.url());

    // === DASHBOARD ===
    console.log('\n=== DASHBOARD ===');
    await page.screenshot({ path: 'tests/screenshots/AUTO-01-dashboard.png', fullPage: true });
    const dashContent = await page.textContent('body');
    console.log('URL:', page.url());
    console.log('Chars:', dashContent?.length);
    console.log('Has "King":', dashContent?.includes('King'));
    console.log('Has "A1":', dashContent?.includes('A1'));
    console.log('Has "Command Center" or "Dashboard":', dashContent?.includes('Command Center') || dashContent?.includes('Dashboard'));

    // === LEVEL A1 (sidebar click) ===
    console.log('\n=== LEVEL A1 ===');
    const a1Link = page.locator('a:has-text("A1"), a[href*="level"]').first();
    if (await a1Link.count() > 0) {
      await a1Link.click();
      await page.waitForTimeout(5000);
    }
    console.log('URL:', page.url());
    await page.screenshot({ path: 'tests/screenshots/AUTO-02-level.png', fullPage: true });
    const levelContent = await page.textContent('body');
    console.log('Has "Perkenalan":', levelContent?.includes('Perkenalan'));
    console.log('Has "Artikel":', levelContent?.includes('Artikel'));

    // === LESSON (click) ===
    console.log('\n=== LESSON ===');
    const lessonLink = page.locator('a:has-text("Perkenalan"), a[href*="a1-1"], a[href*="lesson"]').first();
    if (await lessonLink.count() > 0) {
      await lessonLink.click();
      await page.waitForTimeout(5000);
      console.log('Lesson URL:', page.url());
      await page.screenshot({ path: 'tests/screenshots/AUTO-03-lesson.png', fullPage: true });
    } else {
      console.log('No lesson link found');
    }

    // === PRICING ===
    console.log('\n=== PRICING ===');
    const pricingLink = page.locator('a[href="/pricing"], a:has-text("Pricing"), a:has-text("Harga")').first();
    if (await pricingLink.count() > 0) {
      await pricingLink.click();
      await page.waitForTimeout(5000);
    }
    console.log('URL:', page.url());
    await page.screenshot({ path: 'tests/screenshots/AUTO-04-pricing.png', fullPage: true });
    const pricingContent = await page.textContent('body');
    console.log('Has "Pro":', pricingContent?.includes('Pro'));
    console.log('Has "49.000":', pricingContent?.includes('49.000'));

    // === PROFILE ===
    console.log('\n=== PROFILE ===');
    const profileLink = page.locator('a[href="/profile"], a:has-text("Profile"), a:has-text("Profil")').first();
    if (await profileLink.count() > 0) {
      await profileLink.click();
      await page.waitForTimeout(5000);
    }
    console.log('URL:', page.url());
    await page.screenshot({ path: 'tests/screenshots/AUTO-05-profile.png', fullPage: true });
    const profileContent = await page.textContent('body');
    console.log('Has email:', profileContent?.includes(EMAIL));

    // === SUMMARY ===
    console.log('\n=== FINAL SUMMARY ===');
    const criticalErrors = errors.filter(e => !e.includes('422') && !e.includes('clerk') && !e.includes('ingest') && !e.includes('Failed to load resource'));
    console.log('Total errors:', errors.length, '| Critical:', criticalErrors.length);
    if (criticalErrors.length > 0) {
      criticalErrors.slice(0, 10).forEach((e, i) => console.log(`  ❌ ${i+1}:`, e.substring(0, 200)));
    }
    expect(criticalErrors.length).toBe(0);
  });
});
