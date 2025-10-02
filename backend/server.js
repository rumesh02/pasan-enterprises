const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import database connection
const connectDB = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/past-orders', pastOrderRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 API available at: http://<EC2_PUBLIC_IP>:${PORT}`);
  console.log(`📚 Health check: http://<EC2_PUBLIC_IP}:${PORT}/health`);
});


module.exports = app;