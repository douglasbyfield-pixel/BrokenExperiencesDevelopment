import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for stress testing the Broken Experiences platform
 */
export default defineConfig({
  testDir: './stress',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/stress-test-results.json' }],
    ['list']
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 30000,
    navigationTimeout: 30000,
  },

  projects: [
    // Setup project for authentication
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // Light stress testing - few concurrent users
    {
      name: 'light-stress',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
      testMatch: /.*\.light\.spec\.ts/,
    },

    // Medium stress testing - moderate concurrent users
    {
      name: 'medium-stress',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
      testMatch: /.*\.medium\.spec\.ts/,
    },

    // Heavy stress testing - many concurrent users
    {
      name: 'heavy-stress',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
      testMatch: /.*\.heavy\.spec\.ts/,
    },

    // Mobile stress testing
    {
      name: 'mobile-stress',
      use: { ...devices['Pixel 5'] },
      dependencies: ['setup'],
      testMatch: /.*\.mobile\.spec\.ts/,
    },

    // API stress testing
    {
      name: 'api-stress',
      dependencies: ['setup'],
      testMatch: /.*\.api\.spec\.ts/,
    },
  ],

  webServer: process.env.CI ? undefined : {
    command: 'cd ../apps/web && npm run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});