import { test, expect } from '@playwright/test';

const BASE_URL = 'https://deutschup.sintec.my.id';
const EMAIL = 'yhudazzz0@gmail.com';
const PASSWORD = 'DeutschTest2025!Xy';

// Helper: Login and wait for onboarding/home
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

test.describe('FULL E2E — DeutschUp (Authenticated)', () => {

  test('Step 1: Login + Onboarding', async ({ page }) => {
    await login(page);
    await page.screenshot({ path: 'tests/screenshots/E2E-01-after-login.png', fullPage: true });
    console.log('After login URL:', page.url());

    // Check if on onboarding
    const html = await page.content();
    const isOnboarding = html.includes('Selamat Datang') || html.includes('Mulai');
    console.log('Is onboarding:', isOnboarding);

    if (isOnboarding) {
      // Click Mulai
      const mulaiBtn = page.locator('button:has-text("Mulai")').first();
      if (await mulaiBtn.count() > 0 && await mulaiBtn.isVisible()) {
        await mulaiBtn.click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'tests/screenshots/E2E-02-onboarding-2.png', fullPage: true });
        console.log('Step 2 URL:', page.url());
        console.log('Step 2 content:', (await page.content()).substring(0, 500));

        // Handle remaining onboarding steps
        for (let i = 3; i <= 6; i++) {
          // Try to select an option if available
          const options = page.locator('[role="radio"], [role="option"], [class*="option"], button[class*="choice"]');
          if (await options.count() > 0) {
            await options.first().click();
            await page.waitForTimeout(500);
          }

          // Try to click next/continue/skip
          const nextBtn = page.locator('button:has-text("Selanjutnya"), button:has-text("Next"), button:has-text("Lanjut"), button:has-text("Skip"), button:has-text("Lewati"), button:has-text("Continue"), button:has-text("Selesai"), button:has-text("Done")').first();
          if (await nextBtn.count() > 0 && await nextBtn.isVisible()) {
            await nextBtn.click();
            await page.waitForTimeout(2000);
            await page.screenshot({ path: `tests/screenshots/E2E-0${i}-onboarding-${i}.png`, fullPage: true });
            console.log(`Step ${i} URL:`, page.url());
          } else {
            console.log(`Step ${i}: No next button found, breaking`);
            break;
          }
        }
      }
    }

    // Final state after onboarding
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tests/screenshots/E2E-07-after-onboarding.png', fullPage: true });
    console.log('After onboarding URL:', page.url());
  });

  test('Step 2: Navigate to Dashboard', async ({ page }) => {
    await login(page);
    
    // Try to go past onboarding first
    const mulaiBtn = page.locator('button:has-text("Mulai")').first();
    if (await mulaiBtn.count() > 0 && await mulaiBtn.isVisible()) {
      await mulaiBtn.click();
      await page.waitForTimeout(3000);
      // Try to skip
      const skipBtn = page.locator('button:has-text("Skip"), button:has-text("Lewati"), button:has-text("Nanti")').first();
      if (await skipBtn.count() > 0) await skipBtn.click();
      await page.waitForTimeout(2000);
    }

    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'tests/screenshots/E2E-08-dashboard.png', fullPage: true });
    console.log('Dashboard URL:', page.url());

    const html = await page.content();
    const isLanding = html.includes('Belajar Bahasa Jerman Lebih Cepat');
    const hasDashboard = html.includes('Dashboard') || html.includes('Progress') || html.includes('Level') || html.includes('Statistik');
    console.log('Is landing:', isLanding);
    console.log('Has dashboard:', hasDashboard);
  });

  test('Step 3: Navigate to Lessons', async ({ page }) => {
    await login(page);
    
    const mulaiBtn = page.locator('button:has-text("Mulai")').first();
    if (await mulaiBtn.count() > 0 && await mulaiBtn.isVisible()) {
      await mulaiBtn.click();
      await page.waitForTimeout(3000);
      const skipBtn = page.locator('button:has-text("Skip"), button:has-text("Lewati"), button:has-text("Nanti")').first();
      if (await skipBtn.count() > 0) await skipBtn.click();
      await page.waitForTimeout(2000);
    }

    await page.goto(`${BASE_URL}/lessons`);
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'tests/screenshots/E2E-09-lessons.png', fullPage: true });
    console.log('Lessons URL:', page.url());

    const html = await page.content();
    const isLanding = html.includes('Belajar Bahasa Jerman Lebih Cepat');
    console.log('Is landing:', isLanding);

    // Try to click first lesson
    const lessonLink = page.locator('a[href*="lesson"]').first();
    if (await lessonLink.count() > 0 && await lessonLink.isVisible()) {
      await lessonLink.click();
      await page.waitForTimeout(4000);
      await page.screenshot({ path: 'tests/screenshots/E2E-10-lesson-detail.png', fullPage: true });
      console.log('Lesson detail URL:', page.url());
    }
  });

  test('Step 4: Take a Quiz', async ({ page }) => {
    await login(page);
    
    const mulaiBtn = page.locator('button:has-text("Mulai")').first();
    if (await mulaiBtn.count() > 0 && await mulaiBtn.isVisible()) {
      await mulaiBtn.click();
      await page.waitForTimeout(3000);
      const skipBtn = page.locator('button:has-text("Skip"), button:has-text("Lewati"), button:has-text("Nanti")').first();
      if (await skipBtn.count() > 0) await skipBtn.click();
      await page.waitForTimeout(2000);
    }

    await page.goto(`${BASE_URL}/quiz`);
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'tests/screenshots/E2E-11-quiz.png', fullPage: true });
    console.log('Quiz URL:', page.url());

    const html = await page.content();
    const isLanding = html.includes('Belajar Bahasa Jerman Lebih Cepat');
    const hasQuiz = html.includes('Quiz') || html.includes('Soal') || html.includes('Mulai');
    console.log('Is landing:', isLanding);
    console.log('Has quiz:', hasQuiz);
  });

  test('Step 5: Profile & Settings', async ({ page }) => {
    await login(page);
    
    const mulaiBtn = page.locator('button:has-text("Mulai")').first();
    if (await mulaiBtn.count() > 0 && await mulaiBtn.isVisible()) {
      await mulaiBtn.click();
      await page.waitForTimeout(3000);
      const skipBtn = page.locator('button:has-text("Skip"), button:has-text("Lewati"), button:has-text("Nanti")').first();
      if (await skipBtn.count() > 0) await skipBtn.click();
      await page.waitForTimeout(2000);
    }

    await page.goto(`${BASE_URL}/profile`);
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'tests/screenshots/E2E-12-profile.png', fullPage: true });
    console.log('Profile URL:', page.url());

    await page.goto(`${BASE_URL}/settings`);
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'tests/screenshots/E2E-13-settings.png', fullPage: true });
    console.log('Settings URL:', page.url());
  });

  test('Step 6: Admin Panel', async ({ page }) => {
    await login(page);
    
    const mulaiBtn = page.locator('button:has-text("Mulai")').first();
    if (await mulaiBtn.count() > 0 && await mulaiBtn.isVisible()) {
      await mulaiBtn.click();
      await page.waitForTimeout(3000);
      const skipBtn = page.locator('button:has-text("Skip"), button:has-text("Lewati"), button:has-text("Nanti")').first();
      if (await skipBtn.count() > 0) await skipBtn.click();
      await page.waitForTimeout(2000);
    }

    await page.goto(`${BASE_URL}/admin`);
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'tests/screenshots/E2E-14-admin.png', fullPage: true });
    console.log('Admin URL:', page.url());

    const html = await page.content();
    const isLanding = html.includes('Belajar Bahasa Jerman Lebih Cepat');
    const isAdmin = html.includes('Admin') || html.includes('Dashboard') || html.includes('User') || html.includes('Pengguna');
    console.log('Is landing:', isLanding);
    console.log('Has admin:', isAdmin);
  });

  test('Step 7: AI Chat', async ({ page }) => {
    await login(page);
    
    const mulaiBtn = page.locator('button:has-text("Mulai")').first();
    if (await mulaiBtn.count() > 0 && await mulaiBtn.isVisible()) {
      await mulaiBtn.click();
      await page.waitForTimeout(3000);
      const skipBtn = page.locator('button:has-text("Skip"), button:has-text("Lewati"), button:has-text("Nanti")').first();
      if (await skipBtn.count() > 0) await skipBtn.click();
      await page.waitForTimeout(2000);
    }

    // Try chat/AI tutor
    const chatLink = page.locator('a[href*="chat"], button:has-text("Chat"), button:has-text("Tanya")').first();
    if (await chatLink.count() > 0 && await chatLink.isVisible()) {
      await chatLink.click();
      await page.waitForTimeout(4000);
      await page.screenshot({ path: 'tests/screenshots/E2E-15-chat.png', fullPage: true });
      console.log('Chat URL:', page.url());
    }
  });

  test('Step 8: Bug Check — Console Errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => errors.push(err.message));

    await login(page);
    
    const pages = ['/', '/dashboard', '/lessons', '/quiz', '/profile', '/admin'];
    for (const p of pages) {
      await page.goto(`${BASE_URL}${p}`);
      await page.waitForTimeout(2000);
    }

    console.log('Total errors:', errors.length);
    if (errors.length > 0) {
      errors.forEach(e => console.log('  -', e));
    }
  });

  test('Step 9: Bug Check — Network Failures', async ({ page }) => {
    const failures: { url: string; status: number }[] = [];
    page.on('response', resp => {
      if (resp.status() >= 400) {
        failures.push({ url: resp.url(), status: resp.status() });
      }
    });

    await login(page);
    
    const pages = ['/', '/dashboard', '/lessons', '/quiz', '/profile', '/admin'];
    for (const p of pages) {
      await page.goto(`${BASE_URL}${p}`);
      await page.waitForTimeout(2000);
    }

    console.log('Failed requests:', failures.length);
    failures.forEach(f => console.log(`  ${f.status} ${f.url}`));
  });

  test('Step 10: Performance Check', async ({ page }) => {
    const pages = ['/', '/sign-in', '/dashboard', '/lessons', '/quiz', '/admin'];
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
