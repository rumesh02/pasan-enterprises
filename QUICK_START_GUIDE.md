# 🧪 Quick Start & Testing Guide

## ⚡ Quick Start (5 Steps)

### Step 1: Start Backend
```powershell
cd backend
npm start
```
✅ Wait for: "Node server running on port 5000"

### Step 2: Start Frontend (New Terminal)
```powershell
cd frontend
npm start
```
✅ Wait for: Browser opens at http://localhost:3000

### Step 3: Navigate to Dashboard
Click on "Dashboard" in the sidebar

### Step 4: Verify Data Loads
You should see:
- ✅ Four colored cards with numbers
- ✅ Bar chart with 12 months
- ✅ All values formatted as "LKR X,XXX.XX"

### Step 5: Test Interactions
- Hover over chart bars → Tooltips appear
- Check values match API data

---

## 🔍 Testing Each API Endpoint

### PowerShell Commands (Windows)

Copy and paste these into PowerShell:

```powershell
# Test 1: Monthly Revenue
Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard/monthly-revenue"

# Test 2: Total Orders
Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard/total-orders"

# Test 3: Low Stock Items
Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard/low-stock"

# Test 4: Total Items
Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard/total-items"

# Test 5: Monthly Graph
Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard/monthly-graph"
```

### Browser Testing

Open these URLs directly:
1. http://localhost:5000/api/dashboard/monthly-revenue
2. http://localhost:5000/api/dashboard/total-orders
3. http://localhost:5000/api/dashboard/low-stock
4. http://localhost:5000/api/dashboard/total-items
5. http://localhost:5000/api/dashboard/monthly-graph

---

## ✅ Verification Checklist

### Backend Checks
- [ ] Backend server running on port 5000
- [ ] No errors in terminal
- [ ] MongoDB connected successfully
- [ ] All 5 endpoints return `{ "success": true }`

### Frontend Checks
- [ ] Frontend running on port 3000
- [ ] Dashboard page loads
- [ ] No console errors (F12)
- [ ] All cards show data (not 0 or null)

### Visual Checks
- [ ] Monthly Revenue card is GREEN
- [ ] Total Orders card is BLUE
- [ ] Low Stock card is RED
- [ ] Total Items card is PURPLE
- [ ] Chart shows 12 bars (Jan-Dec)
- [ ] Values show "LKR" format

### Interaction Checks
- [ ] Hover over chart bars shows tooltips
- [ ] Tooltips show correct values
- [ ] Cards have shadow effects
- [ ] Page is responsive (resize window)

---

## 🐛 Common Issues & Fixes

### Issue 1: "Loading..." Never Stops
**Cause:** Backend not running or wrong API URL

**Fix:**
```powershell
# Check if backend is running
curl http://localhost:5000/health

# Check frontend .env file
Get-Content frontend\.env
```

### Issue 2: All Cards Show "0"
**Cause:** No data in database

**Fix:**
```javascript
// Run seed scripts to add sample data
cd backend
node seedDatabase.js
```

### Issue 3: CORS Error
**Cause:** Frontend URL not in allowed origins

**Fix:**
Edit `backend/.env`:
```env
ALLOWED_ORIGINS=http://localhost:3000
```

### Issue 4: Chart Not Showing
**Cause:** API returning empty array

**Fix:**
Check MongoDB has `pastOrders` collection with data:
```javascript
// In MongoDB Compass or Atlas
db.pastOrders.countDocuments()
```

### Issue 5: Currency Format Wrong
**Cause:** Browser locale settings

**Fix:**
The code uses `en-US` locale by default, which is correct.

---

## 📊 Sample API Responses

