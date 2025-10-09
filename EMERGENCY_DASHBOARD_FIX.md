# 🚨 URGENT: Dashboard Backend Deployment Issue

## Problem
Dashboard returns **404 errors** in production but works locally.

**Error Message:**
```
Request failed with status code 404
Cannot GET /api/dashboard/monthly-revenue
```

## Root Cause
**The backend dashboard routes are NOT deployed to your EC2 server.**

The files exist in your local repository but are missing on the production server.

---

## 🔥 IMMEDIATE FIX - SSH into EC2 and Run These Commands:

### Step 1: SSH into your EC2 server
```bash
ssh -i your-key.pem ec2-user@your-ec2-server
# OR
ssh -i your-key.pem ubuntu@your-ec2-server
```

### Step 2: Navigate to backend directory
```bash
# Common paths - try one that matches your setup:
cd ~/pasan-enterprises/backend
# OR
cd /var/www/pasan-enterprises/backend
# OR
cd /home/ubuntu/pasan-enterprises/backend
```

### Step 3: Check current status
```bash
# See what files are missing
ls -la routes/dashboard.js
ls -la controllers/dashboardController.js

# Check git status
git status
git branch
```

### Step 4: Pull latest code
```bash
# Make sure you're on the correct branch
git checkout dulara01

# Pull the latest changes
git pull origin dulara01

# If you get conflicts or errors, try:
git fetch origin
git reset --hard origin/dulara01
```

### Step 5: Verify files now exist
```bash
# Both should exist now
ls -la routes/dashboard.js
ls -la controllers/dashboardController.js

# Check server.js includes dashboard
grep dashboard server.js
```

### Step 6: Install any new dependencies
```bash
npm install
```

### Step 7: Restart your backend server

**If using PM2:**
```bash
pm2 restart all
# OR specifically:
pm2 restart pasan-backend
pm2 logs pasan-backend
```

**If using systemd:**
```bash
sudo systemctl restart pasan-backend
sudo systemctl status pasan-backend
sudo journalctl -u pasan-backend -f
```

**If running manually:**
```bash
pkill -f "node server.js"
npm start
```

### Step 8: Test the endpoints on EC2
```bash
# Test each endpoint locally on the server:
curl http://localhost:5000/api/dashboard/monthly-revenue
curl http://localhost:5000/api/dashboard/total-orders
curl http://localhost:5000/api/dashboard/low-stock
curl http://localhost:5000/api/dashboard/total-items
curl http://localhost:5000/api/dashboard/monthly-graph

# Each should return JSON, not HTML 404
```

### Step 9: Test from public URL
```bash
# From your local computer or browser:
curl https://pasan-enterprises.me/api/dashboard/monthly-revenue
```

---

## 🧪 Automated Verification Script

I've created a verification script. Upload it to your EC2 and run it:

```bash
# On your local machine, push the script:
git add backend/verify-dashboard.sh
git commit -m "Add dashboard verification script"
git push origin dulara01

# On EC2, pull and run:
cd ~/pasan-enterprises/backend
git pull origin dulara01
chmod +x verify-dashboard.sh
./verify-dashboard.sh
```

This script will check:
- ✓ Dashboard files exist
- ✓ Server.js includes routes
- ✓ Git is up to date
- ✓ Server is running
- ✓ Endpoints respond correctly

---

## 🔍 Common Issues and Solutions

### Issue 1: "git pull says everything up-to-date but files are missing"

**Solution:**
```bash
# Force reset to remote
git fetch origin
git reset --hard origin/dulara01

# Or clone fresh:
cd ~
mv pasan-enterprises pasan-enterprises-backup
git clone https://github.com/rumesh02/pasan-enterprises.git
cd pasan-enterprises
git checkout dulara01
cd backend
npm install
# Copy .env from backup:
cp ~/pasan-enterprises-backup/backend/.env .
pm2 restart all
```

### Issue 2: "Files exist but endpoints still return 404"

**Solution:**
```bash
# Check if server.js was updated:
grep -A 2 "dashboardRoutes" server.js

# Should show:
# const dashboardRoutes = require('./routes/dashboard');
# ...
# app.use('/api/dashboard', dashboardRoutes);

# If missing, pull again:
git pull origin dulara01

# Restart:
pm2 restart all
```

