# 🚀 Final Dashboard Deployment Guide

## What Was Changed

### 1. Environment Files Created ✅
- **`.env.development`** → `REACT_APP_API_URL=http://localhost:5000/api`
- **`.env.production`** → `REACT_APP_API_URL=https://pasan-enterprises.me/api`

### 2. Dashboard.js Rewritten ✅
- Now uses `api` instance directly (not `dashboardAPI`)
- Individual try-catch for each API call
- Detailed console logging for debugging
- Shows API Base URL, Environment, and URL attempted

### 3. How It Works

**Development (localhost):**
```
REACT_APP_API_URL=http://localhost:5000/api
Dashboard fetches from: http://localhost:5000/api/dashboard/monthly-revenue
```

**Production (AWS Amplify):**
```
REACT_APP_API_URL=https://pasan-enterprises.me/api
Dashboard fetches from: https://pasan-enterprises.me/api/dashboard/monthly-revenue
```

---

## 🔧 Deployment Steps

### Step 1: Configure AWS Amplify Environment Variable

1. Go to AWS Amplify Console
2. Select your app: `pasan-enterprises`
3. Click **"Environment variables"** in left menu
4. Click **"Manage variables"**
5. Add variable:
   - **Variable name:** `REACT_APP_API_URL`
   - **Value:** `https://pasan-enterprises.me/api`
6. Click **"Save"**

### Step 2: Push Code to GitHub

```bash
git add .
git commit -m "Fix dashboard API configuration for production"
git push origin dulara01
```

### Step 3: Deploy Frontend (AWS Amplify will auto-deploy)

Amplify will automatically rebuild when you push to GitHub.

### Step 4: Deploy Backend to EC2

**SSH into EC2:**
```bash
ssh -i your-key.pem ec2-user@your-ec2-server
```

**Pull latest code:**
```bash
cd ~/pasan-enterprises/backend
git pull origin dulara01
```

**Restart backend:**
```bash
pm2 restart all
# or
sudo systemctl restart pasan-backend
```

**Test endpoints on EC2:**
```bash
curl http://localhost:5000/api/dashboard/monthly-revenue
curl http://localhost:5000/api/dashboard/total-orders
curl http://localhost:5000/api/dashboard/low-stock
curl http://localhost:5000/api/dashboard/total-items
curl http://localhost:5000/api/dashboard/monthly-graph
```

All should return JSON (not HTML 404).

---

## ✅ Verification

### After Frontend Deployment:

Open browser console (F12) on https://main.d1ukwwdrgqtdby.amplifyapp.com

You should see:
```
🔄 Dashboard: Starting to fetch data...
📡 API Base URL: https://pasan-enterprises.me/api
🌍 Environment: production
🔗 REACT_APP_API_URL: https://pasan-enterprises.me/api
✅ Monthly Revenue loaded: {success: true, data: {...}}
✅ Total Orders loaded: {success: true, data: {...}}
✅ Low Stock loaded: {success: true, data: {...}}
✅ Total Items loaded: {success: true, data: {...}}
✅ Monthly Graph loaded: {success: true, data: {...}}
✅ Dashboard: All data loaded successfully!
```

### If You See Errors:

**404 Errors:**
```
❌ Monthly Revenue failed: Request failed with status code 404
   URL attempted: https://pasan-enterprises.me/api/dashboard/monthly-revenue
   Status: 404
```

**Solution:** Backend not deployed. Follow Step 4 above.

---

## 🧪 Testing Locally

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

Open http://localhost:3000 and check console:
```
🔄 Dashboard: Starting to fetch data...
📡 API Base URL: http://localhost:5000/api
🌍 Environment: development
🔗 REACT_APP_API_URL: http://localhost:5000/api
✅ All data loaded successfully!
```

---

## 📋 Files Changed

### Frontend:
- ✅ `frontend/.env.development` (NEW)
- ✅ `frontend/.env.production` (NEW)
- ✅ `frontend/src/pages/Dashboard.js` (UPDATED)

### Backend:
- ✅ `backend/controllers/dashboardController.js` (EXISTS)
- ✅ `backend/routes/dashboard.js` (EXISTS)
- ✅ `backend/server.js` (INCLUDES ROUTES)

---

## 🎯 Expected Results

### Dashboard Cards:
1. **Monthly Revenue** - Shows LKR amount for current month
2. **Total Orders** - Shows LKR all-time revenue
3. **Low Stock Items** - Shows count of items with qty < 3
4. **Total Items** - Shows total inventory count

### Chart:
- 12-month bar chart with revenue data

---

## 🆘 Troubleshooting

### Issue: "API Base URL shows localhost in production"

**Check:**
1. AWS Amplify environment variable is set
2. Frontend was rebuilt after adding env variable
3. Clear browser cache

**Fix:**
```bash
# In Amplify console, trigger manual deployment
# Or push a new commit to trigger rebuild
```

### Issue: "All endpoints return 404 in production"

**Backend not deployed to EC2.**

**Fix:**
```bash
# SSH into EC2
cd ~/pasan-enterprises/backend
git pull origin dulara01
pm2 restart all
```

### Issue: "CORS errors"

**Backend doesn't allow Amplify domain.**

**Fix on EC2:**
```bash
# Edit .env file
nano .env

# Add:
ALLOWED_ORIGINS=http://localhost:3000,https://main.d1ukwwdrgqtdby.amplifyapp.com

# Restart:
pm2 restart all
```

---

## 📞 Support

If dashboard still doesn't work after following all steps:

1. **Check Amplify build logs** - Look for environment variable
2. **Check browser console** - See what URL is being called
3. **Check EC2 logs** - `pm2 logs pasan-backend`
4. **Test backend directly** - `curl https://pasan-enterprises.me/api/dashboard/monthly-revenue`

---

**Status:** Ready for deployment  
**Priority:** High  
**Estimated time:** 10 minutes
