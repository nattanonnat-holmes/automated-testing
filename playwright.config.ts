import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const isCI = process.env.CI === 'true' || process.env.CI === '1';

export default defineConfig({
  testDir: './tests',
  timeout: Number(process.env.DEFAULT_TIMEOUT) || 30_000,
  expect: {
    timeout: Number(process.env.EXPECT_TIMEOUT) || 5_000,
  },
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ...(isCI ? [['github'] as const] : []),
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://demo.playwright.dev',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: process.env.HEADLESS !== 'false',
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: /.*\/api\/.*/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'webkit',
      testIgnore: /.*\/api\/.*/,
      use: { ...devices['Desktop Safari'] },
    },
    ...(isCI || process.env.ENABLE_FIREFOX === 'true'
      ? [
          {
            name: 'firefox',
            testIgnore: /.*\/api\/.*/,
            use: { ...devices['Desktop Firefox'] },
          },
        ]
      : []),
    {
      name: 'Mobile Chrome',
      testIgnore: /.*\/api\/.*/,
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'Mobile Safari',
      testIgnore: /.*\/api\/.*/,
      use: { ...devices['iPhone 14'] },
    },
    {
      name: 'api',
      testMatch: /.*\/api\/.*\.spec\.ts/,
      use: {
        baseURL: process.env.API_BASE_URL || 'https://jsonplaceholder.typicode.com',
      },
    },
  ],
});
