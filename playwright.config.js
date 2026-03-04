// @ts-check
const { defineConfig, devices } = require('@playwright/test');

const BASE_URL = process.env.ARROWS_URL || 'http://localhost:4200';
const SHARE_URL = process.env.SHARE_URL || 'http://localhost:3001';
const WS_URL = process.env.WS_URL || 'ws://localhost:3002';

module.exports = defineConfig({
  testMatch: ['playwright-tests.spec.js'],
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

module.exports.BASE_URL = BASE_URL;
module.exports.SHARE_URL = SHARE_URL;
module.exports.WS_URL = WS_URL;
