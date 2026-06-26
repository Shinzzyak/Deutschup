import { test, expect } from '@playwright/test';

const EMAIL = 'yhudazzz0@gmail.com';
const PASSWORD = 'DeutschTest2025!Xy';

test('Payment Fix Verification', async ({ page }) => {
  test.setTimeout(180000);
  const alerts: string[] = [];
  const errors: string[] = [];

  // Capture alerts
  page.on('dialog', async dialog => {
    alerts.push(dialog.message());
    await dialog.dismiss();
  });

  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  // Listen for payment API requests
  let paymentRequestMade = false;
  let paymentResponse: any = null;
  page.on('response', response => {
    if (response.url().includes('/api/payment')) {
      paymentRequestMade = true;
      response.json().then(data => { paymentResponse = data; }).catch(() => {});
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

  // Complete onboarding if needed
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

  // Test Payment
  console.log('\n=== PAYMENT TEST ===');
  await page.goto('https://deutschup.sintec.my.id/pricing', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(5000);

  // Click Pro button
  const proBtn = await page.locator('button:has-text("Pilih Pro")').first();
  if (await proBtn.isVisible().catch(() => false)) {
    console.log('Clicking "Pilih Pro"...');
    await proBtn.click();
    await page.waitForTimeout(15000);
    
    console.log('Payment request made:', paymentRequestMade);
    console.log('Payment response:', paymentResponse);
    console.log('Alerts:', alerts);
    console.log('URL after click:', page.url());
    await page.screenshot({ path: 'tests/screenshots/PAY-FIX-01.png' });

    // Check if redirected to bayar.gg
    if (page.url().includes('bayar.gg')) {
      console.log('SUCCESS: Redirected to bayar.gg!');
    } else if (paymentResponse?.url) {
      console.log('Payment URL:', paymentResponse.url);
    } else if (alerts.length > 0) {
      console.log('Alert messages:', alerts);
    }
  }

  console.log('\n=== SUMMARY ===');
  console.log('Console errors:', errors.length);
  errors.forEach((e, i) => console.log(`Error ${i+1}: ${e.substring(0, 200)}`));
});
