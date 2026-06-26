import { test, expect } from '@playwright/test';

const BASE_URL = 'https://deutschup.sintec.my.id';
const EMAIL = 'yhudazzz0@gmail.com';
const PASSWORD = 'DeutschTest2025!Xy';

test('Deep debug: Full login flow with Clerk JS', async ({ page }) => {
  // Enable console logging
  page.on('console', msg => {
    if (msg.text().includes('CLERK') || msg.text().includes('auth') || msg.text().includes('session')) {
      console.log('[BROWSER]', msg.text());
    }
  });

  // Step 1: Go to sign-in
  await page.goto(`${BASE_URL}/sign-in`);
  await page.waitForTimeout(5000);
  
  // Check Clerk is loaded
  const clerkLoaded = await page.evaluate(() => {
    return typeof (window as any).Clerk !== 'undefined';
  });
  console.log('Clerk loaded:', clerkLoaded);

  // Step 2: Fill email
  await page.locator('input[name="identifier"]').fill(EMAIL);
  await page.waitForTimeout(500);
  
  // Step 3: Click Continue
  await page.locator('button:has-text("Continue")').click();
  await page.waitForTimeout(4000);
  
  // Check current state
  const url1 = page.url();
  console.log('After email continue:', url1);
  await page.screenshot({ path: 'tests/screenshots/DEEP-01.png', fullPage: true });

  // Step 4: Fill password
  const pwInput = page.locator('input[name="password"], input[type="password"]').first();
  if (await pwInput.count() > 0) {
    await pwInput.fill(PASSWORD);
    console.log('Password filled');
    
    // Step 5: Click Continue
    await page.locator('button:has-text("Continue")').click();
    await page.waitForTimeout(10000);
    
    const url2 = page.url();
    console.log('After password continue:', url2);
    await page.screenshot({ path: 'tests/screenshots/DEEP-02.png', fullPage: true });
    
    // Check for errors
    const errors = await page.locator('[class*="error"], [role="alert"]').allTextContents();
    console.log('Errors:', errors);
    
    // Check if we're past auth
    const html = await page.content();
    console.log('Has onboarding:', html.includes('Selamat Datang'));
    console.log('Has landing:', html.includes('Belajar Bahasa Jerman Lebih Cepat'));
    console.log('Has dashboard:', html.includes('Dashboard') || html.includes('Progress'));
    
    // If on onboarding, try to complete it
    if (html.includes('Selamat Datang')) {
      console.log('=== ONBOARDING DETECTED ===');
      
      // Click Mulai
      const mulai = page.locator('button:has-text("Mulai")').first();
      if (await mulai.isVisible()) {
        await mulai.click();
        await page.waitForTimeout(2000);
        console.log('Clicked Mulai');
        await page.screenshot({ path: 'tests/screenshots/DEEP-03.png', fullPage: true });
        
        // Check level selection
        const a1 = page.locator('button:has-text("A1")').first();
        if (await a1.isVisible()) {
          await a1.click();
          await page.waitForTimeout(1000);
          console.log('Selected A1');
          
          const lanjut = page.locator('button:has-text("Lanjut")').first();
          if (await lanjut.isVisible()) {
            await lanjut.click();
            await page.waitForTimeout(2000);
            console.log('Clicked Lanjut');
            await page.screenshot({ path: 'tests/screenshots/DEEP-04.png', fullPage: true });
            
            // Goal selection
            const goal = page.locator('button:has-text("Percakapan")').first();
            if (await goal.isVisible()) {
              await goal.click();
              await page.waitForTimeout(1000);
              console.log('Selected goal');
              
              const selesai = page.locator('button:has-text("Selesai")').first();
              if (await selesai.isVisible()) {
                await selesai.click();
                await page.waitForTimeout(2000);
                console.log('Clicked Selesai');
                await page.screenshot({ path: 'tests/screenshots/DEEP-05.png', fullPage: true });
                
                // Complete
                const mulaiBelajar = page.locator('button:has-text("Mulai Belajar")').first();
                if (await mulaiBelajar.isVisible()) {
                  await mulaiBelajar.click();
                  await page.waitForTimeout(3000);
                  console.log('=== ONBOARDING COMPLETE ===');
                  console.log('Final URL:', page.url());
                  await page.screenshot({ path: 'tests/screenshots/DEEP-06.png', fullPage: true });
                }
              }
            }
          }
        }
      }
    }
  } else {
    console.log('No password input found');
    console.log('URL:', page.url());
    const html = await page.content();
    console.log('Page content (first 500):', html.substring(0, 500));
  }
});
