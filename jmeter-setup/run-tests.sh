#!/bin/bash

# JMeter Stress Testing Script for Broken Experiences Platform
# Usage: ./run-tests.sh [10|50|500|all]

set -e

# Configuration
JMETER_HOME=${JMETER_HOME:-$(which jmeter | sed 's/\/bin\/jmeter//')}
RESULTS_DIR="results"
REPORTS_DIR="reports"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create directories
mkdir -p $RESULTS_DIR $REPORTS_DIR

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if servers are running
check_servers() {
    print_status "Checking if servers are running..."
    
    # Check frontend (port 3001)
    if ! curl -s http://localhost:3001 > /dev/null; then
        print_error "Frontend server not running on port 3001"
        echo "Start with: cd apps/web && npm run dev"
        exit 1
    fi
    
    # Check backend (port 4000)
    if ! curl -s http://localhost:4000 > /dev/null; then
        print_error "Backend server not running on port 4000"
        echo "Start with: cd apps/server && npm run dev"
        exit 1
    fi
    
    print_success "Both servers are running"
}

# Function to run JMeter test
run_jmeter_test() {
    local test_file=$1
    local test_name=$2
    local users=$3
    
    print_status "Starting $test_name test with $users users..."
    
    local result_file="$RESULTS_DIR/${test_name}_${TIMESTAMP}.jtl"
    local log_file="$RESULTS_DIR/${test_name}_${TIMESTAMP}.log"
    local report_dir="$REPORTS_DIR/${test_name}_${TIMESTAMP}"
    
    # Run JMeter in non-GUI mode
    jmeter -n \
        -t "$test_file" \
        -l "$result_file" \
        -j "$log_file" \
        -e \
        -o "$report_dir" \
        -Jjmeter.reportgenerator.overall_granularity=5000 \
        -Jjmeter.reportgenerator.graph.responseTimeOverTime.granularity=5000
    
    if [ $? -eq 0 ]; then
        print_success "$test_name test completed successfully"
        print_status "Results saved to: $result_file"
        print_status "HTML report: $report_dir/index.html"
        print_status "Log file: $log_file"
        
        # Generate summary
        generate_summary "$result_file" "$test_name" "$users"
    else
        print_error "$test_name test failed"
        exit 1
    fi
}

# Function to generate test summary
generate_summary() {
    local result_file=$1
    local test_name=$2
    local users=$3
    
    if [ ! -f "$result_file" ]; then
        print_warning "Result file not found: $result_file"
        return
    fi
    
    # Calculate basic statistics using awk
    local stats=$(awk -F',' '
    NR > 1 {
        total++
        elapsed += $2
        if ($8 == "true") success++
        else errors++
        if ($2 > max_time) max_time = $2
        if (min_time == 0 || $2 < min_time) min_time = $2
    }
    END {
        if (total > 0) {
            avg_time = elapsed / total
            success_rate = (success / total) * 100
            error_rate = (errors / total) * 100
            printf "%.0f,%.2f,%.2f,%.0f,%.0f,%.0f", total, success_rate, error_rate, avg_time, min_time, max_time
        }
    }' "$result_file")
    
    if [ -n "$stats" ]; then
        IFS=',' read -r total success_rate error_rate avg_time min_time max_time <<< "$stats"
        
        echo ""
        echo "========================================="
        echo "  $test_name TEST SUMMARY ($users users)"
        echo "========================================="
        echo "Total Requests:     $total"
        echo "Success Rate:       $success_rate%"
        echo "Error Rate:         $error_rate%"
        echo "Avg Response Time:  ${avg_time}ms"
        echo "Min Response Time:  ${min_time}ms"
        echo "Max Response Time:  ${max_time}ms"
        echo ""
        
        # Performance evaluation
        if (( $(echo "$success_rate >= 95" | bc -l) )); then
            print_success "Excellent performance! ✅"
        elif (( $(echo "$success_rate >= 90" | bc -l) )); then
            print_warning "Good performance ⚠️"
        elif (( $(echo "$success_rate >= 80" | bc -l) )); then
            print_warning "Acceptable performance under load ⚠️"
        else
            print_error "Poor performance - optimization needed ❌"
        fi
        
        if (( $(echo "$avg_time <= 2000" | bc -l) )); then
            print_success "Response times excellent ✅"
        elif (( $(echo "$avg_time <= 5000" | bc -l) )); then
            print_warning "Response times acceptable ⚠️"
        else
            print_error "Response times too slow ❌"
        fi
        
        echo "========================================="
    fi
}

# Function to check system resources
check_system_resources() {
    print_status "System Resources Before Test:"
    echo "CPU Usage: $(top -l 1 | grep "CPU usage" | awk '{print $3}' | sed 's/%//')"
    echo "Memory Usage: $(top -l 1 | grep "PhysMem" | awk '{print $2}')"
    echo "Available Memory: $(top -l 1 | grep "PhysMem" | awk '{print $6}')"
    echo ""
}

# Function to provide recommendations
provide_recommendations() {
    local test_type=$1
    
    echo ""
    echo "📋 RECOMMENDATIONS FOR $test_type:"
    echo ""
    
    case $test_type in
        "10-USERS")
            echo "• If this test fails, focus on basic optimization:"
            echo "  - Check database queries"
            echo "  - Add basic caching"
            echo "  - Optimize critical paths"
            ;;
        "50-USERS")
            echo "• If performance degrades here:"
            echo "  - Implement connection pooling"
            echo "  - Add Redis caching layer"
            echo "  - Consider database indexes"
            echo "  - Monitor memory usage"
            ;;
        "500-USERS")
            echo "• This is your breaking point test:"
            echo "  - Expect errors and slow responses"
            echo "  - Identify which endpoints fail first"
            echo "  - Plan infrastructure upgrades:"
            echo "    → Render: Upgrade to Standard ($25/month)"
            echo "    → Supabase: Upgrade to Pro ($25/month)"
            echo "    → Add Redis caching"
            echo "    → Consider load balancing"
            ;;
    esac
    echo ""
}

