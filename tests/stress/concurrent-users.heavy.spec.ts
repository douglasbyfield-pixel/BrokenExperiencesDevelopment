import { test, expect } from '@playwright/test';
import { StressTestRunner } from '../utils/stress-helpers';

test.describe('Concurrent Users - Maximum Load Test', () => {
  test('simulate realistic user behavior with 50 concurrent users', async ({ browser }) => {
    const runner = new StressTestRunner(browser);
    
    const config = {
      concurrentUsers: 50,
      testDuration: 300, // 5 minutes
      rampUpTime: 60,    // 1 minute ramp up
      actions: [
        {
          name: 'casual_browser',
          weight: 40,
          execute: async (page) => {
            // Simulate casual browsing behavior
            const pages = ['/home', '/map', '/leaderboard'];
            const randomPage = pages[Math.floor(Math.random() * pages.length)];
            
            await page.goto(randomPage);
            await page.waitForLoadState('networkidle');
            
            // Random scroll behavior
            const scrollCount = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < scrollCount; i++) {
              await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.5));
              await page.waitForTimeout(Math.random() * 2000 + 1000);
            }
          }
        },
        {
          name: 'active_reporter',
          weight: 25,
          execute: async (page) => {
            // Simulate active users who report experiences
            await page.goto('/home');
            await page.waitForLoadState('networkidle');
            
            const createButton = page.locator('[data-testid="create-experience"]')
              .or(page.locator('text=Report Experience'))
              .or(page.locator('button:has-text("Create")'));
            
            if (await createButton.count() > 0) {
              await createButton.first().click();
              
              // Simulate realistic form filling with pauses
              const titleField = page.locator('input[name="title"]').or(page.locator('input[placeholder*="title"]'));
              if (await titleField.count() > 0) {
                await titleField.focus();
                await page.waitForTimeout(500);
                await titleField.fill(`Real User Experience ${Date.now()}`);
              }
              
              const descField = page.locator('textarea[name="description"]').or(page.locator('textarea'));
              if (await descField.count() > 0) {
                await descField.focus();
                await page.waitForTimeout(800);
                await descField.fill('This is a detailed description of a broken experience I encountered. The issue was quite frustrating and needs to be addressed.');
              }
              
              // Wait before submitting (realistic user behavior)
              await page.waitForTimeout(Math.random() * 3000 + 1000);
              
              const submitButton = page.locator('button[type="submit"]').or(page.locator('text=Submit'));
              if (await submitButton.count() > 0) {
                await submitButton.first().click();
                await page.waitForLoadState('networkidle');
              }
            }
          }
        },
        {
          name: 'map_explorer',
          weight: 20,
          execute: async (page) => {
            // Simulate users exploring the map
            await page.goto('/map');
            await page.waitForLoadState('networkidle');
            
            // Wait for map to load
            await page.waitForTimeout(3000);
            
            const mapCanvas = page.locator('canvas').or(page.locator('.map-container'));
            if (await mapCanvas.count() > 0) {
              const bbox = await mapCanvas.first().boundingBox();
              if (bbox) {
                // Simulate realistic map exploration
                for (let i = 0; i < 5; i++) {
                  const x = bbox.x + Math.random() * bbox.width;
                  const y = bbox.y + Math.random() * bbox.height;
                  await page.mouse.click(x, y);
                  await page.waitForTimeout(Math.random() * 2000 + 500);
                  
                  // Simulate zoom actions
                  if (Math.random() > 0.7) {
                    await page.mouse.wheel(0, Math.random() > 0.5 ? -100 : 100);
                    await page.waitForTimeout(1000);
                  }
                }
              }
            }
          }
        },
        {
          name: 'social_user',
          weight: 10,
          execute: async (page) => {
            // Simulate users checking leaderboards and profiles
            await page.goto('/leaderboard');
            await page.waitForLoadState('networkidle');
            
            // Browse different categories
            const categories = page.locator('button').filter({ hasText: /Experience|Problem|Verifier|Sponsor/ });
            const categoryCount = await categories.count();
            if (categoryCount > 0) {
              const randomCategory = Math.floor(Math.random() * categoryCount);
              await categories.nth(randomCategory).click();
              await page.waitForLoadState('networkidle');
              await page.waitForTimeout(2000);
            }
            
            // Check own profile
            await page.goto('/profile');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(Math.random() * 3000 + 1000);
          }
        },
        {
          name: 'searcher',
          weight: 5,
          execute: async (page) => {
            // Simulate users searching for content
            await page.goto('/search');
            await page.waitForLoadState('networkidle');
            
            const searchInput = page.locator('input[type="search"]')
              .or(page.locator('input[placeholder*="search"]'));
            
            if (await searchInput.count() > 0) {
              const searchTerms = ['broken', 'experience', 'bug', 'issue', 'problem', 'website', 'app'];
              const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
              
              await searchInput.focus();
              await page.waitForTimeout(500);
              await searchInput.fill(randomTerm);
              await page.waitForTimeout(1000);
              await page.keyboard.press('Enter');
              await page.waitForLoadState('networkidle');
            }
          }
        }
      ]
    };

    const metrics = await runner.runStressTest(config);
    
    // Comprehensive logging
    console.log('=== MAXIMUM LOAD TEST RESULTS ===');
    console.log(`Test Duration: 5 minutes with 50 concurrent users`);
    console.log(`Total Requests: ${metrics.totalRequests}`);
    console.log(`Successful Requests: ${metrics.successfulRequests}`);
    console.log(`Failed Requests: ${metrics.failedRequests}`);
    console.log(`Success Rate: ${(metrics.successfulRequests / metrics.totalRequests * 100).toFixed(2)}%`);
    console.log(`Average Response Time: ${metrics.averageResponseTime.toFixed(2)}ms`);
    console.log(`Max Response Time: ${metrics.maxResponseTime}ms`);
    console.log(`Min Response Time: ${metrics.minResponseTime}ms`);
    console.log(`Requests Per Second: ${metrics.requestsPerSecond.toFixed(2)}`);
    console.log(`Total Errors: ${metrics.errors.length}`);
    
    // Performance analysis
    const performanceGrade = metrics.successfulRequests / metrics.totalRequests;
    let grade = 'F';
    if (performanceGrade >= 0.95) grade = 'A';
    else if (performanceGrade >= 0.90) grade = 'B';
    else if (performanceGrade >= 0.80) grade = 'C';
    else if (performanceGrade >= 0.70) grade = 'D';
    
    console.log(`Performance Grade: ${grade}`);
    
    if (metrics.errors.length > 0) {
      console.log('\n=== ERROR ANALYSIS ===');
      const errorCounts = metrics.errors.reduce((acc, error) => {
        const errorType = error.split(':')[0]; // Get error type
        acc[errorType] = (acc[errorType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      Object.entries(errorCounts)
        .sort(([,a], [,b]) => b - a)
        .forEach(([error, count]) => {
          console.log(`  ${error}: ${count} occurrences (${(count/metrics.errors.length*100).toFixed(1)}%)`);
        });
    }
    
    // Scalability assertions - realistic expectations for high load
    expect(metrics.successfulRequests / metrics.totalRequests).toBeGreaterThan(0.70); // 70% success rate under maximum load
    expect(metrics.averageResponseTime).toBeLessThan(15000); // Average response under 15s
    expect(metrics.maxResponseTime).toBeLessThan(45000); // Max response under 45s
    expect(metrics.requestsPerSecond).toBeGreaterThan(0.5); // At least 0.5 requests per second
    
    // Log recommendations based on results
    console.log('\n=== RECOMMENDATIONS ===');
    if (performanceGrade < 0.80) {
      console.log('⚠️  Consider implementing:');
      console.log('   - Database connection pooling');
      console.log('   - Redis caching for frequently accessed data');
      console.log('   - API rate limiting');
      console.log('   - CDN for static assets');
    }
    
    if (metrics.averageResponseTime > 5000) {
      console.log('⚠️  High response times detected:');
      console.log('   - Consider database query optimization');
      console.log('   - Implement proper database indexing');
      console.log('   - Review server resource allocation');
    }
    
    if (metrics.requestsPerSecond < 2) {
      console.log('⚠️  Low throughput detected:');
      console.log('   - Consider horizontal scaling');
      console.log('   - Implement load balancing');
      console.log('   - Optimize application code');
    }
  });
});