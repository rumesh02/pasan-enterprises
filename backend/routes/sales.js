const express = require('express');
const router = express.Router();
const {
  processSale,
  validateSale,
  getSalesStats
} = require('../controllers/salesController');

// @route   POST /api/sales/validate
// @desc    Validate sale data before processing
// @access  Public
router.post('/validate', validateSale);

// @route   GET /api/sales/stats
// @desc    Get sales statistics
// @access  Public
router.get('/stats', getSalesStats);

// @route   POST /api/sales
// @desc    Process a sale
// @access  Public
router.post('/', processSale);

module.exports = router;