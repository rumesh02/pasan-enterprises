#!/bin/bash
# SIMPLE PRODUCTION DEPLOYMENT
# Run this on your production server (pasan-enterprises.me)

echo "=================================="
echo "Deploying Dashboard to Production"
echo "=================================="

# 1. Navigate to your backend directory
cd /var/www/pasan-enterprises/backend  # CHANGE THIS TO YOUR ACTUAL PATH
# Common paths:
# cd /home/ubuntu/pasan-enterprises/backend
# cd ~/pasan-enterprises/backend

# 2. Pull latest code
echo "Pulling latest code from GitHub..."
git fetch origin
git pull origin dulara01

# 3. Check if dashboard files exist
echo "Verifying dashboard files..."
if [ -f "routes/dashboard.js" ]; then
    echo "✓ routes/dashboard.js exists"
else
    echo "✗ routes/dashboard.js MISSING!"
    exit 1
fi

if [ -f "controllers/dashboardController.js" ]; then
    echo "✓ controllers/dashboardController.js exists"
else
    echo "✗ controllers/dashboardController.js MISSING!"
    exit 1
fi

# 4. Install any new dependencies
echo "Installing dependencies..."
npm install --production

# 5. Restart backend service
echo "Restarting backend..."

# TRY THESE IN ORDER (uncomment the one that works for you):

# For PM2:
pm2 restart pasan-enterprises-backend
pm2 list

# For systemd:
# sudo systemctl restart pasan-enterprises-backend
# sudo systemctl status pasan-enterprises-backend

# For Docker:
# docker-compose restart backend

# For direct node:
# pkill -f "node server.js"
# nohup node server.js > backend.log 2>&1 &

# 6. Wait and test
echo "Waiting 5 seconds for restart..."
sleep 5

echo "Testing dashboard endpoints..."
curl -s https://pasan-enterprises.me/api/dashboard/stats | head -50

echo ""
echo "=================================="
echo "Deployment Complete!"
echo "=================================="
echo ""
echo "Test the dashboard at:"
echo "https://main.d1ukwwdrgqtdby.amplifyapp.com/dashboard"
