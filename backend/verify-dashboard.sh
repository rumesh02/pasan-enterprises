#!/bin/bash

# Dashboard Backend Deployment Verification Script
# Run this on your EC2 server to verify dashboard routes are deployed

echo "=================================="
echo "Dashboard Backend Verification"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Check if backend directory exists
echo "1. Checking backend directory..."
if [ -d "backend" ]; then
    echo -e "${GREEN}✓ Backend directory found${NC}"
else
    echo -e "${RED}✗ Backend directory not found${NC}"
    echo "Please navigate to your project root directory"
    exit 1
fi

cd backend

# 2. Check if dashboard files exist
echo ""
echo "2. Checking dashboard files..."
if [ -f "routes/dashboard.js" ]; then
    echo -e "${GREEN}✓ routes/dashboard.js exists${NC}"
else
    echo -e "${RED}✗ routes/dashboard.js NOT FOUND${NC}"
    echo "  This file is missing! Dashboard routes will not work."
fi

if [ -f "controllers/dashboardController.js" ]; then
    echo -e "${GREEN}✓ controllers/dashboardController.js exists${NC}"
else
    echo -e "${RED}✗ controllers/dashboardController.js NOT FOUND${NC}"
    echo "  This file is missing! Dashboard endpoints will not work."
fi

# 3. Check if server.js includes dashboard routes
echo ""
echo "3. Checking server.js configuration..."
if grep -q "dashboardRoutes" server.js; then
    echo -e "${GREEN}✓ server.js includes dashboard routes${NC}"
    echo "  Found lines:"
    grep -n "dashboard" server.js
else
    echo -e "${RED}✗ server.js does NOT include dashboard routes${NC}"
    echo "  Dashboard routes are not registered!"
fi

# 4. Check git status
echo ""
echo "4. Checking git status..."
git status --short

# 5. Check current branch
echo ""
echo "5. Current branch:"
git branch --show-current

# 6. Check latest commits
echo ""
echo "6. Latest commits:"
git log --oneline -5

# 7. Test if Node.js is running
echo ""
echo "7. Checking if Node.js process is running..."
if pgrep -f "node.*server.js" > /dev/null; then
    echo -e "${GREEN}✓ Node.js server is running${NC}"
    echo "  Process ID: $(pgrep -f 'node.*server.js')"
else
    echo -e "${RED}✗ Node.js server is NOT running${NC}"
fi

# 8. Test endpoints locally
echo ""
echo "8. Testing dashboard endpoints locally..."
echo ""

endpoints=(
    "monthly-revenue"
    "total-orders"
    "low-stock"
    "total-items"
    "monthly-graph"
)

for endpoint in "${endpoints[@]}"; do
    echo "Testing: /api/dashboard/$endpoint"
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/dashboard/$endpoint)
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✓ $endpoint - OK (200)${NC}"
    elif [ "$response" = "404" ]; then
        echo -e "${RED}✗ $endpoint - NOT FOUND (404)${NC}"
    else
        echo -e "${YELLOW}⚠ $endpoint - Response: $response${NC}"
    fi
done

# 9. Summary
echo ""
echo "=================================="
echo "Summary"
echo "=================================="
echo ""
echo "If you see any RED (✗) marks above:"
echo "1. Pull the latest code: git pull origin dulara01"
echo "2. Install dependencies: npm install"
echo "3. Restart the server: pm2 restart all"
echo "4. Run this script again"
echo ""
echo "If all tests pass but dashboard still doesn't work:"
echo "1. Check nginx/reverse proxy configuration"
echo "2. Check firewall rules"
echo "3. Verify CORS settings in .env"
echo ""
