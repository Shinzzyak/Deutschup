import { test, expect } from '@playwright/test';

const EMAIL = 'yhudazzz0@gmail.com';
const PASSWORD = 'DeutschTest2025!Xy';

test('Payment Debug', async ({ page }) => {
  test.setTimeout(180000);

  // Listen for console messages
  page.on('console', msg => {
    console.log(`[${msg.type()}] ${msg.text()}`);
  });

  // Listen for network requests
  page.on('request', request => {
    if (request.url().includes('payment') || request.url().includes('bayar')) {
      console.log(`[REQUEST] ${request.method()} ${request.url()}`);
    }
  });

  page.on('response', response => {
    if (response.url().includes('payment') || response.url().includes('bayar')) {
      console.log(`[RESPONSE] ${response.status()} ${response.url()}`);
    }
  });

  // Login
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

  // Complete onboarding
  const isOnOnboarding = await page.locator('text=Selamat Datang').isVisible().catch(() => false);
  if (isOnOnboarding) {
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

  // Navigate to pricing
  console.log('\n=== PRICING ===');
  await page.goto('https://deutschup.sintec.my.id/pricing', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(5000);

  // Click Pro button
  const proBtn = await page.locator('button:has-text("Pilih Pro")').first();
  if (await proBtn.isVisible().catch(() => false)) {
    console.log('\nClicking "Pilih Pro"...');
    await proBtn.click();
    await page.waitForTimeout(15000);
    console.log('\nURL after click:', page.url());
    await page.screenshot({ path: 'tests/screenshots/PAY-DEBUG.png' });
  }
});
