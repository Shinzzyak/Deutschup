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
  const pwInput = page.locator('input[name="password"], input[type="password"]').first();
  await pwInput.fill('');
  await page.keyboard.type(PASSWORD, { delay: 50 });
  await page.locator('button:has-text("Continue")').click();
  await page.waitForTimeout(10000);
}

async function completeOnboarding(page: any) {
  // Check if on onboarding
  const html = await page.content();
  if (!html.includes('Selamat Datang')) {
    console.log('Not on onboarding, skipping');
    return;
  }

  console.log('=== ONBOARDING START ===');
  
  // Step 1: Welcome → Mulai
  const mulai = page.locator('button:has-text("Mulai")').first();
  if (await mulai.isVisible()) {
    await mulai.click();
    await page.waitForTimeout(2000);
    console.log('Step 1: Mulai clicked');
  }

  // Step 2: Level → A1 → Lanjut
  const a1 = page.locator('button:has-text("A1")').first();
  if (await a1.isVisible()) {
    await a1.click();
    await page.waitForTimeout(1000);
    console.log('Step 2: A1 selected');
    
    const lanjut = page.locator('button:has-text("Lanjut")').first();
    if (await lanjut.isVisible()) {
      await lanjut.click();
      await page.waitForTimeout(2000);
      console.log('Step 2: Lanjut clicked');
    }
  }

  // Step 3: Goal → Percakapan → Selesai
  const goal = page.locator('button:has-text("Percakapan")').first();
  if (await goal.isVisible()) {
    await goal.click();
    await page.waitForTimeout(1000);
    console.log('Step 3: Goal selected');
    
    const selesai = page.locator('button:has-text("Selesai")').first();
    if (await selesai.isVisible()) {
      await selesai.click();
      await page.waitForTimeout(3000);
      console.log('=== ONBOARDING COMPLETE (Selesai clicked) ===');
    }
  }
}

test.describe('FULL E2E — DeutschUp', () => {

  test('1. Login + Onboarding', async ({ page }) => {
    await login(page);
    console.log('After login URL:', page.url());
    await page.screenshot({ path: 'tests/screenshots/REAL-01-login.png', fullPage: true });
    
    await completeOnboarding(page);
    console.log('After onboarding URL:', page.url());
    await page.screenshot({ path: 'tests/screenshots/REAL-02-onboarded.png', fullPage: true });
    
    // Check state
    const html = await page.content();
    const hasNav = html.includes('Dashboard') || html.includes('Lesson') || html.includes('Progress');
    console.log('Has nav content:', hasNav);
  });

  test('2. Dashboard', async ({ page }) => {
    await login(page);
    await completeOnboarding(page);
    
    await page.goto(`${BASE_URL}/`);
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'tests/screenshots/REAL-03-dashboard.png', fullPage: true });
    console.log('Dashboard URL:', page.url());
    
    const html = await page.content();
    console.log('Has Dashboard:', html.includes('Dashboard'));
    console.log('Has Progress:', html.includes('Progress'));
    console.log('Has Level:', html.includes('Level'));
  });

  test('3. Lessons', async ({ page }) => {
    await login(page);
    await completeOnboarding(page);
    
    // Find lessons on dashboard
    const lessonLink = page.locator('a[href*="lesson"], button:has-text("Mulai")').first();
    if (await lessonLink.isVisible()) {
      await lessonLink.click();
      await page.waitForTimeout(5000);
      await page.screenshot({ path: 'tests/screenshots/REAL-04-lesson.png', fullPage: true });
      console.log('Lesson URL:', page.url());
      
      // Try to interact with lesson content
      const html = await page.content();
      console.log('Has lesson content:', html.includes('Vokabular') || html.includes('Grammar') || html.includes('Quiz'));
    } else {
      console.log('No lesson link found');
    }
  });

  test('4. Quiz', async ({ page }) => {
    await login(page);
    await completeOnboarding(page);
    
    await page.goto(`${BASE_URL}/`);
    await page.waitForTimeout(5000);
    
    // Look for quiz
    const quizLink = page.locator('a[href*="quiz"], button:has-text("Quiz")').first();
    if (await quizLink.isVisible()) {
      await quizLink.click();
      await page.waitForTimeout(5000);
      await page.screenshot({ path: 'tests/screenshots/REAL-05-quiz.png', fullPage: true });
      console.log('Quiz URL:', page.url());
    } else {
      console.log('No quiz link found on dashboard');
    }
  });

  test('5. Profile', async ({ page }) => {
    await login(page);
    await completeOnboarding(page);
    
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'tests/screenshots/REAL-06-profile.png', fullPage: true });
    console.log('Profile URL:', page.url());
    
    const html = await page.content();
    console.log('Has profile:', html.includes('Profile') || html.includes('Profil'));
    console.log('Has user name:', html.includes('King') || html.includes('yhudazzz0'));
  });

  test('6. Admin Panel', async ({ page }) => {
    await login(page);
    await completeOnboarding(page);
    
    await page.goto(`${BASE_URL}/admin`);
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'tests/screenshots/REAL-07-admin.png', fullPage: true });
    console.log('Admin URL:', page.url());
    
    const html = await page.content();
    console.log('Has Admin:', html.includes('Admin'));
    console.log('Has Users:', html.includes('User') || html.includes('Pengguna'));
    console.log('Has Stats:', html.includes('Statistik') || html.includes('Stats'));
  });

  test('7. Navigation — All routes', async ({ page }) => {
    await login(page);
    await completeOnboarding(page);
    
    const routes = ['/', '/profile', '/admin'];
    for (const route of routes) {
      await page.goto(`${BASE_URL}${route}`);
      await page.waitForTimeout(3000);
      const url = page.url();
      console.log(`${route} → ${url}`);
    }
  });

  test('8. Bug Check — Console errors', async ({ page }) => {
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

  test('9. Performance', async ({ page }) => {
    const routes = ['/', '/sign-in', '/profile', '/admin'];
    const times: { route: string; ms: number }[] = [];
    
    for (const route of routes) {
      const start = Date.now();
      await page.goto(`${BASE_URL}${route}`);
      await page.waitForLoadState('networkidle');
      const ms = Date.now() - start;
      times.push({ route, ms });
      console.log(`${route}: ${ms}ms`);
    }
    
    const avg = times.reduce((a, b) => a + b.ms, 0) / times.length;
    console.log(`Average: ${avg.toFixed(0)}ms`);
  });

  test('10. Mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tests/screenshots/REAL-08-mobile.png', fullPage: true });
    
    const hamburger = page.locator('[class*="hamburger"], [class*="menu"], button[aria-label*="menu"]').first();
    console.log('Mobile menu:', await hamburger.count() > 0);
  });
});
