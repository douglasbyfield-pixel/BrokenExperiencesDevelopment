import { test, expect } from '@playwright/test';
import { StressTestRunner } from '../utils/stress-helpers';

test.describe('Experience Reporting - Medium Stress Test', () => {
  test('handle 15 concurrent users with varied workflows', async ({ browser }) => {
    const runner = new StressTestRunner(browser);
    
    const config = {
      concurrentUsers: 15,
      testDuration: 120, // 2 minutes
      rampUpTime: 20,    // 20 seconds ramp up
      actions: [
        {
          name: 'full_experience_workflow',
          weight: 35,
          execute: async (page) => {
            // Navigate to home
            await page.goto('/home');
            await page.waitForLoadState('networkidle');
            
            // Create new experience
            const createButton = page.locator('[data-testid="create-experience"]')
              .or(page.locator('text=Report Experience'))
              .or(page.locator('button:has-text("Create")'))
              .or(page.locator('button:has-text("Add")'));
            
            if (await createButton.count() > 0) {
              await createButton.first().click();
              
              // Fill comprehensive form
              const titleField = page.locator('input[name="title"]').or(page.locator('input[placeholder*="title"]'));
              if (await titleField.count() > 0) {
                await titleField.fill(`Medium Stress Test - Experience ${Date.now()}`);
              }
              
              const descField = page.locator('textarea[name="description"]').or(page.locator('textarea[placeholder*="description"]'));
              if (await descField.count() > 0) {
                await descField.fill('Detailed description of a broken experience found during medium stress testing. This includes multiple lines of text to simulate real user input.');
              }
              
              // Select category if dropdown exists
              const categorySelect = page.locator('select[name="category"]').or(page.locator('[data-testid="category-select"]'));
              if (await categorySelect.count() > 0) {
                await categorySelect.selectOption({ index: Math.floor(Math.random() * 3) + 1 });
              }
              
              // Add location if location field exists
              const locationField = page.locator('input[name="location"]').or(page.locator('input[placeholder*="location"]'));
              if (await locationField.count() > 0) {
                await locationField.fill('Test Location, Test City');
              }
              
              // Submit form
              const submitButton = page.locator('button[type="submit"]').or(page.locator('text=Submit'));
              if (await submitButton.count() > 0) {
                await submitButton.first().click();
                await page.waitForLoadState('networkidle');
              }
            }
            
            // Navigate back to home to see the created experience
            await page.goto('/home');
            await page.waitForLoadState('networkidle');
          }
        },
        {
          name: 'browse_and_interact',
          weight: 25,
          execute: async (page) => {
            await page.goto('/home');
            await page.waitForLoadState('networkidle');
            
            // Scroll through feed
            for (let i = 0; i < 3; i++) {
              await page.evaluate(() => window.scrollBy(0, window.innerHeight / 2));
              await page.waitForTimeout(500);
            }
            
            // Click on random experience
            const experiences = page.locator('[data-testid="experience-card"]').or(page.locator('article'));
            const count = await experiences.count();
            if (count > 0) {
              const randomIndex = Math.floor(Math.random() * Math.min(count, 5));
              await experiences.nth(randomIndex).click();
              await page.waitForLoadState('networkidle');
              
              // Go back
              await page.goBack();
              await page.waitForLoadState('networkidle');
            }
          }
        },
        {
          name: 'map_interaction',
          weight: 20,
          execute: async (page) => {
            await page.goto('/map');
            await page.waitForLoadState('networkidle');
            
            // Wait for map to load
            await page.waitForTimeout(2000);
            
            // Interact with map if canvas exists
            const mapCanvas = page.locator('canvas').or(page.locator('.map-container'));
            if (await mapCanvas.count() > 0) {
              // Click on different areas of the map
              const bbox = await mapCanvas.first().boundingBox();
              if (bbox) {
                for (let i = 0; i < 3; i++) {
                  const x = bbox.x + Math.random() * bbox.width;
                  const y = bbox.y + Math.random() * bbox.height;
                  await page.mouse.click(x, y);
                  await page.waitForTimeout(1000);
                }
              }
            }
          }
        },
        {
          name: 'profile_and_leaderboard',
          weight: 20,
          execute: async (page) => {
            // Check profile
            await page.goto('/profile');
            await page.waitForLoadState('networkidle');
            
            // Check leaderboard
            await page.goto('/leaderboard');
            await page.waitForLoadState('networkidle');
            
            // Switch between leaderboard categories if tabs exist
            const categoryTabs = page.locator('[data-testid*="category"]').or(page.locator('button:has-text("Experience")'));
            const tabCount = await categoryTabs.count();
            if (tabCount > 0) {
              const randomTab = Math.floor(Math.random() * tabCount);
              await categoryTabs.nth(randomTab).click();
              await page.waitForLoadState('networkidle');
            }
          }
        }
      ]
    };

    const metrics = await runner.runStressTest(config);
    
    // Log detailed results
    console.log('Medium Stress Test Results:');
    console.log(`Total Requests: ${metrics.totalRequests}`);
    console.log(`Successful Requests: ${metrics.successfulRequests}`);
    console.log(`Failed Requests: ${metrics.failedRequests}`);
    console.log(`Success Rate: ${(metrics.successfulRequests / metrics.totalRequests * 100).toFixed(2)}%`);
    console.log(`Average Response Time: ${metrics.averageResponseTime.toFixed(2)}ms`);
    console.log(`Max Response Time: ${metrics.maxResponseTime}ms`);
    console.log(`Min Response Time: ${metrics.minResponseTime}ms`);
    console.log(`Requests Per Second: ${metrics.requestsPerSecond.toFixed(2)}`);
    console.log(`Errors: ${metrics.errors.length}`);
    
    // Assertions for medium load
    expect(metrics.successfulRequests / metrics.totalRequests).toBeGreaterThan(0.90); // 90% success rate
    expect(metrics.averageResponseTime).toBeLessThan(5000); // Average response under 5s
    expect(metrics.maxResponseTime).toBeLessThan(15000); // Max response under 15s
    expect(metrics.errors.length).toBeLessThan(10); // Less than 10 errors total
  });
});