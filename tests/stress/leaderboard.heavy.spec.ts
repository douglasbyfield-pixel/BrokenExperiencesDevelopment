import { test, expect } from '@playwright/test';
import { StressTestRunner } from '../utils/stress-helpers';

test.describe('Leaderboard - Heavy Stress Test', () => {
  test('handle 30 concurrent users accessing leaderboard and scoring system', async ({ browser }) => {
    const runner = new StressTestRunner(browser);
    
    const config = {
      concurrentUsers: 30,
      testDuration: 180, // 3 minutes
      rampUpTime: 30,    // 30 seconds ramp up
      actions: [
        {
          name: 'leaderboard_browsing',
          weight: 40,
          execute: async (page) => {
            await page.goto('/leaderboard');
            await page.waitForLoadState('networkidle');
            
            // Switch between different leaderboard categories
            const categories = ['overall', 'experiencesAdded', 'experiencesFixed', 'experiencesVerified', 'experiencesSponsored'];
            const randomCategory = categories[Math.floor(Math.random() * categories.length)];
            
            const categoryButton = page.locator(`[data-testid="${randomCategory}"]`)
              .or(page.locator(`button:has-text("${randomCategory}")`))
              .or(page.locator(`text=${randomCategory}`));
            
            if (await categoryButton.count() > 0) {
              await categoryButton.first().click();
              await page.waitForLoadState('networkidle');
            }
            
            // Scroll through leaderboard
            await page.evaluate(() => window.scrollBy(0, window.innerHeight));
            await page.waitForTimeout(1000);
          }
        },
        {
          name: 'rapid_scoring_actions',
          weight: 30,
          execute: async (page) => {
            // Simulate rapid actions that trigger scoring
            await page.goto('/home');
            await page.waitForLoadState('networkidle');
            
            // Rapid navigation to trigger scoring checks
            const pages = ['/home', '/profile', '/leaderboard', '/map'];
            for (const targetPage of pages) {
              await page.goto(targetPage);
              await page.waitForLoadState('domcontentloaded');
              await page.waitForTimeout(500);
            }
          }
        },
        {
          name: 'concurrent_experience_creation',
          weight: 20,
          execute: async (page) => {
            await page.goto('/home');
            
            const createButton = page.locator('[data-testid="create-experience"]')
              .or(page.locator('text=Report Experience'))
              .or(page.locator('button:has-text("Create")'));
            
            if (await createButton.count() > 0) {
              await createButton.first().click();
              
              // Quick form fill
              const titleField = page.locator('input[name="title"]').or(page.locator('input[placeholder*="title"]'));
              if (await titleField.count() > 0) {
                await titleField.fill(`Heavy Load Test ${Date.now()}-${Math.random()}`);
              }
              
              const descField = page.locator('textarea[name="description"]').or(page.locator('textarea'));
              if (await descField.count() > 0) {
                await descField.fill(`Heavy stress test experience ${Math.random()}`);
              }
              
              const submitButton = page.locator('button[type="submit"]').or(page.locator('text=Submit'));
              if (await submitButton.count() > 0) {
                await submitButton.first().click();
                await page.waitForLoadState('networkidle');
              }
            }
          }
        },
        {
          name: 'profile_stats_checking',
          weight: 10,
          execute: async (page) => {
            await page.goto('/profile');
            await page.waitForLoadState('networkidle');
            
            // Check if stats are loading correctly under load
            const statsElements = page.locator('[data-testid*="stat"]')
              .or(page.locator('.stat'))
              .or(page.locator('text=Reports'))
              .or(page.locator('text=Impact Score'));
            
            // Wait for stats to load
            if (await statsElements.count() > 0) {
              await page.waitForTimeout(2000);
            }
          }
        }
      ]
    };

    const metrics = await runner.runStressTest(config);
    
    // Log comprehensive results
    console.log('Heavy Stress Test Results:');
    console.log(`Total Requests: ${metrics.totalRequests}`);
    console.log(`Successful Requests: ${metrics.successfulRequests}`);
    console.log(`Failed Requests: ${metrics.failedRequests}`);
    console.log(`Success Rate: ${(metrics.successfulRequests / metrics.totalRequests * 100).toFixed(2)}%`);
    console.log(`Average Response Time: ${metrics.averageResponseTime.toFixed(2)}ms`);
    console.log(`Max Response Time: ${metrics.maxResponseTime}ms`);
    console.log(`Min Response Time: ${metrics.minResponseTime}ms`);
    console.log(`Requests Per Second: ${metrics.requestsPerSecond.toFixed(2)}`);
    console.log(`Total Errors: ${metrics.errors.length}`);
    
    if (metrics.errors.length > 0) {
      console.log('Error Summary:');
      const errorCounts = metrics.errors.reduce((acc, error) => {
        acc[error] = (acc[error] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      Object.entries(errorCounts).forEach(([error, count]) => {
        console.log(`  ${error}: ${count} occurrences`);
      });
    }
    
    // Heavy load assertions - more lenient but still ensuring system stability
    expect(metrics.successfulRequests / metrics.totalRequests).toBeGreaterThan(0.80); // 80% success rate under heavy load
    expect(metrics.averageResponseTime).toBeLessThan(10000); // Average response under 10s
    expect(metrics.maxResponseTime).toBeLessThan(30000); // Max response under 30s
    expect(metrics.errors.length).toBeLessThan(50); // Less than 50 errors total
    expect(metrics.requestsPerSecond).toBeGreaterThan(1); // At least 1 request per second
  });
});