# Function to monitor during test
monitor_test() {
    local test_name=$1
    print_status "Test is running... Monitor your servers:"
    echo "Frontend: http://localhost:3001"
    echo "Backend: http://localhost:4000"
    echo ""
    echo "Watch for:"
    echo "• Server response times in browser"
    echo "• Console errors in browser dev tools"
    echo "• Server logs for errors"
    echo "• System resource usage (Activity Monitor)"
    echo ""
    print_warning "Press Ctrl+C to stop the test if needed"
}

# Main execution
main() {
    echo "🚀 JMeter Stress Testing Suite for Broken Experiences Platform"
    echo "=============================================================="
    
    # Check for JMeter installation
    if ! command -v jmeter &> /dev/null; then
        print_error "JMeter not found. Please install JMeter first."
        echo "Install with: brew install jmeter"
        exit 1
    fi
    
    # Check if bc is available for calculations
    if ! command -v bc &> /dev/null; then
        print_warning "bc not found. Install with: brew install bc"
    fi
    
    local test_type=${1:-"help"}
    
    case $test_type in
        "10")
            check_servers
            check_system_resources
            provide_recommendations "10-USERS"
            monitor_test "10-users" &
            run_jmeter_test "BrokenExperiences-10Users.jmx" "10-users" "10"
            ;;
        "50")
            check_servers
            check_system_resources
            provide_recommendations "50-USERS"
            monitor_test "50-users" &
            run_jmeter_test "BrokenExperiences-50Users.jmx" "50-users" "50"
            ;;
        "500")
            check_servers
            check_system_resources
            print_warning "⚠️  This is a STRESS TEST that will likely break your system!"
            print_warning "⚠️  Make sure you have no real users on the system!"
            echo ""
            read -p "Are you sure you want to run the 500-user stress test? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                provide_recommendations "500-USERS"
                monitor_test "500-users" &
                run_jmeter_test "BrokenExperiences-500Users.jmx" "500-users" "500"
            else
                print_status "Test cancelled"
                exit 0
            fi
            ;;
        "all")
            print_status "Running all tests sequentially..."
            check_servers
            
            # Run tests with delays between them
            main "10"
            print_status "Waiting 30 seconds before next test..."
            sleep 30
            
            main "50"
            print_status "Waiting 60 seconds before stress test..."
            sleep 60
            
            main "500"
            ;;
        "help"|*)
            echo ""
            echo "Usage: $0 [test_type]"
            echo ""
            echo "Test Types:"
            echo "  10      Run baseline test with 10 concurrent users"
            echo "  50      Run load test with 50 concurrent users"
            echo "  500     Run stress test with 500 concurrent users (⚠️  WILL LIKELY BREAK YOUR SYSTEM)"
            echo "  all     Run all tests sequentially"
            echo "  help    Show this help message"
            echo ""
            echo "Before running tests, make sure:"
            echo "1. Frontend is running on http://localhost:3001"
            echo "2. Backend is running on http://localhost:4000"
            echo "3. Database is accessible"
            echo "4. No real users are using the system (especially for 500-user test)"
            echo ""
            echo "Results will be saved in:"
            echo "• ./results/ - Raw JTL files and logs"
            echo "• ./reports/ - HTML reports with graphs"
            echo ""
            exit 0
            ;;
    esac
    
    print_success "All tests completed! 🎉"
    echo ""
    echo "Next steps:"
    echo "1. Review HTML reports in ./reports/"
    echo "2. Analyze error logs in ./results/"
    echo "3. Implement optimizations based on findings"
    echo "4. Re-run tests to measure improvements"
}

# Run main function with all arguments
main "$@"