# JMeter Stress Testing Setup Guide

## 🚀 Installation & Setup

### 1. Install JMeter
```bash
# Option 1: Download from Apache JMeter website
# Visit: https://jmeter.apache.org/download_jmeter.cgi

# Option 2: Install via Homebrew (macOS)
brew install jmeter

# Option 3: Install via package manager (Ubuntu)
sudo apt update
sudo apt install openjdk-11-jdk
wget https://downloads.apache.org//jmeter/binaries/apache-jmeter-5.6.2.tgz
tar -xzf apache-jmeter-5.6.2.tgz
cd apache-jmeter-5.6.2/bin
./jmeter
```

### 2. Verify Installation
```bash
# Check if JMeter is installed
jmeter -v

# Start JMeter GUI
jmeter

# Run JMeter in non-GUI mode (for actual testing)
jmeter -n -t test-plan.jmx -l results.jtl
```

## 📋 Test Plan Structure

### Phase 1: 10 Users (Baseline Test)
- **Purpose**: Establish baseline performance
- **Duration**: 5 minutes
- **Ramp-up**: 30 seconds
- **Expected**: All requests should succeed

### Phase 2: 50 Users (Normal Load)
- **Purpose**: Test normal operating conditions
- **Duration**: 10 minutes  
- **Ramp-up**: 2 minutes
- **Expected**: <5% error rate, <3s response time

### Phase 3: 500 Users (Stress Test)
- **Purpose**: Find breaking point
- **Duration**: 15 minutes
- **Ramp-up**: 5 minutes
- **Expected**: May see errors, identify bottlenecks

## 🎯 Test Scenarios

### Scenario 1: User Authentication (20%)
- Login → Dashboard → Profile

### Scenario 2: Browse Experiences (40%)
- Home → Scroll → View Experience Details

### Scenario 3: Create Experience (25%)
- Home → Create Experience → Submit Form

### Scenario 4: Check Leaderboard (10%)
- Leaderboard → Switch Categories → View Stats

### Scenario 5: Map Interaction (5%)
- Map → Click Markers → View Details

## 📊 Key Metrics to Monitor

1. **Response Times**: Average, 90th percentile, 95th percentile
2. **Throughput**: Requests per second
3. **Error Rate**: Percentage of failed requests
4. **Resource Utilization**: CPU, Memory, Database connections

## 🚨 Success Criteria

### 10 Users (Baseline):
- ✅ 0% error rate
- ✅ <2s average response time
- ✅ >10 requests/second

### 50 Users (Normal Load):
- ✅ <2% error rate
- ✅ <3s average response time
- ✅ >20 requests/second

### 500 Users (Stress Test):
- ⚠️ <10% error rate (acceptable under stress)
- ⚠️ <8s average response time
- ⚠️ >50 requests/second

## 🛠️ JMeter Configuration Tips

### Memory Settings:
```bash
# Increase JMeter heap size for large tests
export HEAP="-Xms1g -Xmx4g"
jmeter -n -t test-plan.jmx -l results.jtl
```

### Non-GUI Mode (Recommended for load testing):
```bash
# Always use non-GUI mode for actual stress testing
jmeter -n -t BrokenExperiences-StressTest.jmx -l results/test-results.jtl -e -o results/html-report
```

### Results Analysis:
- **JTL files**: Raw test data
- **HTML reports**: Visual dashboards
- **Log files**: Detailed error information