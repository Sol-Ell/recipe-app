import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/tests',
  timeout: 60000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'npm start --prefix backend',
      port: 5000,
      reuseExistingServer: true,
      timeout: 30000,
    },
    {
      command: 'npm start --prefix frontend',
      port: 3000,
      reuseExistingServer: true,
      timeout: 120000,
    },
  ],
});
