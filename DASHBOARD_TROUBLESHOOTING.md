# 🔧 Dashboard 404 Error - Troubleshooting Guide

## Problem Summary
Dashboard works locally but shows 404 errors in production for all dashboard API endpoints:
- ❌ `/api/dashboard/monthly-revenue` - 404
- ❌ `/api/dashboard/total-orders` - 404  
- ❌ `/api/dashboard/low-stock` - 404
- ❌ `/api/dashboard/total-items` - 404
- ❌ `/api/dashboard/monthly-graph` - 404

Meanwhile, other pages work fine:
- ✅ View Inventory - Works
- ✅ Customers - Works
- ✅ Past Orders - Works
- ✅ Sell Item - Works

## Root Cause Analysis

### Why Dashboard Fails in Production
The dashboard API routes are missing from your production EC2 server. The code exists locally but hasn't been deployed.

### Why Other Pages Work
They use existing API endpoints like:
- `/api/machines` - Deployed ✓
- `/api/customers` - Deployed ✓
- `/api/past-orders` - Deployed ✓

## What Was Fixed in Code

### 1. Added `dashboardAPI` to `apiService.js`
Now dashboard uses the same pattern as other services for consistency.

**Before:**
```javascript
import api from '../services/apiService';
api.get('/dashboard/monthly-revenue')
```

**After:**
```javascript
import { dashboardAPI } from '../services/apiService';
dashboardAPI.getMonthlyRevenue()
```

### 2. Files That Need to be on EC2

These files MUST exist on your EC2 server:

| File | Path | Status | Size |
|------|------|--------|------|
| dashboardController.js | `backend/controllers/` | ❓ Check | ~6KB |
| dashboard.js | `backend/routes/` | ❓ Check | ~500B |
| server.js | `backend/` | ✓ Exists | Updated |

## Step-by-Step Fix

### STEP 1: SSH into EC2
```bash
ssh -i your-key.pem ec2-user@your-ec2-ip
# or
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### STEP 2: Navigate to Backend Directory
```bash
cd /path/to/your/backend
# Common paths:
# cd ~/pasan-enterprises/backend
# cd /var/www/pasan-enterprises/backend
# cd /home/ec2-user/app/backend
```

### STEP 3: Check Current Branch
```bash
git branch
# Should show: * dulara01
```

### STEP 4: Pull Latest Code
```bash
git fetch origin
git pull origin dulara01
```

### STEP 5: Verify Files Exist
```bash
# Check if dashboard files were pulled
ls -la routes/dashboard.js
ls -la controllers/dashboardController.js

# Should show files with recent date
```

**Expected Output:**
```
-rw-r--r-- 1 ec2-user ec2-user  507 Oct  7 17:38 routes/dashboard.js
-rw-r--r-- 1 ec2-user ec2-user 6145 Oct  7 17:38 controllers/dashboardController.js
```

### STEP 6: Verify server.js Has Dashboard Routes
```bash
grep -A2 "dashboardRoutes" server.js
```

**Expected Output:**
```javascript
const dashboardRoutes = require('./routes/dashboard');
//...
app.use('/api/dashboard', dashboardRoutes);
```

### STEP 7: Install Any New Dependencies (if needed)
```bash
npm install
```

### STEP 8: Restart Node.js Server

**If using PM2:**
```bash
pm2 restart all
# or specifically:
pm2 restart pasan-backend

# Check status:
pm2 status
pm2 logs pasan-backend --lines 50
```

**If using systemd:**
```bash
sudo systemctl restart pasan-backend
sudo systemctl status pasan-backend
sudo journalctl -u pasan-backend -n 50 -f
```

**If running node directly:**
```bash
# Find process
ps aux | grep "node server.js"

# Kill it
pkill -f "node server.js"

# Restart
cd /path/to/backend
npm start
# or background:
nohup npm start > output.log 2>&1 &
```

### STEP 9: Test Endpoints Locally on EC2
```bash
# Test dashboard endpoints
curl http://localhost:5000/api/dashboard/monthly-revenue
curl http://localhost:5000/api/dashboard/total-orders
curl http://localhost:5000/api/dashboard/low-stock
curl http://localhost:5000/api/dashboard/total-items
curl http://localhost:5000/api/dashboard/monthly-graph

# Should return JSON like:
# {"success":true,"data":{...}}
```

### STEP 10: Test from Public URL
```bash
curl https://pasan-enterprises.me/api/dashboard/monthly-revenue
```

Or open in browser:
- https://pasan-enterprises.me/api/dashboard/monthly-revenue
- https://pasan-enterprises.me/api/dashboard/total-orders

## Common Issues & Solutions

### Issue 1: "Cannot find module './routes/dashboard'"

**Cause:** Files weren't pulled from git

**Fix:**
```bash
# Check git status
git status
git log --oneline -5

