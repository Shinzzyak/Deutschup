import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/suites',
  timeout: 120000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: false, // Sequential for resource constraints
  retries: 0,
  workers: 1, // Single worker for 2GB VPS
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],
  use: {
    baseURL: 'https://deutschup.sintec.my.id',
    screenshot: 'on',
    video: 'off',
    trace: 'on-first-retry',
    headless: true,
    // Resource constraints on 2GB VPS
    launchOptions: {
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--disable-extensions',
      ],
    },
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        viewport: { width: 1280, height: 720 },
      },
    },
  ],
  outputDir: './tests/results',
});
