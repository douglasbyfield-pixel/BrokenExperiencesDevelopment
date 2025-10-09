import { test, expect } from '@playwright/test';
import { StressTestRunner } from '../utils/stress-helpers';

test.describe('Mobile Performance - Stress Test', () => {
  test('mobile users with limited bandwidth simulation', async ({ browser }) => {
    const runner = new StressTestRunner(browser);
    
    const config = {
      concurrentUsers: 10, // Lower for mobile simulation
      testDuration: 120,   // 2 minutes
      rampUpTime: 15,      // 15 seconds ramp up
      actions: [
        {
          name: 'mobile_browsing',
          weight: 50,
          execute: async (page) => {
            // Simulate slow mobile network
            const client = await page.context().newCDPSession(page);
            await client.send('Network.enable');
            await client.send('Network.emulateNetworkConditions', {
              offline: false,
              downloadThroughput: 1.5 * 1024 * 1024 / 8, // 1.5 Mbps
              uploadThroughput: 750 * 1024 / 8,           // 750 Kbps
              latency: 150 // 150ms latency
            });
            
            await page.goto('/home');
            await page.waitForLoadState('networkidle');
            
            // Mobile-specific interactions
            await page.touchscreen.tap(100, 200); // Tap instead of click
            await page.waitForTimeout(1000);
            
            // Scroll with touch
            await page.evaluate(() => {
              window.scrollBy(0, window.innerHeight * 0.5);
            });
            await page.waitForTimeout(1500);
          }
        },
        {
          name: 'mobile_navigation',
          weight: 30,
          execute: async (page) => {
            // Test mobile navigation patterns
            const pages = ['/home', '/map', '/profile', '/leaderboard'];
            
            for (const targetPage of pages) {
              await page.goto(targetPage);
              await page.waitForLoadState('domcontentloaded');
              
              // Simulate mobile user pausing to read
              await page.waitForTimeout(Math.random() * 2000 + 1000);
              
              // Test touch interactions
              const elements = await page.locator('button, a, [role="button"]').all();
              if (elements.length > 0) {
                const randomElement = elements[Math.floor(Math.random() * Math.min(elements.length, 3))];
                const bbox = await randomElement.boundingBox();
                if (bbox) {
                  await page.touchscreen.tap(bbox.x + bbox.width/2, bbox.y + bbox.height/2);
                  await page.waitForTimeout(500);
                }
              }
            }
          }
        },
        {
          name: 'mobile_form_interaction',
          weight: 20,
          execute: async (page) => {
            await page.goto('/home');
            
            const createButton = page.locator('[data-testid="create-experience"]')
              .or(page.locator('text=Report Experience'))
              .or(page.locator('button:has-text("Create")'));
            
            if (await createButton.count() > 0) {
              const bbox = await createButton.first().boundingBox();
              if (bbox) {
                await page.touchscreen.tap(bbox.x + bbox.width/2, bbox.y + bbox.height/2);
                
                // Mobile form filling - slower typing
                const titleField = page.locator('input[name="title"]').or(page.locator('input[placeholder*="title"]'));
                if (await titleField.count() > 0) {
                  await titleField.focus();
                  await page.waitForTimeout(500);
                  
                  // Simulate mobile typing (slower)
                  const title = `Mobile Test ${Date.now()}`;
                  for (const char of title) {
                    await page.keyboard.type(char);
                    await page.waitForTimeout(50); // Slower typing
                  }
                }
                
                const descField = page.locator('textarea[name="description"]').or(page.locator('textarea'));
                if (await descField.count() > 0) {
                  await descField.focus();
                  await page.waitForTimeout(500);
                  await descField.fill('Mobile stress test experience');
                }
                
                // Submit with touch
                const submitButton = page.locator('button[type="submit"]').or(page.locator('text=Submit'));
                if (await submitButton.count() > 0) {
                  const submitBbox = await submitButton.first().boundingBox();
                  if (submitBbox) {
                    await page.touchscreen.tap(submitBbox.x + submitBbox.width/2, submitBbox.y + submitBbox.height/2);
                    await page.waitForLoadState('networkidle');
                  }
                }
              }
            }
          }
        }
      ]
    };

    const metrics = await runner.runStressTest(config);
    
    console.log('Mobile Performance Stress Test Results:');
    console.log(`Total Requests: ${metrics.totalRequests}`);
    console.log(`Success Rate: ${(metrics.successfulRequests / metrics.totalRequests * 100).toFixed(2)}%`);
    console.log(`Average Response Time: ${metrics.averageResponseTime.toFixed(2)}ms`);
    console.log(`Max Response Time: ${metrics.maxResponseTime}ms`);
    console.log(`Requests Per Second: ${metrics.requestsPerSecond.toFixed(2)}`);
    console.log(`Mobile-specific Errors: ${metrics.errors.length}`);
    
    // Mobile performance expectations
    expect(metrics.successfulRequests / metrics.totalRequests).toBeGreaterThan(0.85); // 85% success rate on mobile
    expect(metrics.averageResponseTime).toBeLessThan(8000); // Mobile networks are slower
    expect(metrics.errors.length).toBeLessThan(15); // Account for mobile network issues
  });

  test('progressive web app stress test', async ({ browser }) => {
    // Test PWA functionality under stress
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Enable service worker
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test offline capability
    await page.route('**/*', route => {
      if (Math.random() < 0.3) { // 30% chance of network failure
        route.abort();
      } else {
        route.continue();
      }
    });
    
    const promises = [];
    for (let i = 0; i < 20; i++) {
      promises.push(
        (async () => {
          try {
            await page.goto('/home');
            await page.waitForLoadState('domcontentloaded', { timeout: 5000 });
            return 'success';
          } catch (error) {
            return 'failed';
          }
        })()
      );
    }
    
    const results = await Promise.allSettled(promises);
    const successCount = results.filter(result => 
      result.status === 'fulfilled' && result.value === 'success'
    ).length;
    
    console.log(`PWA Offline Resilience: ${successCount}/20 successful loads`);
    
    // PWA should handle at least 50% of requests even with network issues
    expect(successCount / 20).toBeGreaterThan(0.5);
    
    await context.close();
  });
});