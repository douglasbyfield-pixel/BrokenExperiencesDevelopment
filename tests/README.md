# Broken Experiences Platform - Stress Testing Suite

This comprehensive Playwright stress testing suite is designed to validate the performance, reliability, and scalability of the Broken Experiences platform under various load conditions.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   cd tests
   npm install
   npm run install-browsers
   ```

2. **Set up environment variables:**
   ```bash
   # Create .env file in tests directory
   echo "PLAYWRIGHT_BASE_URL=http://localhost:3001" > .env
   echo "NEXT_PUBLIC_SERVER_URL=http://localhost:4000" >> .env
   echo "TEST_EMAIL=test@example.com" >> .env
   echo "TEST_PASSWORD=testpassword123" >> .env
   ```

3. **Start your application:**
   ```bash
   # In separate terminals
   cd ../apps/web && npm run dev
   cd ../apps/server && npm run dev
   ```

4. **Run stress tests:**
   ```bash
   npm run test:light    # Light load (5 users)
   npm run test:medium   # Medium load (15 users)  
   npm run test:heavy    # Heavy load (30-50 users)
   npm run test:mobile   # Mobile performance
   npm run test:api      # API endpoints
   npm run test:all      # All tests
   ```

## 📊 Test Categories

### 1. Light Stress Tests (`*.light.spec.ts`)
- **Users:** 5 concurrent
- **Duration:** 1-2 minutes
- **Purpose:** Basic functionality validation
- **Success Criteria:** >95% success rate, <3s avg response

### 2. Medium Stress Tests (`*.medium.spec.ts`)
- **Users:** 15 concurrent 
- **Duration:** 2-3 minutes
- **Purpose:** Moderate load handling
- **Success Criteria:** >90% success rate, <5s avg response

### 3. Heavy Stress Tests (`*.heavy.spec.ts`)
- **Users:** 30-50 concurrent
- **Duration:** 3-5 minutes
- **Purpose:** Maximum load capacity
- **Success Criteria:** >80% success rate, <10s avg response

### 4. Mobile Tests (`*.mobile.spec.ts`)
- **Users:** 10 concurrent
- **Network:** Simulated 3G/4G conditions
- **Purpose:** Mobile performance validation
- **Success Criteria:** >85% success rate, <8s avg response

### 5. API Tests (`*.api.spec.ts`)
- **Requests:** 100+ concurrent API calls
- **Purpose:** Backend endpoint stress testing
- **Success Criteria:** >95% success rate, <2s avg response

## 🎯 Test Scenarios

### User Behaviors Simulated:
- **Casual Browsers** (40%): Navigate between pages, scroll, read content
- **Active Reporters** (25%): Create and submit experience reports
- **Map Explorers** (20%): Interact with map, zoom, click markers
- **Social Users** (10%): Check leaderboards, view profiles
- **Searchers** (5%): Search for specific content

### Key User Flows Tested:
1. **Authentication & Session Management**
2. **Experience Creation & Submission**
3. **Map Interaction & Geolocation**
4. **Leaderboard & Scoring System**
5. **Profile Management**
6. **Search & Discovery**

## 📈 Metrics Collected

- **Success Rate**: Percentage of successful requests
- **Response Times**: Average, min, max response times
- **Throughput**: Requests per second
- **Error Analysis**: Categorized error reporting
- **Performance Grades**: A-F rating system

## 🔧 Configuration

### Environment Variables:
```bash
PLAYWRIGHT_BASE_URL=http://localhost:3001  # Frontend URL
NEXT_PUBLIC_SERVER_URL=http://localhost:4000  # Backend URL
TEST_EMAIL=test@example.com                # Test user email
TEST_PASSWORD=testpassword123              # Test user password
TEST_EMAIL_1=user1@example.com            # Additional test users
TEST_PASSWORD_1=password1                 # Additional passwords
```

### Custom Test Configuration:
```typescript
const config: StressTestConfig = {
  concurrentUsers: 20,     // Number of simultaneous users
  testDuration: 180,       // Test duration in seconds
  rampUpTime: 30,          // Gradual user introduction time
  actions: [               // Weighted user actions
    { name: 'browse', weight: 40, execute: browseBehavior },
    { name: 'create', weight: 30, execute: createExperience },
    // ... more actions
  ]
};
```

## 🚨 Monitoring & Alerts

### Performance Thresholds:
- **Critical**: <70% success rate
- **Warning**: <85% success rate  
- **Good**: >95% success rate

### Response Time Targets:
- **Light Load**: <3 seconds average
- **Medium Load**: <5 seconds average
- **Heavy Load**: <10 seconds average

## 📋 Reports

After test completion, check:
- **HTML Report**: `playwright show-report`
- **JSON Results**: `test-results/stress-test-results.json`
- **Console Output**: Detailed metrics and recommendations

## 🛠️ Troubleshooting

### Common Issues:

1. **High Failure Rate**:
   - Check database connections
   - Verify server resource allocation
   - Review network configurations

2. **Slow Response Times**:
   - Database query optimization needed
   - Consider implementing caching
   - Check for memory leaks

3. **Browser Crashes**:
   - Reduce concurrent users
   - Increase system memory
   - Check for JavaScript errors

### Performance Optimization Recommendations:

Based on test results, the system will automatically suggest:
- **Database**: Connection pooling, indexing
- **Caching**: Redis implementation
- **Infrastructure**: Horizontal scaling, load balancing
- **Code**: Query optimization, memory management

## 🎮 Advanced Usage

### Custom Stress Test:
```typescript
import { StressTestRunner } from './utils/stress-helpers';

const customTest = async (browser) => {
  const runner = new StressTestRunner(browser);
  const metrics = await runner.runStressTest({
    concurrentUsers: 25,
    testDuration: 240,
    rampUpTime: 30,
    actions: [/* your custom actions */]
  });
  
  console.log('Custom test results:', metrics);
};
```

### Integration with CI/CD:
```yaml
# GitHub Actions example
- name: Run Stress Tests
  run: |
    cd tests
    npm install
    npm run test:light
    npm run test:medium
```

## 📞 Support

For issues or questions:
1. Check the console output for detailed error messages
2. Review the HTML report for visual test results
3. Examine the JSON results for programmatic analysis
4. Adjust test parameters based on your infrastructure capacity

---

**Note**: These stress tests are designed to push your system to its limits. Always run them in a testing environment first and monitor system resources during execution.