# Force pull
git fetch origin
git reset --hard origin/dulara01

# Verify files exist
ls -la routes/dashboard.js
```

### Issue 2: Files exist but still 404

**Cause:** Server not restarted

**Fix:**
```bash
# PM2:
pm2 restart all

# Check logs for errors:
pm2 logs
```

### Issue 3: "Module not found" errors in logs

**Cause:** Missing Node modules

**Fix:**
```bash
npm install
pm2 restart all
```

### Issue 4: CORS errors

**Cause:** Amplify URL not in allowed origins

**Fix:**
Edit `.env` on EC2:
```bash
nano .env
```

Add:
```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,https://main.d1ukwwdrgqtdby.amplifyapp.com
```

Save and restart:
```bash
pm2 restart all
```

### Issue 5: MongoDB connection errors

**Cause:** MongoDB URI issues

**Fix:**
```bash
# Test MongoDB connection
mongo "your-mongodb-uri"

# Check .env has correct URI
grep MONGODB_URI .env
```

## Testing Scripts

### Run Test Script on EC2
```bash
# Make executable
chmod +x test-dashboard-api.sh

# Run
./test-dashboard-api.sh
```

### Manual Tests
```bash
# Test each endpoint
for endpoint in monthly-revenue total-orders low-stock total-items monthly-graph; do
  echo "Testing /dashboard/$endpoint"
  curl -s "http://localhost:5000/api/dashboard/$endpoint" | jq '.success'
done
```

## Verification Checklist

After deployment, verify:

- [ ] SSH into EC2 successful
- [ ] Git pull completed without errors
- [ ] `routes/dashboard.js` exists
- [ ] `controllers/dashboardController.js` exists
- [ ] `server.js` has dashboard routes
- [ ] Node server restarted
- [ ] No errors in logs
- [ ] Local curl tests pass (200 OK)
- [ ] Public URL tests pass (200 OK)
- [ ] Frontend dashboard loads data
- [ ] No console errors in browser

## Success Indicators

When working correctly, you should see:

1. **In Terminal (EC2):**
```bash
$ curl http://localhost:5000/api/dashboard/monthly-revenue
{"success":true,"data":{"revenue":831578.4,"orderCount":15,"month":"October","year":2025}}
```

2. **In Browser Console:**
```
🔄 Dashboard: Starting to fetch data...
✅ Monthly Revenue loaded: {revenue: 831578.4, ...}
✅ Total Orders loaded: {revenue: 831578.4, ...}
✅ Low Stock loaded: {count: 0, ...}
✅ Total Items loaded: {count: 8, ...}
✅ Monthly Graph loaded: Array(12)
✅ Dashboard: All data loaded successfully!
```

3. **In Dashboard UI:**
- Monthly Revenue shows actual amount
- Total Orders shows actual amount
- Low Stock shows count
- Total Items shows count
- Chart displays bars for all 12 months

## Quick Reference Commands

```bash
# SSH to EC2
ssh -i key.pem ec2-user@ip

# Navigate to backend
cd ~/pasan-enterprises/backend

# Pull latest code
git pull origin dulara01

# Check files
ls -la routes/dashboard.js controllers/dashboardController.js

# Restart server
pm2 restart all

# View logs
pm2 logs --lines 100

# Test endpoints
curl http://localhost:5000/api/dashboard/monthly-revenue
```

## Need More Help?

### Check These Files on EC2:
1. `routes/dashboard.js` - Route definitions
2. `controllers/dashboardController.js` - Business logic
3. `server.js` - Route registration
4. `.env` - Environment variables
5. `package.json` - Dependencies

### Check These Logs:
1. PM2 logs: `pm2 logs`
2. System logs: `sudo journalctl -u pasan-backend -f`
3. Application logs: `tail -f output.log`
4. Nginx logs: `sudo tail -f /var/log/nginx/error.log`

### Useful Debugging Commands:
```bash
# Check if Node is running
ps aux | grep node

# Check ports
netstat -tulpn | grep 5000

# Check MongoDB connection
nc -zv mongodb-host 27017

# View environment
env | grep -i mongo
env | grep -i frontend
```

---

**Last Updated:** October 7, 2025  
**Status:** Waiting for EC2 deployment  
**Next Step:** Run Steps 1-10 above on your EC2 server
