import { test, expect } from '@playwright/test';
import { StressTestRunner, commonActions } from '../utils/stress-helpers';

test.describe('Experience Reporting - Light Stress Test', () => {
  test('handle 5 concurrent users reporting experiences', async ({ browser }) => {
    const runner = new StressTestRunner(browser);
    
    const config = {
      concurrentUsers: 5,
      testDuration: 60, // 1 minute
      rampUpTime: 10,   // 10 seconds ramp up
      actions: [
        {
          name: 'create_experience',
          weight: 40,
          execute: async (page) => {
            await page.goto('/home');
            
            // Look for create experience button/link
            const createButton = page.locator('[data-testid="create-experience"]')
              .or(page.locator('text=Report Experience'))
              .or(page.locator('text=Create'))
              .or(page.locator('button:has-text("Add")'));
            
            if (await createButton.count() > 0) {
              await createButton.first().click();
              
              // Fill form fields if they exist
              const titleField = page.locator('input[name="title"]').or(page.locator('input[placeholder*="title"]'));
              if (await titleField.count() > 0) {
                await titleField.fill(`Stress Test Experience ${Date.now()}`);
              }
              
              const descField = page.locator('textarea[name="description"]').or(page.locator('textarea[placeholder*="description"]'));
              if (await descField.count() > 0) {
                await descField.fill('This is a stress test experience created by automated testing.');
              }
              
              // Submit if submit button exists
              const submitButton = page.locator('button[type="submit"]').or(page.locator('text=Submit')).or(page.locator('text=Create'));
              if (await submitButton.count() > 0) {
                await submitButton.first().click();
                await page.waitForLoadState('networkidle');
              }
            }
          }
        },
        {
          name: 'browse_experiences',
          weight: 30,
          execute: async (page) => {
            await page.goto('/home');
            await page.waitForLoadState('networkidle');
            
            // Scroll through the feed
            await page.evaluate(() => {
              window.scrollBy(0, window.innerHeight);
            });
            await page.waitForTimeout(1000);
          }
        },
        {
          name: 'view_experience_details',
          weight: 20,
          execute: async (page) => {
            await page.goto('/home');
            await page.waitForLoadState('networkidle');
            
            // Click on first experience card if it exists
            const experienceCard = page.locator('[data-testid="experience-card"]')
              .or(page.locator('.experience-card'))
              .or(page.locator('article'))
              .first();
            
            if (await experienceCard.count() > 0) {
              await experienceCard.click();
              await page.waitForLoadState('networkidle');
            }
          }
        },
        {
          name: 'search_experiences',
          weight: 10,
          execute: async (page) => {
            await page.goto('/search');
            await page.waitForLoadState('networkidle');
            
            const searchInput = page.locator('input[type="search"]')
              .or(page.locator('input[placeholder*="search"]'))
              .or(page.locator('input[name="search"]'));
            
            if (await searchInput.count() > 0) {
              await searchInput.fill('test experience');
              await page.keyboard.press('Enter');
              await page.waitForLoadState('networkidle');
            }
          }
        }
      ]
    };

    const metrics = await runner.runStressTest(config);
    
    // Log results
    console.log('Light Stress Test Results:');
    console.log(`Total Requests: ${metrics.totalRequests}`);
    console.log(`Success Rate: ${(metrics.successfulRequests / metrics.totalRequests * 100).toFixed(2)}%`);
    console.log(`Average Response Time: ${metrics.averageResponseTime.toFixed(2)}ms`);
    console.log(`Requests Per Second: ${metrics.requestsPerSecond.toFixed(2)}`);
    
    // Assertions
    expect(metrics.successfulRequests / metrics.totalRequests).toBeGreaterThan(0.95); // 95% success rate
    expect(metrics.averageResponseTime).toBeLessThan(3000); // Average response under 3s
    expect(metrics.errors.length).toBeLessThan(5); // Less than 5 errors total
  });
});