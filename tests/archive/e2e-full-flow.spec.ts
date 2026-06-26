import { test, expect } from '@playwright/test';

const BASE_URL = 'https://deutschup.sintec.my.id';
const EMAIL = 'yhudazzz0@gmail.com';
const PASSWORD = 'DeutschTest2025!Xy';

// Helper: Login and reach onboarding/home
async function login(page: any) {
  await page.goto(`${BASE_URL}/sign-in`);
  await page.waitForTimeout(5000);
  await page.locator('input[name="identifier"]').fill(EMAIL);
  await page.locator('button:has-text("Continue")').click();
  await page.waitForTimeout(3000);
  await page.locator('input[name="password"]').fill(PASSWORD);
  await page.locator('button:has-text("Continue")').click();
  await page.waitForTimeout(8000);
}

test.describe('FULL E2E — User + Admin Flow', () => {

  test('1. LOGIN: Email + Password', async ({ page }) => {
    await login(page);
    await page.screenshot({ path: 'tests/screenshots/FULL-01-login.png', fullPage: true });
    console.log('Login URL:', page.url());
    
    // Check if we're on onboarding or home
    const html = await page.content();
    const isOnboarding = html.includes('Selamat Datang') || html.includes('Mulai');
    const isHome = html.includes('Dashboard') || html.includes('Lesson');
    console.log('Is onboarding:', isOnboarding);
    console.log('Is home:', isHome);
  });

  test('2. ONBOARDING: Complete welcome flow', async ({ page }) => {
    await login(page);
    await page.screenshot({ path: 'tests/screenshots/FULL-02-onboarding-start.png', fullPage: true });

    // Click "Mulai" button
    const mulaiBtn = page.locator('button:has-text("Mulai"), button:has-text("Start")').first();
    if (await mulaiBtn.count() > 0 && await mulaiBtn.isVisible()) {
      await mulaiBtn.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'tests/screenshots/FULL-03-onboarding-step1.png', fullPage: true });
      console.log('Step 1 URL:', page.url());

      // Look for next/continue buttons in onboarding
      for (let step = 2; step <= 5; step++) {
        const nextBtn = page.locator('button:has-text("Selanjutnya"), button:has-text("Next"), button:has-text("Lanjut"), button:has-text("Continue")').first();
        if (await nextBtn.count() > 0 && await nextBtn.isVisible()) {
          // Try to select options if present
          const options = page.locator('[role="option"], [class*="option"], [class*="choice"]').first();
          if (await options.count() > 0) {
            await options.click();
            await page.waitForTimeout(500);
          }
          
          await nextBtn.click();
          await page.waitForTimeout(2000);
          await page.screenshot({ path: `tests/screenshots/FULL-0${step + 2}-onboarding-step${step}.png`, fullPage: true });
          console.log(`Step ${step} URL:`, page.url());
        } else {
          break;
        }
      }
    } else {
      console.log('No Mulai button found — might already be past onboarding');
    }
  });

  test('3. USER: Dashboard view', async ({ page }) => {
    await login(page);
    
    // Try to navigate to dashboard or home
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'tests/screenshots/FULL-08-dashboard.png', fullPage: true });
    console.log('Dashboard URL:', page.url());

    const html = await page.content();
    const isLanding = html.includes('Belajar Bahasa Jerman Lebih Cepat');
    const hasDashboard = html.includes('Dashboard') || html.includes('Progress') || html.includes('Level');
    console.log('Is landing:', isLanding);
    console.log('Has dashboard:', hasDashboard);
  });

  test('4. USER: Lessons page', async ({ page }) => {
    await login(page);
    
    await page.goto(`${BASE_URL}/lessons`);
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'tests/screenshots/FULL-09-lessons.png', fullPage: true });
    console.log('Lessons URL:', page.url());

    const html = await page.content();
    const isLanding = html.includes('Belajar Bahasa Jerman Lebih Cepat');
    const hasLessons = html.includes('A1') || html.includes('Lesson') || html.includes('Pelajaran') || html.includes('Unit');
    console.log('Is landing:', isLanding);
    console.log('Has lessons:', hasLessons);

    // Try to click on a lesson
    const lessonLink = page.locator('a[href*="lesson"], button:has-text("Mulai"), button:has-text("Start")').first();
    if (await lessonLink.count() > 0 && await lessonLink.isVisible()) {
      await lessonLink.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'tests/screenshots/FULL-10-lesson-detail.png', fullPage: true });
      console.log('Lesson detail URL:', page.url());
    }
  });

  test('5. USER: Quiz page', async ({ page }) => {
    await login(page);
    
    await page.goto(`${BASE_URL}/quiz`);
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'tests/screenshots/FULL-11-quiz.png', fullPage: true });
    console.log('Quiz URL:', page.url());

    const html = await page.content();
    const isLanding = html.includes('Belajar Bahasa Jerman Lebih Cepat');
    const hasQuiz = html.includes('Quiz') || html.includes('Soal') || html.includes('Test');
    console.log('Is landing:', isLanding);
    console.log('Has quiz:', hasQuiz);
  });

  test('6. USER: Profile page', async ({ page }) => {
    await login(page);
    
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'tests/screenshots/FULL-12-profile.png', fullPage: true });
    console.log('Profile URL:', page.url());

    const html = await page.content();
    const isLanding = html.includes('Belajar Bahasa Jerman Lebih Cepat');
    const hasProfile = html.includes('Profile') || html.includes('Profil') || html.includes('King');
    console.log('Is landing:', isLanding);
    console.log('Has profile:', hasProfile);
  });

  test('7. USER: AI Chat / Tutor', async ({ page }) => {
    await login(page);
    
    // Try AI tutor
    await page.goto(`${BASE_URL}/chat`);
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'tests/screenshots/FULL-13-chat.png', fullPage: true });
    console.log('Chat URL:', page.url());

    // Try sending a message
    const chatInput = page.locator('textarea, input[type="text"], [contenteditable="true"]').first();
    if (await chatInput.count() > 0 && await chatInput.isVisible()) {
      await chatInput.fill('Halo, ich bin King!');
      await page.screenshot({ path: 'tests/screenshots/FULL-14-chat-message.png', fullPage: true });
      
      const sendBtn = page.locator('button:has-text("Send"), button:has-text("Kirim"), button[type="submit"]').first();
      if (await sendBtn.count() > 0) {
        await sendBtn.click();
        await page.waitForTimeout(5000);
        await page.screenshot({ path: 'tests/screenshots/FULL-15-chat-response.png', fullPage: true });
        console.log('Chat response received');
      }
    }
  });

  test('8. USER: Vocabulary / Words', async ({ page }) => {
    await login(page);
    
    await page.goto(`${BASE_URL}/vocabulary`);
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'tests/screenshots/FULL-16-vocabulary.png', fullPage: true });
    console.log('Vocabulary URL:', page.url());
  });

  test('9. USER: Progress / Stats', async ({ page }) => {
    await login(page);
    
    await page.goto(`${BASE_URL}/progress`);
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'tests/screenshots/FULL-17-progress.png', fullPage: true });
    console.log('Progress URL:', page.url());
  });

  test('10. USER: Settings', async ({ page }) => {
    await login(page);
    
    await page.goto(`${BASE_URL}/settings`);
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'tests/screenshots/FULL-18-settings.png', fullPage: true });
    console.log('Settings URL:', page.url());
  });

  test('11. ADMIN: Admin panel access', async ({ page }) => {
    await login(page);
    
    await page.goto(`${BASE_URL}/admin`);
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'tests/screenshots/FULL-19-admin.png', fullPage: true });
    console.log('Admin URL:', page.url());

    const html = await page.content();
    const isLanding = html.includes('Belajar Bahasa Jerman Lebih Cepat');
    const isAdmin = html.includes('Admin') || html.includes('Dashboard') || html.includes('User Management') || html.includes('Pengguna');
    console.log('Is landing:', isLanding);
    console.log('Has admin content:', isAdmin);

    // Check for admin features
    const hasStats = html.includes('Statistik') || html.includes('Stats') || html.includes('Total');
    const hasUserList = html.includes('User') || html.includes('Pengguna') || html.includes('Member');
    console.log('Has stats:', hasStats);
    console.log('Has user list:', hasUserList);
  });

  test('12. ADMIN: User management', async ({ page }) => {
    await login(page);
    
    await page.goto(`${BASE_URL}/admin/users`);
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'tests/screenshots/FULL-20-admin-users.png', fullPage: true });
    console.log('Admin users URL:', page.url());
  });

  test('13. ADMIN: Content management', async ({ page }) => {
    await login(page);
    
    await page.goto(`${BASE_URL}/admin/content`);
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'tests/screenshots/FULL-21-admin-content.png', fullPage: true });
    console.log('Admin content URL:', page.url());
  });

  test('14. NAVIGATION: All internal links', async ({ page }) => {
    await login(page);
    
    const links = [
      '/', '/dashboard', '/lessons', '/quiz', '/profile', 
      '/settings', '/admin', '/chat', '/vocabulary', '/progress'
    ];
    
    for (const link of links) {
      await page.goto(`${BASE_URL}${link}`);
      await page.waitForTimeout(2000);
      const url = page.url();
      const status = url.includes('sign-in') || url === BASE_URL + '/' ? 'REDIRECT' : 'OK';
      console.log(`${link} → ${url} [${status}]`);
    }
  });

  test('15. BUG CHECK: Console errors across all pages', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => errors.push(err.message));

    const pages = ['/', '/sign-in', '/dashboard', '/lessons', '/quiz', '/profile', '/admin'];
    
    for (const p of pages) {
      await page.goto(`${BASE_URL}${p}`);
      await page.waitForTimeout(3000);
    }

    console.log('Total console errors:', errors.length);
    if (errors.length > 0) {
      console.log('Errors:', errors.slice(0, 10));
    }
    
    // Filter critical errors
    const critical = errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('404') &&
      !e.includes('Clerk') &&
      !e.includes('analytics') &&
      !e.includes('cl-internal')
    );
    console.log('Critical errors:', critical.length);
  });

  test('16. BUG CHECK: Network failures', async ({ page }) => {
    const failures: { url: string; status: number }[] = [];
    page.on('response', resp => {
      if (resp.status() >= 400) {
        failures.push({ url: resp.url(), status: resp.status() });
      }
    });

    const pages = ['/', '/dashboard', '/lessons', '/quiz', '/profile', '/admin'];
    
    for (const p of pages) {
      await page.goto(`${BASE_URL}${p}`);
      await page.waitForTimeout(2000);
    }

    console.log('Failed requests:', failures.length);
    if (failures.length > 0) {
      failures.forEach(f => console.log(`  ${f.status} ${f.url}`));
    }
  });

  test('17. PERFORMANCE: Load times', async ({ page }) => {
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
    expect(avg).toBeLessThan(8000);
  });

  test('18. MOBILE: Responsive check', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tests/screenshots/FULL-22-mobile-landing.png', fullPage: true });

    // Check if hamburger menu exists
    const hamburger = page.locator('[class*="hamburger"], [class*="menu"], button[aria-label*="menu"]').first();
    console.log('Mobile menu exists:', await hamburger.count() > 0);

    await page.goto(`${BASE_URL}/sign-in`);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tests/screenshots/FULL-23-mobile-login.png', fullPage: true });
  });
});
