const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getMonthlyRevenue
} = require('../controllers/dashboardController');

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Public
router.get('/stats', getDashboardStats);

// @route   GET /api/dashboard/monthly-revenue
// @desc    Get monthly revenue data for the last 12 months
// @access  Public
router.get('/monthly-revenue', getMonthlyRevenue);

module.exports = router;