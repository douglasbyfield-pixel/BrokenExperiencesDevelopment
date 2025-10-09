import { Page, Browser, BrowserContext } from '@playwright/test';

export interface StressTestConfig {
  concurrentUsers: number;
  testDuration: number; // in seconds
  rampUpTime: number; // in seconds
  actions: UserAction[];
}

export interface UserAction {
  name: string;
  weight: number; // probability weight
  execute: (page: Page) => Promise<void>;
}

export interface StressTestMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  maxResponseTime: number;
  minResponseTime: number;
  requestsPerSecond: number;
  errors: string[];
}

export class StressTestRunner {
  private browser: Browser;
  private metrics: StressTestMetrics;
  private startTime: number;

  constructor(browser: Browser) {
    this.browser = browser;
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      maxResponseTime: 0,
      minResponseTime: Infinity,
      requestsPerSecond: 0,
      errors: []
    };
    this.startTime = Date.now();
  }

  async runStressTest(config: StressTestConfig): Promise<StressTestMetrics> {
    const contexts: BrowserContext[] = [];
    const userPromises: Promise<void>[] = [];

    // Create concurrent users with staggered start times
    for (let i = 0; i < config.concurrentUsers; i++) {
      const delay = (config.rampUpTime * 1000 * i) / config.concurrentUsers;
      
      userPromises.push(
        new Promise(resolve => {
          setTimeout(async () => {
            const context = await this.browser.newContext({
              storageState: `playwright/.auth/user${(i % 5) + 1}.json` // Rotate through 5 test users
            });
            contexts.push(context);
            
            const page = await context.newPage();
            await this.simulateUser(page, config, i);
            resolve();
          }, delay);
        })
      );
    }

    // Wait for all users to complete
    await Promise.all(userPromises);

    // Clean up contexts
    await Promise.all(contexts.map(context => context.close()));

    // Calculate final metrics
    const totalTime = (Date.now() - this.startTime) / 1000;
    this.metrics.requestsPerSecond = this.metrics.totalRequests / totalTime;
    this.metrics.averageResponseTime = this.metrics.averageResponseTime / this.metrics.totalRequests;

    return this.metrics;
  }

  private async simulateUser(page: Page, config: StressTestConfig, userId: number): Promise<void> {
    const endTime = this.startTime + (config.testDuration * 1000);
    
    while (Date.now() < endTime) {
      try {
        const action = this.selectRandomAction(config.actions);
        const requestStart = Date.now();
        
        await action.execute(page);
        
        const responseTime = Date.now() - requestStart;
        this.updateMetrics(responseTime, true);
        
        // Random delay between actions (0.5-3 seconds)
        await page.waitForTimeout(Math.random() * 2500 + 500);
        
      } catch (error) {
        this.updateMetrics(0, false, error.message);
      }
    }
  }

  private selectRandomAction(actions: UserAction[]): UserAction {
    const totalWeight = actions.reduce((sum, action) => sum + action.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const action of actions) {
      random -= action.weight;
      if (random <= 0) {
        return action;
      }
    }
    
    return actions[0]; // Fallback
  }

  private updateMetrics(responseTime: number, success: boolean, error?: string): void {
    this.metrics.totalRequests++;
    
    if (success) {
      this.metrics.successfulRequests++;
      this.metrics.averageResponseTime += responseTime;
      this.metrics.maxResponseTime = Math.max(this.metrics.maxResponseTime, responseTime);
      this.metrics.minResponseTime = Math.min(this.metrics.minResponseTime, responseTime);
    } else {
      this.metrics.failedRequests++;
      if (error) {
        this.metrics.errors.push(error);
      }
    }
  }
}

export const commonActions: UserAction[] = [
  {
    name: 'browse_home',
    weight: 30,
    execute: async (page: Page) => {
      await page.goto('/home');
      await page.waitForLoadState('networkidle');
    }
  },
  {
    name: 'view_leaderboard',
    weight: 15,
    execute: async (page: Page) => {
      await page.goto('/leaderboard');
      await page.waitForLoadState('networkidle');
    }
  },
  {
    name: 'view_profile',
    weight: 10,
    execute: async (page: Page) => {
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');
    }
  },
  {
    name: 'browse_map',
    weight: 20,
    execute: async (page: Page) => {
      await page.goto('/map');
      await page.waitForLoadState('networkidle');
      // Interact with map
      await page.click('canvas'); // Click on map canvas
    }
  },
  {
    name: 'search',
    weight: 10,
    execute: async (page: Page) => {
      await page.goto('/search');
      await page.fill('input[type="search"]', 'test query');
      await page.keyboard.press('Enter');
      await page.waitForLoadState('networkidle');
    }
  },
  {
    name: 'create_experience',
    weight: 15,
    execute: async (page: Page) => {
      await page.goto('/home');
      await page.click('[data-testid="create-experience"]');
      // Fill out form (mock data)
      await page.fill('input[name="title"]', `Test Experience ${Date.now()}`);
      await page.fill('textarea[name="description"]', 'This is a test experience for stress testing');
      // Submit form
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
    }
  }
];