### Monthly Revenue Response
```json
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

### Total Orders Response
```json
{
  "success": true,
  "data": {
    "revenue": 831578.4,
    "orderCount": 45,
    "description": "All time revenue"
  }
}
```

### Low Stock Response
```json
{
  "success": true,
  "data": {
    "count": 3,
    "items": [
      {
        "itemId": "P001",
        "name": "Water Pump",
        "quantity": 2
      }
    ],
    "threshold": 3
  }
}
```

### Total Items Response
```json
{
  "success": true,
  "data": {
    "count": 8,
    "categoryBreakdown": [
      { "_id": "Pumps", "count": 3 },
      { "_id": "Motors", "count": 2 }
    ],
    "description": "In inventory"
  }
}
```

### Monthly Graph Response
```json
{
  "success": true,
  "data": [
    { "month": "Jan", "revenue": 0 },
    { "month": "Feb", "revenue": 0 },
    { "month": "Mar", "revenue": 0 },
    { "month": "Apr", "revenue": 0 },
    { "month": "May", "revenue": 0 },
    { "month": "Jun", "revenue": 0 },
    { "month": "Jul", "revenue": 0 },
    { "month": "Aug", "revenue": 0 },
    { "month": "Sep", "revenue": 0 },
    { "month": "Oct", "revenue": 831578.4 },
    { "month": "Nov", "revenue": 0 },
    { "month": "Dec", "revenue": 0 }
  ]
}
```

---

## 🎯 Expected Dashboard Values

Based on sample data in the screenshot:

| Metric | Expected Value |
|--------|---------------|
| Monthly Revenue | LKR 831,578.40 |
| Total Orders | LKR 831,578.40 |
| Low Stock Items | 3 |
| Total Items | 8 |

**Note:** Your values will differ based on your actual database data.

---

## 🔧 Development Tools

### Backend Tools
- **View Logs:** Check terminal where `npm start` is running
- **API Testing:** Use Postman or browser
- **Database:** MongoDB Compass or Atlas web interface

### Frontend Tools
- **Console:** Press F12 → Console tab
- **Network:** F12 → Network tab (see API calls)
- **React DevTools:** Chrome extension (optional)

### Debugging Commands

```powershell
# Check backend health
curl http://localhost:5000/health

# Check frontend port
netstat -ano | findstr :3000

# Check backend port
netstat -ano | findstr :5000

# View frontend .env
Get-Content frontend\.env

# View backend .env
Get-Content backend\.env
```

---

## 📱 Mobile Testing

### Using Browser DevTools
1. Press F12
2. Click device toolbar icon (top-left)
3. Select a mobile device
4. Verify dashboard is responsive

### Expected Mobile Behavior
- Cards stack vertically (1 column)
- Chart remains full width
- Text sizes adjust appropriately
- Touch interactions work (hover = tap)

---

## 🚀 Performance Testing

### Load Time Goals
- Initial page load: < 2 seconds
- API responses: < 500ms each
- Chart rendering: < 100ms

### Check Performance
```javascript
// In browser console
performance.measure('dashboard-load');
```

---

## 💡 Tips

1. **Keep terminals open:** Don't close backend/frontend terminals
2. **Use auto-refresh:** Frontend auto-reloads on code changes
3. **Check both terminals:** Errors appear in respective terminals
4. **Clear cache:** Hard refresh (Ctrl+Shift+R) if issues persist
5. **Check MongoDB:** Ensure database has data

---

## 📞 Getting Help

If you encounter issues:

1. **Check error messages** in terminal and browser console
2. **Verify servers are running** on correct ports
3. **Test API endpoints directly** using browser or PowerShell
4. **Check database connection** in MongoDB Atlas
5. **Review documentation** in DASHBOARD_IMPLEMENTATION.md

---

## ✨ Success Indicators

You've successfully implemented the dashboard when:
- ✅ Backend runs without errors
- ✅ Frontend shows dashboard page
- ✅ All 5 API endpoints work
- ✅ 4 cards display data
- ✅ Chart shows 12 months
- ✅ Values formatted correctly
- ✅ Hover tooltips work
- ✅ Design matches reference image

---

**Ready to test?** Start with Step 1 above! 🚀