### Issue 3: "Server won't restart"

**Solution:**
```bash
# Check for errors:
pm2 logs pasan-backend --lines 50

# Common errors:
# - Module not found: Run npm install
# - Port already in use: Kill old process
# - Syntax error: Check git pull worked

# Kill all node processes and restart:
pm2 delete all
pm2 start server.js --name pasan-backend
```

### Issue 4: "Endpoints work locally but not from internet"

**Solutions:**

**A. Check Nginx configuration (if using nginx):**
```bash
sudo nano /etc/nginx/sites-available/pasan-enterprises

# Should have:
location /api/dashboard {
    proxy_pass http://localhost:5000/api/dashboard;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}

# Test and reload:
sudo nginx -t
sudo systemctl reload nginx
```

**B. Check firewall:**
```bash
sudo ufw status
# Port 5000 should be allowed
```

**C. Check AWS Security Group:**
- Go to EC2 console
- Check security group allows port 5000 (or 80/443 if using nginx)

---

## 📋 Verification Checklist

Run these commands on EC2 and check each one:

```bash
# 1. Files exist?
[ ] ls -la routes/dashboard.js           # Should show file
[ ] ls -la controllers/dashboardController.js  # Should show file

# 2. Server.js updated?
[ ] grep dashboardRoutes server.js       # Should show 2 lines

# 3. Git up to date?
[ ] git status                           # Should be clean
[ ] git log --oneline -1                 # Should show recent commit

# 4. Server running?
[ ] pm2 list                             # Should show running
[ ] curl http://localhost:5000/health    # Should return JSON

# 5. Endpoints work?
[ ] curl http://localhost:5000/api/dashboard/monthly-revenue  # Should return JSON
[ ] curl http://localhost:5000/api/dashboard/total-orders     # Should return JSON
[ ] curl http://localhost:5000/api/dashboard/low-stock        # Should return JSON
[ ] curl http://localhost:5000/api/dashboard/total-items      # Should return JSON
[ ] curl http://localhost:5000/api/dashboard/monthly-graph    # Should return JSON

# 6. Public access works?
[ ] curl https://pasan-enterprises.me/api/dashboard/monthly-revenue
```

---

## 🎯 Expected Results

**Before Fix:**
```bash
$ curl http://localhost:5000/api/dashboard/monthly-revenue
<!DOCTYPE html>
<html>
<head><title>404 Not Found</title></head>
# ... HTML error page
```

**After Fix:**
```bash
$ curl http://localhost:5000/api/dashboard/monthly-revenue
{
  "success": true,
  "data": {
    "revenue": 831578.4,
    "orderCount": 15,
    "month": "October",
    "year": 2025
  }
}
```

---

## 📞 Still Not Working?

If you've followed all steps and it still doesn't work:

1. **Send me the output of these commands:**
```bash
pwd
git log --oneline -3
ls -la routes/dashboard.js
ls -la controllers/dashboardController.js
grep dashboard server.js
pm2 logs --lines 20
curl http://localhost:5000/api/dashboard/monthly-revenue
```

2. **Check these logs:**
```bash
pm2 logs pasan-backend --lines 100
```

3. **Verify environment:**
```bash
cat .env | grep -v PASSWORD | grep -v SECRET
node --version
npm --version
```

---

## ⚡ Quick Test Commands

Copy and paste this entire block on your EC2:

```bash
echo "=== Dashboard Deployment Test ==="
cd ~/pasan-enterprises/backend
echo "Current directory: $(pwd)"
echo "Git branch: $(git branch --show-current)"
echo "Latest commit: $(git log --oneline -1)"
echo ""
echo "=== File Check ==="
ls -la routes/dashboard.js 2>&1
ls -la controllers/dashboardController.js 2>&1
echo ""
echo "=== Server.js Check ==="
grep -n dashboard server.js
echo ""
echo "=== Testing Endpoints ==="
for endpoint in monthly-revenue total-orders low-stock total-items monthly-graph; do
  echo -n "Testing $endpoint: "
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5000/api/dashboard/$endpoint
done
```

---

**Last Updated:** October 7, 2025  
**Status:** Awaiting EC2 deployment  
**Priority:** 🔥 CRITICAL - Dashboard not working in production
