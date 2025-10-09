import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Go to login page
  await page.goto('/login');
  
  // Fill in login form with test credentials
  await page.fill('input[type="email"]', process.env.TEST_EMAIL || 'test@example.com');
  await page.fill('input[type="password"]', process.env.TEST_PASSWORD || 'testpassword123');
  
  // Click sign in
  await page.click('button[type="submit"]');
  
  // Wait for navigation to dashboard
  await page.waitForURL('/home');
  
  // Verify we're logged in by checking for user menu or dashboard content
  await expect(page.locator('[data-testid="user-menu"]').or(page.locator('text=Dashboard'))).toBeVisible();
  
  // Save authentication state
  await page.context().storageState({ path: authFile });
});

// Helper function to create multiple authenticated users
export async function createAuthenticatedUsers(count: number) {
  const users = [];
  for (let i = 0; i < count; i++) {
    users.push({
      email: process.env[`TEST_EMAIL_${i + 1}`] || `testuser${i + 1}@example.com`,
      password: process.env[`TEST_PASSWORD_${i + 1}`] || `testpassword${i + 1}`,
      storageState: `playwright/.auth/user${i + 1}.json`
    });
  }
  return users;
}