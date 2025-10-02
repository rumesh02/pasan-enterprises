const express = require('express');
const cors = require('cors');
const fs = require('fs');
const https = require('https');
require('dotenv').config();
const path = require('path');

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
    message: '🚀 Pasan Enterprises API Server is running with HTTPS!',
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

// Load SSL cert and key
const sslOptions = {
  key: fs.readFileSync(path.join('/home/ubuntu/certs/server.key')),
  cert: fs.readFileSync(path.join('/home/ubuntu/certs/server.crt'))
};

// Start HTTPS server
https.createServer(sslOptions, app).listen(PORT, '0.0.0.0', () => {
  console.log(`✅ HTTPS Server running on port ${PORT}`);
  console.log(`🌐 API available at: https://<EC2_PUBLIC_IP>:${PORT}`);
  console.log(`📚 Health check: https://<EC2_PUBLIC_IP>:${PORT}/health`);
});

module.exports = app;
