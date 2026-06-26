import { test, expect } from '@playwright/test';

const EMAIL = 'yhudazzz0@gmail.com';
const PASSWORD = 'DeutschTest2025!Xy';
const BASE = 'https://deutschup.sintec.my.id';

test('Admin Panel + Profile Redesign', async ({ page }) => {
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

  // PROFILE PAGE
  console.log('=== PROFILE ===');
  await page.locator('a[href="/profile"]').first().click();
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tests/screenshots/REDESIGN-profile.png', fullPage: true });
  const profileContent = await page.textContent('body');
  console.log('Profile URL:', page.url());
  console.log('Has "Profil":', profileContent?.includes('Profil'));
  console.log('Has email:', profileContent?.includes(EMAIL));
  console.log('Has "Informasi Dasar":', profileContent?.includes('Informasi Dasar'));
  console.log('Has "Keuntungan Member":', profileContent?.includes('Keuntungan Member'));

  // ADMIN PAGE
  console.log('\n=== ADMIN ===');
  await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(8000);
  await page.screenshot({ path: 'tests/screenshots/REDESIGN-admin.png', fullPage: true });
  const adminContent = await page.textContent('body');
  console.log('Admin URL:', page.url());
  console.log('Has "Admin Panel":', adminContent?.includes('Admin Panel'));
  console.log('Has "Total Users":', adminContent?.includes('Total Users'));
  console.log('Has "Pro Members":', adminContent?.includes('Pro Members'));
  console.log('Has "Status Layanan":', adminContent?.includes('Status Layanan'));
  console.log('Has "Pengguna":', adminContent?.includes('Pengguna'));
  console.log('Has "Konfigurasi Sistem":', adminContent?.includes('Konfigurasi'));

  // Errors
  const crit = errors.filter(e => !e.includes('422') && !e.includes('clerk') && !e.includes('ingest') && !e.includes('Failed to load resource'));
  console.log('\nErrors:', errors.length, '| Critical:', crit.length);
  if (crit.length > 0) crit.forEach((e, i) => console.log(`  ❌ ${i+1}:`, e.substring(0, 200)));
  expect(crit.length).toBe(0);
});
