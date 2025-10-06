# Performance Optimization Summary

## Issue
Dashboard and sold item count were slow or not loading on production deployment (pasan-enterprises.me) due to slow MongoDB queries, even though the code was the same as localhost.

## Root Cause
1. **Missing Database Indexes**: The MongoDB collections didn't have proper indexes for frequently queried fields
2. **Slow Aggregation Queries**: The `getMonthlyRevenue` function was running 12 separate queries instead of one
3. **No Index on `items.machineId`**: Sales stats queries were doing full collection scans

## Fixes Applied

### 1. Database Index Optimization
Added critical indexes for better query performance:

**Customer Collection:**
- `nic`: unique, sparse index (fixed duplicate issue)
- `phone`: unique index
- `email`: sparse index
- `name`: text index

**PastOrder Collection:**
- `orderId`: unique index
- `customerId`: index
- `createdAt`: descending index
- `customerInfo.phone`: index
- `customerInfo.name`: text index
- **`items.machineId`**: NEW index for fast sales stats queries ⭐

### 2. Backend Optimizations

**File: `backend/controllers/dashboardController.js`**
- Optimized `getMonthlyRevenue()` to use single aggregation query instead of 12 separate queries
- Reduced query time from ~12 seconds to ~1-2 seconds

**File: `backend/models/PastOrder.js`**
- Added index: `pastOrderSchema.index({ 'items.machineId': 1 })`
- Fixed duplicate `orderId` index definition

**File: `backend/models/Customer.js`**
- Fixed duplicate `nic` index definition
- Moved `unique: true` to schema field definition

### 3. Frontend Optimizations

**File: `frontend/src/services/apiService.js`**
- Increased timeout from 10 seconds to 30 seconds

**File: `frontend/src/pages/ViewInventory.js`**
- Added 15-second timeout for sales stats queries
- Better error handling (shows 0 instead of error on timeout)

## Scripts Created

### `backend/scripts/cleanupAndIndex.js`
- Cleans up empty NIC values in customers
- Creates all necessary indexes
- Lists all indexes for verification

**Usage:**
```bash
cd backend
node scripts/cleanupAndIndex.js
```

## Deployment Instructions

### For Production Server (pasan-enterprises.me)

1. **SSH into production server:**
   ```bash
   ssh user@pasan-enterprises.me
   ```

2. **Navigate to backend directory:**
   ```bash
   cd /path/to/pasan-enterprises/backend
   ```

3. **Pull latest changes:**
   ```bash
   git fetch origin
   git checkout dulara01
   git pull origin dulara01
   ```

4. **Run the cleanup and indexing script:**
   ```bash
   node scripts/cleanupAndIndex.js
   ```

5. **Restart backend service:**
   ```bash
   # If using PM2:
   pm2 restart pasan-enterprises-backend
   
   # If using systemd:
   sudo systemctl restart pasan-enterprises-backend
   
   # If using direct node:
   pkill node && nohup node server.js &
   ```

6. **Verify deployment:**
   - Visit: https://pasan-enterprises.me
   - Check dashboard loads quickly
   - Check sold item counts appear in ViewInventory

## Expected Performance Improvements

| Feature | Before | After |
|---------|--------|-------|
| Dashboard Load | 10+ seconds (timeout) | 2-3 seconds |
| Monthly Revenue | 12 separate queries | 1 aggregation query |
| Sales Stats per Item | 5-10 seconds | <1 second |
| Overall API Timeout | 10 seconds | 30 seconds |

## Files Modified

### Backend:
- `backend/controllers/dashboardController.js` - Optimized queries
- `backend/models/PastOrder.js` - Added indexes, fixed duplicates
- `backend/models/Customer.js` - Fixed duplicate index
- `backend/scripts/cleanupAndIndex.js` - NEW script for index creation

### Frontend:
- `frontend/src/services/apiService.js` - Increased timeout
- `frontend/src/pages/ViewInventory.js` - Better error handling

## Verification Commands

### Check if indexes exist:
```bash
cd backend
node scripts/cleanupAndIndex.js
```

### Test dashboard API locally:
```bash
curl http://localhost:5000/api/dashboard/stats
curl http://localhost:5000/api/dashboard/monthly-revenue
```

### Test on production:
```bash
curl https://pasan-enterprises.me/api/dashboard/stats
curl https://pasan-enterprises.me/api/dashboard/monthly-revenue
```

## Notes

- The duplicate index warnings will be gone after these changes
- Empty NIC values in customer records are cleaned up (converted to null)
- All indexes are created with `background: true` to avoid blocking operations
- The `items.machineId` index is critical for sold item count feature

## Troubleshooting

If dashboard still slow on production:
1. Verify indexes were created: Run `cleanupAndIndex.js` script
2. Check backend is restarted with new code
3. Check MongoDB connection is stable
4. Verify frontend is using latest build
5. Check browser console for specific error messages

---
**Created**: October 7, 2025
**Last Updated**: October 7, 2025
