const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import database connection
const connectDB = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Allow both localhost (development) and production URL
const allowedOrigins = [
  'http://localhost:3000',
  'https://main.d1ukwwdrgqtdby.amplifyapp.com',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.some(allowed => origin.startsWith(allowed.replace(/\/$/, '')))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB Atlas
connectDB();

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Pasan Enterprises API Server is running!',
    status: 'Active',
    timestamp: new Date().toISOString()
  });
});

// Health check route
app.get('/health', (req, res) => {
  const mongoose = require('mongoose');
  res.json({
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// Import route files
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const machineRoutes = require('./routes/machines');
const customerRoutes = require('./routes/customers');
const salesRoutes = require('./routes/sales');
const pastOrderRoutes = require('./routes/pastOrders');
const dashboardRoutes = require('./routes/dashboard');

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/past-orders', pastOrderRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start HTTP server (plain, Nginx will handle HTTPS)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Node server running on port ${PORT}`);
  console.log(`🌐 API available at http://localhost:${PORT}`);
  console.log(`📚 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
