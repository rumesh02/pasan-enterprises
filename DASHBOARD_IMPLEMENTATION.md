# Dashboard Implementation Guide

## Overview
This document explains the new dashboard implementation matching the reference design with real-time statistics and monthly revenue visualization.

## Features Implemented

### 📊 Dashboard Statistics Cards
The dashboard displays four key metric cards:

1. **Monthly Revenue (Green)** - Total revenue for the current month
2. **Total Orders (Blue)** - All-time revenue from all orders
3. **Low Stock Items (Red)** - Count of items with quantity < 3
4. **Total Items (Purple)** - Total number of items in inventory

### 📈 Monthly Revenue Chart
- Bar chart showing revenue for all 12 months of 2025
- Interactive tooltips on hover
- Color-coded bars (blue gradient)
- Responsive layout

---

## Backend Implementation

### API Endpoints Created

All endpoints are prefixed with `/api/dashboard/`

#### 1. GET `/api/dashboard/monthly-revenue`
Returns total revenue for the current month.

**Response:**
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

#### 2. GET `/api/dashboard/total-orders`
Returns total revenue from all orders (all-time).

**Response:**
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

#### 3. GET `/api/dashboard/low-stock`
Returns count of machines where quantity < 3.

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 3,
    "items": [
      { "itemId": "P001", "name": "Water Pump", "quantity": 2 },
      { "itemId": "M015", "name": "Motor", "quantity": 1 }
    ],
    "threshold": 3
  }
}
```

#### 4. GET `/api/dashboard/total-items`
Returns total number of items in inventory.

**Response:**
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

#### 5. GET `/api/dashboard/monthly-graph`
Returns monthly revenue data for the entire year (2025).

**Response:**
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

## Controller Code

### File: `backend/controllers/dashboardController.js`

The controller implements five main functions:

```javascript
const Machine = require('../models/Machine');
const PastOrder = require('../models/PastOrder');

// 1. Get monthly revenue for current month
const getMonthlyRevenue = async (req, res) => {
  // Calculates sum of finalTotal for current month orders
}

// 2. Get total orders revenue (all-time)
const getTotalOrders = async (req, res) => {
  // Calculates sum of finalTotal for all orders
}

// 3. Get low stock items (quantity < 3)
const getLowStock = async (req, res) => {
  // Counts machines with quantity < 3
}

// 4. Get total items in inventory
const getTotalItems = async (req, res) => {
  // Counts all machines in database
}

// 5. Get monthly graph data for the year
const getMonthlyGraph = async (req, res) => {
  // Generates revenue data for all 12 months of 2025
}
```

### Key Implementation Details

**Revenue Calculation:**
- Uses `finalTotal` field from PastOrder model
- `finalTotal = subtotal + VAT - discount + extras`
- Fallback to `total` field if `finalTotal` is not available

**Date Handling:**
- Uses JavaScript Date objects for month/year calculations
- Filters orders based on `createdAt` field
- Handles month boundaries correctly

**Performance:**
- Uses `.lean()` for faster queries
- Parallel fetching with `Promise.all()`
- Efficient array operations with `.reduce()`

---

## Frontend Implementation

### File: `frontend/src/pages/Dashboard.js`

### Component Structure

```javascript
const Dashboard = () => {
  // State management for all metrics
  const [monthlyRevenue, setMonthlyRevenue] = useState(null);
  const [totalOrders, setTotalOrders] = useState(null);
  const [lowStock, setLowStock] = useState(null);
  const [totalItems, setTotalItems] = useState(null);
  const [monthlyGraph, setMonthlyGraph] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all data on mount
  useEffect(() => {
    // Parallel API calls with Promise.all()
  }, []);

  return (
    // Dashboard UI
  );
}
```

### Currency Formatting

```javascript
const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'LKR 0.00';
  return `LKR ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};
```

**Output Example:** `LKR 831,578.40`

### Chart Implementation

The monthly revenue chart is implemented with:
- **Height Calculation:** Bars scale proportionally to max revenue
- **Responsive Design:** Flex layout adapts to screen size
- **Tooltips:** Hover effects show exact values
- **Color Coding:** Blue gradient for revenue bars
- **Zero Handling:** Shows minimal bar for visibility

```javascript
const heightPercentage = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0;
const displayHeight = data.revenue > 0 ? Math.max(heightPercentage, 5) : 2;
```

### Styling

**Colors:**
- Monthly Revenue: Green gradient (`from-green-500 to-green-600`)
- Total Orders: Blue gradient (`from-blue-500 to-blue-600`)
- Low Stock: Red gradient (`from-red-500 to-red-600`)
- Total Items: Purple gradient (`from-purple-500 to-purple-600`)

