#!/bin/bash

# Dashboard API Test Script
# Run this on your EC2 server to test all dashboard endpoints

echo "🧪 Testing Dashboard API Endpoints..."
echo "======================================"
echo ""

BASE_URL="http://localhost:5000/api"

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_endpoint() {
    local endpoint=$1
    local name=$2
    
    echo -e "${YELLOW}Testing: ${name}${NC}"
    echo "Endpoint: ${BASE_URL}${endpoint}"
    
    response=$(curl -s -w "\n%{http_code}" "${BASE_URL}${endpoint}")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" == "200" ]; then
        echo -e "${GREEN}✓ SUCCESS (HTTP $http_code)${NC}"
        echo "Response: $body" | jq '.' 2>/dev/null || echo "$body"
    else
        echo -e "${RED}✗ FAILED (HTTP $http_code)${NC}"
        echo "Response: $body"
    fi
    echo "--------------------------------------"
    echo ""
}

# Test all dashboard endpoints
test_endpoint "/dashboard/monthly-revenue" "Monthly Revenue"
test_endpoint "/dashboard/total-orders" "Total Orders"
test_endpoint "/dashboard/low-stock" "Low Stock Items"
test_endpoint "/dashboard/total-items" "Total Items"
test_endpoint "/dashboard/monthly-graph" "Monthly Graph Data"

# Test other working endpoints for comparison
echo ""
echo "🔍 Testing other working endpoints for comparison..."
echo "======================================"
test_endpoint "/machines" "Machines (Working)"
test_endpoint "/customers" "Customers (Working)"

echo ""
echo "✅ Testing complete!"
echo ""
echo "💡 If dashboard endpoints return 404:"
echo "   1. Check if backend code is deployed: ls -la routes/dashboard.js"
echo "   2. Check if server.js includes dashboard routes: grep dashboard server.js"
echo "   3. Restart the Node.js server: pm2 restart all"
echo "   4. Check server logs: pm2 logs"
