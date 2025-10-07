# 🚀 Dashboard Deployment Checklist

## Issue
Dashboard shows 404 errors for all API endpoints in production:
- `/api/dashboard/monthly-revenue` - 404
- `/api/dashboard/total-orders` - 404
- `/api/dashboard/low-stock` - 404
- `/api/dashboard/total-items` - 404
- `/api/dashboard/monthly-graph` - 404

## Root Cause
The backend dashboard files were created but need to be deployed to your EC2 server.

## ✅ Completed Steps
1. ✅ Created `backend/controllers/dashboardController.js` with 5 endpoints
2. ✅ Created `backend/routes/dashboard.js` with route definitions
3. ✅ Updated `backend/server.js` to include dashboard routes
4. ✅ Committed all files to git
5. ✅ Pushed to GitHub origin
6. ✅ Pushed to dulara remote

## 🔧 Required Actions on EC2 Server

You need to deploy the updated backend code to your EC2 instance. Follow these steps:

### Step 1: SSH into your EC2 instance
```bash
ssh -i your-key.pem ec2-user@your-ec2-ip
# Or if you have a different user:
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### Step 2: Navigate to your backend directory
```bash
cd /path/to/your/backend
# Common paths:
# cd ~/pasan-enterprises/backend
# cd /var/www/pasan-enterprises/backend
# cd /home/ec2-user/pasan-enterprises/backend
```

### Step 3: Pull the latest code
```bash
git pull origin dulara01
```

### Step 4: Verify the new files exist
```bash
ls -la routes/dashboard.js
ls -la controllers/dashboardController.js
```

### Step 5: Restart your Node.js application

**If using PM2:**
```bash
pm2 restart all
# Or specifically:
pm2 restart pasan-backend
```

**If using systemd:**
```bash
sudo systemctl restart pasan-backend
```

**If running with npm/node directly:**
```bash
# Kill the existing process
pkill -f "node server.js"
# Start again
npm start
# Or run in background:
nohup npm start > output.log 2>&1 &
```

### Step 6: Verify the endpoints work
```bash
# Test each endpoint:
curl http://localhost:5000/api/dashboard/monthly-revenue
curl http://localhost:5000/api/dashboard/total-orders
curl http://localhost:5000/api/dashboard/low-stock
curl http://localhost:5000/api/dashboard/total-items
curl http://localhost:5000/api/dashboard/monthly-graph
```

### Step 7: Check from public URL
Open your browser or use curl:
```bash
curl https://pasan-enterprises.me/api/dashboard/monthly-revenue
```

## 🔍 Troubleshooting

### If you get "Cannot find module './routes/dashboard'"
```bash
# Make sure the file was pulled:
ls -la routes/dashboard.js

# If missing, check git status:
git status
git log --oneline -5
```

### If endpoints still return 404
```bash
# Check if server.js was updated:
grep dashboard server.js

# Should show:
# const dashboardRoutes = require('./routes/dashboard');
# app.use('/api/dashboard', dashboardRoutes);
```

### If you get database errors
```bash
# Check MongoDB connection:
grep MONGODB_URI .env

# Test MongoDB connection:
mongo "your-mongodb-uri"
```

### Check server logs
```bash
# If using PM2:
pm2 logs pasan-backend

# If using systemd:
sudo journalctl -u pasan-backend -f

# If using npm start:
tail -f output.log
```

## 📋 Files Deployed

### Backend Files Created/Updated:
- ✅ `backend/controllers/dashboardController.js` - 5 API controller functions
- ✅ `backend/routes/dashboard.js` - Dashboard route definitions  
- ✅ `backend/server.js` - Added dashboard routes registration

### Endpoints Added:
1. `GET /api/dashboard/monthly-revenue` - Returns current month revenue
2. `GET /api/dashboard/total-orders` - Returns all-time revenue
3. `GET /api/dashboard/low-stock` - Returns count of items with qty < 3
4. `GET /api/dashboard/total-items` - Returns total inventory count
5. `GET /api/dashboard/monthly-graph` - Returns 12-month revenue data

## ✨ Expected Results After Deployment

Once deployed, the dashboard should show:
- ✅ Monthly Revenue card with current month's total
- ✅ Total Orders card with all-time revenue
- ✅ Low Stock Items count (items with quantity < 3)
- ✅ Total Items in inventory
- ✅ 12-month bar chart with revenue data

## 🆘 Need Help?

If the dashboard still doesn't work after deployment:

1. **Check EC2 logs** for any error messages
2. **Verify git pull** worked correctly
3. **Confirm server restarted** successfully
4. **Test locally** on EC2 with curl commands
5. **Check CORS settings** in backend .env file

## 📞 Support Commands

```bash
# Check if Node.js is running:
ps aux | grep node

# Check which port Node.js is using:
netstat -tulpn | grep node

# Check if MongoDB is accessible:
nc -zv your-mongodb-host 27017

# View environment variables:
cat .env

# Check git branch:
git branch
git log --oneline -3
```

---

**Status:** Ready for EC2 deployment
**Last Updated:** October 7, 2025
**Version:** 1.0.0
