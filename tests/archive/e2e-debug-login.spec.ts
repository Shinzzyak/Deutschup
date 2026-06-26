import { test, expect } from '@playwright/test';

const BASE_URL = 'https://deutschup.sintec.my.id';
const TEST_EMAIL = 'e2etest@deutschup.test';
const TEST_PASSWORD = 'Z8vN3xK9mP2wQ7bL!';

test.describe('Login Flow Debug', () => {

  test('Debug: Login page structure', async ({ page }) => {
    await page.goto(`${BASE_URL}/sign-in`);
    await page.waitForTimeout(5000);

    // Dump entire page structure
    const html = await page.content();
    
    // Find all form elements
    const forms = await page.locator('form').all();
    console.log('Forms found:', forms.length);

    // Find all inputs
    const inputs = await page.locator('input').all();
    console.log('Inputs found:', inputs.length);
    for (const input of inputs) {
      const attrs = await input.evaluate(el => {
        return {
          name: el.getAttribute('name'),
          type: el.getAttribute('type'),
          placeholder: el.getAttribute('placeholder'),
          id: el.getAttribute('id'),
          className: el.className,
          visible: el.offsetParent !== null
        };
      });
      console.log('  Input:', JSON.stringify(attrs));
    }

    // Find all buttons
    const buttons = await page.locator('button').all();
    console.log('Buttons found:', buttons.length);
    for (const btn of buttons) {
      const attrs = await btn.evaluate(el => {
        return {
          text: el.textContent?.trim(),
          type: el.getAttribute('type'),
          className: el.className,
          visible: el.offsetParent !== null
        };
      });
      console.log('  Button:', JSON.stringify(attrs));
    }

    // Check for iframes
    const iframes = await page.locator('iframe').all();
    console.log('Iframes found:', iframes.length);
    for (const iframe of iframes) {
      const src = await iframe.getAttribute('src');
      console.log('  Iframe src:', src);
    }

    await page.screenshot({ path: 'tests/screenshots/DEBUG-login.png', fullPage: true });
  });

  test('Debug: Sign-up page structure', async ({ page }) => {
    await page.goto(`${BASE_URL}/sign-up`);
    await page.waitForTimeout(5000);

    const inputs = await page.locator('input').all();
    console.log('Sign-up inputs:', inputs.length);
    for (const input of inputs) {
      const attrs = await input.evaluate(el => ({
        name: el.getAttribute('name'),
        type: el.getAttribute('type'),
        placeholder: el.getAttribute('placeholder'),
        visible: el.offsetParent !== null
      }));
      console.log('  Input:', JSON.stringify(attrs));
    }

    // Check for Turnstile
    const turnstile = page.locator('[class*="turnstile"], [id*="turnstile"], iframe[src*="turnstile"]').first();
    const hasTurnstile = await turnstile.count() > 0;
    console.log('Turnstile CAPTCHA found:', hasTurnstile);

    await page.screenshot({ path: 'tests/screenshots/DEBUG-signup.png', fullPage: true });
  });
});
