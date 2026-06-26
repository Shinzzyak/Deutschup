import { test, expect } from '@playwright/test';

const BASE_URL = 'https://deutschup.sintec.my.id';
const EMAIL = 'yhudazzz0@gmail.com';
const PASSWORD = 'DeutschTest2025!Xy';

async function login(page: any) {
  await page.goto(`${BASE_URL}/sign-in`);
  await page.waitForTimeout(5000);
  await page.locator('input[name="identifier"]').fill(EMAIL);
  await page.locator('button:has-text("Continue")').click();
  await page.waitForTimeout(4000);
  await page.locator('input[name="password"]').fill(PASSWORD);
  await page.locator('button:has-text("Continue")').click();
  await page.waitForTimeout(8000);
}

async function completeOnboarding(page: any) {
  // Step 1: Welcome → Click "Mulai"
  const mulaiBtn = page.locator('button:has-text("Mulai")').first();
  if (await mulaiBtn.isVisible()) {
    await mulaiBtn.click();
    await page.waitForTimeout(2000);
    console.log('Onboarding: Clicked Mulai');
  }

  // Step 2: Level selection → Click A1
  const a1Btn = page.locator('button:has-text("A1")').first();
  if (await a1Btn.isVisible()) {
    await a1Btn.click();
    await page.waitForTimeout(1000);
    console.log('Onboarding: Selected A1');
    
    // Click "Lanjut"
    const lanjutBtn = page.locator('button:has-text("Lanjut")').first();
    if (await lanjutBtn.isVisible()) {
      await lanjutBtn.click();
      await page.waitForTimeout(2000);
      console.log('Onboarding: Clicked Lanjut');
    }
  }

  // Step 3: Goal selection → Click first goal
  const goalBtn = page.locator('button:has-text("Persiapan Ujian"), button:has-text("Percakapan")').first();
  if (await goalBtn.isVisible()) {
    await goalBtn.click();
    await page.waitForTimeout(1000);
    console.log('Onboarding: Selected goal');
    
    // Click "Selesai"
    const selesaiBtn = page.locator('button:has-text("Selesai")').first();
    if (await selesaiBtn.isVisible()) {
      await selesaiBtn.click();
      await page.waitForTimeout(2000);
      console.log('Onboarding: Clicked Selesai');
    }
  }

  // Step 4: Complete → Click "Mulai Belajar Sekarang"
  const mulaiBelajarBtn = page.locator('button:has-text("Mulai Belajar Sekarang")').first();
  if (await mulaiBelajarBtn.isVisible()) {
    await mulaiBelajarBtn.click();
    await page.waitForTimeout(3000);
    console.log('Onboarding: Completed!');
  }
}

test.describe('FULL E2E — DeutschUp (Authenticated)', () => {

  test('1. Login + Complete Onboarding', async ({ page }) => {
    await login(page);
    await page.screenshot({ path: 'tests/screenshots/FINAL-01-login.png', fullPage: true });
    console.log('After login URL:', page.url());

    await completeOnboarding(page);
    await page.screenshot({ path: 'tests/screenshots/FINAL-02-after-onboarding.png', fullPage: true });
    console.log('After onboarding URL:', page.url());

    // Verify we're past onboarding
    const html = await page.content();
    const stillOnOnboarding = html.includes('Selamat Datang') && html.includes('Mulai') && !html.includes('Mulai Belajar');
    console.log('Still on onboarding:', stillOnOnboarding);
  });

  test('2. Dashboard', async ({ page }) => {
    await login(page);
    await completeOnboarding(page);

    await page.goto(`${BASE_URL}/`);
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'tests/screenshots/FINAL-03-dashboard.png', fullPage: true });
    console.log('Dashboard URL:', page.url());

    const html = await page.content();
    const isLanding = html.includes('Belajar Bahasa Jerman Lebih Cepat');
    console.log('Is landing:', isLanding);
  });

  test('3. Lessons', async ({ page }) => {
    await login(page);
    await completeOnboarding(page);

    await page.goto(`${BASE_URL}/`);
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'tests/screenshots/FINAL-04-lessons.png', fullPage: true });

    // Find and click a lesson
    const lessonLink = page.locator('a[href*="lesson"], button:has-text("Mulai")').first();
    if (await lessonLink.isVisible()) {
      await lessonLink.click();
      await page.waitForTimeout(5000);
      await page.screenshot({ path: 'tests/screenshots/FINAL-05-lesson-detail.png', fullPage: true });
      console.log('Lesson URL:', page.url());
    }
  });

  test('4. Quiz', async ({ page }) => {
    await login(page);
    await completeOnboarding(page);

    await page.goto(`${BASE_URL}/`);
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'tests/screenshots/FINAL-06-quiz.png', fullPage: true });
  });

  test('5. Profile', async ({ page }) => {
    await login(page);
    await completeOnboarding(page);

    await page.goto(`${BASE_URL}/profile`);
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'tests/screenshots/FINAL-07-profile.png', fullPage: true });
    console.log('Profile URL:', page.url());
  });

  test('6. Admin', async ({ page }) => {
    await login(page);
    await completeOnboarding(page);

    await page.goto(`${BASE_URL}/admin`);
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'tests/screenshots/FINAL-08-admin.png', fullPage: true });
    console.log('Admin URL:', page.url());

    const html = await page.content();
    const isAdmin = html.includes('Admin') || html.includes('User') || html.includes('Dashboard');
    console.log('Has admin:', isAdmin);
  });

  test('7. AI Chat', async ({ page }) => {
    await login(page);
    await completeOnboarding(page);

    // Try to find chat button
    const chatBtn = page.locator('button:has-text("Chat"), [class*="chat"]').first();
    if (await chatBtn.isVisible()) {
      await chatBtn.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'tests/screenshots/FINAL-09-chat.png', fullPage: true });
    }
  });

  test('8. Settings', async ({ page }) => {
    await login(page);
    await completeOnboarding(page);

    await page.goto(`${BASE_URL}/profile`);
    await page.waitForTimeout(5000);
    
    // Look for settings tab
    const settingsTab = page.locator('button:has-text("Settings"), button:has-text("Pengaturan")').first();
    if (await settingsTab.isVisible()) {
      await settingsTab.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'tests/screenshots/FINAL-10-settings.png', fullPage: true });
    }
  });

  test('9. Bug Check — Console Errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => errors.push(err.message));

    await login(page);
    await completeOnboarding(page);

    const pages = ['/', '/profile', '/admin'];
    for (const p of pages) {
      await page.goto(`${BASE_URL}${p}`);
      await page.waitForTimeout(3000);
    }

    console.log('Total errors:', errors.length);
    errors.forEach(e => console.log('  -', e.substring(0, 100)));
  });

  test('10. Performance', async ({ page }) => {
    const pages = ['/', '/sign-in', '/profile', '/admin'];
    const times: { page: string; ms: number }[] = [];

    for (const p of pages) {
      const start = Date.now();
      await page.goto(`${BASE_URL}${p}`);
      await page.waitForLoadState('networkidle');
      const ms = Date.now() - start;
      times.push({ page: p, ms });
      console.log(`${p}: ${ms}ms`);
    }

    const avg = times.reduce((a, b) => a + b.ms, 0) / times.length;
    console.log(`Average: ${avg.toFixed(0)}ms`);
  });
});