**Layout:**
- Responsive grid: 1 column (mobile) → 4 columns (desktop)
- Card shadows with hover effects
- Rounded corners (`rounded-2xl`)
- Clean spacing with Tailwind utility classes

---

## Database Models

### PastOrder Model
```javascript
{
  orderId: String,
  customerId: ObjectId,
  items: [orderItemSchema],
  extras: [extraChargeSchema],
  subtotal: Number,
  vatAmount: Number,
  totalBeforeDiscount: Number,
  discountAmount: Number,
  extrasTotal: Number,
  total: Number,
  finalTotal: Number,  // Used for revenue calculations
  createdAt: Date,     // Used for date filtering
  // ... other fields
}
```

### Machine Model
```javascript
{
  itemId: String,
  name: String,
  category: String,
  description: String,
  price: Number,
  quantity: Number,    // Used for low stock check
  // ... other fields
}
```

---

## Testing the Implementation

### 1. Start Backend Server
```bash
cd backend
npm start
```

Server should start on `http://localhost:5000`

### 2. Test API Endpoints

**Using Browser or Postman:**
- `http://localhost:5000/api/dashboard/monthly-revenue`
- `http://localhost:5000/api/dashboard/total-orders`
- `http://localhost:5000/api/dashboard/low-stock`
- `http://localhost:5000/api/dashboard/total-items`
- `http://localhost:5000/api/dashboard/monthly-graph`

**Using curl:**
```bash
curl http://localhost:5000/api/dashboard/monthly-revenue
curl http://localhost:5000/api/dashboard/total-orders
curl http://localhost:5000/api/dashboard/low-stock
curl http://localhost:5000/api/dashboard/total-items
curl http://localhost:5000/api/dashboard/monthly-graph
```

### 3. Start Frontend
```bash
cd frontend
npm start
```

Frontend should open at `http://localhost:3000`

### 4. View Dashboard
Navigate to the Dashboard page and verify:
- ✅ All four metric cards display correct values
- ✅ Values are formatted as "LKR 123,456.78"
- ✅ Monthly chart shows 12 bars (Jan-Dec)
- ✅ Hover tooltips work correctly
- ✅ Loading state appears while fetching
- ✅ Error handling works if backend is down

---

## Environment Configuration

Ensure your `.env` file in the backend contains:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000
```

And in `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## Troubleshooting

### Issue: Dashboard shows "Loading..." forever
**Solution:** Check if backend server is running on port 5000

### Issue: CORS errors in browser console
**Solution:** Verify `ALLOWED_ORIGINS` in backend `.env` file

### Issue: All values showing 0
**Solution:** Check if there's data in MongoDB collections:
- Run `PastOrder.countDocuments()` 
- Run `Machine.countDocuments()`

### Issue: "Cannot read property 'revenue' of null"
**Solution:** API response format mismatch. Check backend response structure.

---

## Future Enhancements

Potential improvements for the dashboard:

1. **Real-time Updates:** WebSocket integration for live data
2. **Date Range Filter:** Allow users to select custom date ranges
3. **Export Data:** Download charts as PDF/PNG
4. **Comparison View:** Compare current vs previous month
5. **Customer Analytics:** Top customers, repeat buyers
6. **Product Analytics:** Best-selling items, category breakdown
7. **Profit Margins:** Show profit alongside revenue
8. **Predictive Analytics:** Forecast future revenue trends

---

## Code Quality

### Best Practices Followed
- ✅ Error handling with try-catch blocks
- ✅ Loading states for better UX
- ✅ Responsive design for all screen sizes
- ✅ Clean code with proper comments
- ✅ Consistent naming conventions
- ✅ Modular controller functions
- ✅ Lean queries for performance
- ✅ Proper HTTP status codes

### Performance Optimizations
- Parallel API calls with `Promise.all()`
- MongoDB aggregation pipeline
- Lean queries (no Mongoose overhead)
- Client-side caching with React state
- Efficient array methods (reduce, filter, map)

---

## Support

If you encounter any issues:
1. Check browser console for errors
2. Check backend terminal for error logs
3. Verify MongoDB connection
4. Test API endpoints directly
5. Clear browser cache and reload

---

## Summary

The dashboard implementation provides:
- **4 Key Metrics:** Monthly revenue, total orders, low stock, total items
- **Visual Chart:** Monthly revenue bar chart for 2025
- **5 API Endpoints:** RESTful backend services
- **Responsive UI:** Works on mobile, tablet, and desktop
- **Real-time Data:** Fetches latest data from MongoDB
- **Professional Design:** Matches the reference image

All endpoints use the `finalTotal` field from orders and properly handle VAT, discounts, and extras. The frontend provides a clean, modern interface with loading states, error handling, and hover interactions.
