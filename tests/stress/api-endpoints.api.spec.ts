import { test, expect } from '@playwright/test';

test.describe('API Endpoints - Stress Test', () => {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001';
  const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000';

  test('stress test scoring endpoints', async ({ request }) => {
    const concurrentRequests = 20;
    const totalRequests = 100;
    const results = {
      successful: 0,
      failed: 0,
      responseTimes: [] as number[]
    };

    // Test user scoring endpoint
    const runConcurrentRequests = async (requestCount: number) => {
      const promises = [];
      
      for (let i = 0; i < requestCount; i++) {
        promises.push(
          (async () => {
            const startTime = Date.now();
            try {
              const response = await request.get(`${serverURL}/scoring/leaderboard?limit=10&offset=0`);
              const responseTime = Date.now() - startTime;
              results.responseTimes.push(responseTime);
              
              if (response.ok()) {
                results.successful++;
              } else {
                results.failed++;
                console.log(`Request failed with status: ${response.status()}`);
              }
            } catch (error) {
              results.failed++;
              console.log(`Request error: ${error.message}`);
            }
          })()
        );
      }
      
      await Promise.all(promises);
    };

    // Run requests in batches
    for (let batch = 0; batch < totalRequests / concurrentRequests; batch++) {
      console.log(`Running batch ${batch + 1}/${totalRequests / concurrentRequests}`);
      await runConcurrentRequests(concurrentRequests);
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between batches
    }

    // Calculate metrics
    const avgResponseTime = results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length;
    const maxResponseTime = Math.max(...results.responseTimes);
    const minResponseTime = Math.min(...results.responseTimes);
    const successRate = (results.successful / totalRequests) * 100;

    console.log('API Stress Test Results:');
    console.log(`Total Requests: ${totalRequests}`);
    console.log(`Successful: ${results.successful}`);
    console.log(`Failed: ${results.failed}`);
    console.log(`Success Rate: ${successRate.toFixed(2)}%`);
    console.log(`Avg Response Time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`Max Response Time: ${maxResponseTime}ms`);
    console.log(`Min Response Time: ${minResponseTime}ms`);

    // Assertions
    expect(successRate).toBeGreaterThan(95); // 95% success rate
    expect(avgResponseTime).toBeLessThan(2000); // Average under 2s
    expect(maxResponseTime).toBeLessThan(10000); // Max under 10s
  });

  test('stress test stats endpoints', async ({ request }) => {
    const endpoints = [
      '/stats',
      '/stats/user',
      '/stats/trending'
    ];

    for (const endpoint of endpoints) {
      console.log(`Testing endpoint: ${endpoint}`);
      
      const promises = [];
      const startTime = Date.now();
      
      // 10 concurrent requests per endpoint
      for (let i = 0; i < 10; i++) {
        promises.push(
          request.get(`${serverURL}${endpoint}`)
        );
      }
      
      const responses = await Promise.all(promises);
      const endTime = Date.now();
      
      const successfulResponses = responses.filter(response => response.ok()).length;
      const successRate = (successfulResponses / responses.length) * 100;
      const totalTime = endTime - startTime;
      
      console.log(`${endpoint} - Success Rate: ${successRate}%, Total Time: ${totalTime}ms`);
      
      expect(successRate).toBeGreaterThan(90);
      expect(totalTime).toBeLessThan(5000);
    }
  });

  test('stress test experience endpoints', async ({ request }) => {
    // Test creating multiple experiences rapidly
    const createPromises = [];
    
    for (let i = 0; i < 15; i++) {
      createPromises.push(
        request.post(`${serverURL}/experience`, {
          data: {
            title: `Stress Test Experience ${i}`,
            description: `This is stress test experience number ${i}`,
            category: 'test',
            location: {
              lat: 40.7128 + (Math.random() - 0.5) * 0.1,
              lng: -74.0060 + (Math.random() - 0.5) * 0.1
            }
          }
        })
      );
    }
    
    const responses = await Promise.allSettled(createPromises);
    const successCount = responses.filter(result => 
      result.status === 'fulfilled' && result.value.ok()
    ).length;
    
    console.log(`Experience creation stress test: ${successCount}/15 successful`);
    
    // Should handle at least 80% of rapid creations
    expect(successCount / 15).toBeGreaterThan(0.8);
  });
});