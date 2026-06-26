import { test, expect } from '@playwright/test';

test('Admin Panel Test', async ({ page }) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

  // Login as admin
  console.log('=== LOGIN AS ADMIN ===');
  await page.goto('https://deutschup.sintec.my.id/sign-in', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.locator('input[name="identifier"]').fill('abdullahalmughiroh@gmail.com');
  await page.waitForTimeout(500);
  await page.locator('button:has-text("Continue")').click();
  await page.waitForTimeout(3000);
  await page.locator('input[name="password"]').click();
  await page.keyboard.type('AyamAyam1@', { delay: 50 });
  await page.waitForTimeout(1000);
  await page.locator('button:has-text("Continue")').click();
  await page.waitForTimeout(10000);
  console.log('URL after login:', page.url());

  // Check if onboarding needed
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

  // Navigate to admin page
  console.log('\n=== ADMIN PANEL ===');
  await page.goto('https://deutschup.sintec.my.id/admin', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tests/screenshots/ADMIN-01-panel.png' });

  const adminContent = await page.locator('main, body').first().innerText().catch(() => '');
  console.log('Admin content length:', adminContent.length);
  console.log('Has Admin Panel:', adminContent.includes('Admin Panel'));
  console.log('Has Akses Ditolak:', adminContent.includes('Akses Ditolak'));

  // Test payment
  console.log('\n=== PAYMENT TEST ===');
  await page.goto('https://deutschup.sintec.my.id/pricing', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(5000);
  
  const proBtn = await page.locator('button:has-text("Pilih Pro")').first();
  if (await proBtn.isVisible().catch(() => false)) {
    console.log('Clicking Pro button...');
    await proBtn.click();
    await page.waitForTimeout(8000);
    await page.screenshot({ path: 'tests/screenshots/PAYMENT-01-result.png' });
    console.log('URL after click:', page.url());
    
    const pageContent = await page.locator('main, body').first().innerText().catch(() => '');
    console.log('Has bayar.gg:', pageContent.includes('bayar') || pageContent.includes('QRIS'));
    console.log('Has sesi error:', pageContent.includes('sesi tidak valid'));
  }

  // Summary
  console.log('\n=== SUMMARY ===');
  console.log('Console errors:', errors.length);
  errors.forEach((e, i) => console.log(`Error ${i+1}: ${e.substring(0, 200)}`));
});
