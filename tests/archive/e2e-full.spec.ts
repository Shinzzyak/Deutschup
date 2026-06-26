import { test, expect } from '@playwright/test';
const EMAIL = 'yhudazzz0@gmail.com';
const PASSWORD = 'DeutschTest2025!Xy';
const BASE = 'https://deutschup.sintec.my.id';

async function loginAndOnboard(page: any) {
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
  const ob = await page.locator('text=Selamat Datang').isVisible().catch(() => false);
  if (ob) {
    console.log('[ONBOARDING] Starting...');
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
    console.log('[ONBOARDING] Done');
  }
}

test.describe('Deutschup E2E', () => {
  test('1. Dashboard', async ({ page }) => {
    test.setTimeout(180000);
    await loginAndOnboard(page);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tests/screenshots/E2E-01-dashboard.png', fullPage: true });
    const content = await page.textContent('body');
    console.log('[DASHBOARD] URL:', page.url());
    console.log('[DASHBOARD] Has greeting:', content?.includes('Selamat'));
    expect(page.url()).toContain('/dashboard');
  });

  test('2. Level A1 + Lessons', async ({ page }) => {
    test.setTimeout(180000);
    await loginAndOnboard(page);
    await page.goto(`${BASE}/level/A1`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'tests/screenshots/E2E-02-level-A1.png', fullPage: true });
    const content = await page.textContent('body');
    console.log('[LEVEL] URL:', page.url());
    console.log('[LEVEL] Has lessons:', content?.includes('Perkenalan') || content?.includes('Pelajaran'));
  });

  test('3. Profile', async ({ page }) => {
    test.setTimeout(180000);
    await loginAndOnboard(page);
    await page.goto(`${BASE}/profile`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'tests/screenshots/E2E-03-profile.png', fullPage: true });
    const content = await page.textContent('body');
    console.log('[PROFILE] URL:', page.url());
    console.log('[PROFILE] Has profile:', content?.includes('Profil') || content?.includes('Informasi'));
  });

  test('4. Admin Panel', async ({ page }) => {
    test.setTimeout(180000);
    await loginAndOnboard(page);
    await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(10000);
    await page.screenshot({ path: 'tests/screenshots/E2E-04-admin.png', fullPage: true });
    const content = await page.textContent('body');
    console.log('[ADMIN] URL:', page.url());
    console.log('[ADMIN] Has admin:', content?.includes('Admin Panel') || content?.includes('Admin'));
    console.log('[ADMIN] Content preview:', content?.substring(0, 300));
  });

  test('5. Pricing', async ({ page }) => {
    test.setTimeout(180000);
    await loginAndOnboard(page);
    await page.goto(`${BASE}/pricing`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'tests/screenshots/E2E-05-pricing.png', fullPage: true });
    const content = await page.textContent('body');
    console.log('[PRICING] URL:', page.url());
    console.log('[PRICING] Has pricing:', content?.includes('Pro') || content?.includes('Langganan'));
  });
});
