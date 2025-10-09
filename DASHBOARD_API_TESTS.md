# Dashboard API Testing Guide

## Quick Test Commands

Use these commands to test each dashboard endpoint:

### 1. Monthly Revenue
```bash
curl http://localhost:5000/api/dashboard/monthly-revenue
```

Expected response:
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

### 2. Total Orders
```bash
curl http://localhost:5000/api/dashboard/total-orders
```

Expected response:
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

### 3. Low Stock Items
```bash
curl http://localhost:5000/api/dashboard/low-stock
```

Expected response:
```json
{
  "success": true,
  "data": {
    "count": 3,
    "items": [...],
    "threshold": 3
  }
}
```

### 4. Total Items
```bash
curl http://localhost:5000/api/dashboard/total-items
```

Expected response:
```json
{
  "success": true,
  "data": {
    "count": 8,
    "categoryBreakdown": [...],
    "description": "In inventory"
  }
}
```

### 5. Monthly Graph Data
```bash
curl http://localhost:5000/api/dashboard/monthly-graph
```

Expected response:
```json
{
  "success": true,
  "data": [
    { "month": "Jan", "revenue": 0 },
    { "month": "Feb", "revenue": 0 },
    ...
    { "month": "Oct", "revenue": 831578.4 },
    ...
  ]
}
```

## PowerShell Testing (Windows)

```powershell
# Test all endpoints
Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard/monthly-revenue" | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard/total-orders" | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard/low-stock" | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard/total-items" | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard/monthly-graph" | ConvertTo-Json
```

## Browser Testing

Open these URLs in your browser:
- http://localhost:5000/api/dashboard/monthly-revenue
- http://localhost:5000/api/dashboard/total-orders
- http://localhost:5000/api/dashboard/low-stock
- http://localhost:5000/api/dashboard/total-items
- http://localhost:5000/api/dashboard/monthly-graph

## Frontend Dashboard

Open: http://localhost:3000

Navigate to the Dashboard page and verify:
- ✅ Monthly Revenue card shows correct value
- ✅ Total Orders card shows correct value
- ✅ Low Stock Items shows count
- ✅ Total Items shows count
- ✅ Chart displays 12 months (Jan-Dec)
- ✅ Values formatted as "LKR 123,456.78"
- ✅ Hover tooltips work on chart bars
