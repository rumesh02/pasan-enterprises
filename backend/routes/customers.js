const express = require('express');
const router = express.Router();
const {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerStats
} = require('../controllers/customersController');

// @route   GET /api/customers/stats
// @desc    Get customer statistics
// @access  Public
router.get('/stats', getCustomerStats);

// @route   GET /api/customers
// @desc    Get all customers
// @access  Public
router.get('/', getAllCustomers);

// @route   GET /api/customers/:id
// @desc    Get single customer by ID
// @access  Public
router.get('/:id', getCustomerById);

// @route   POST /api/customers
// @desc    Create new customer
// @access  Public
router.post('/', createCustomer);

// @route   PUT /api/customers/:id
// @desc    Update customer
// @access  Public
router.put('/:id', updateCustomer);

// @route   DELETE /api/customers/:id
// @desc    Delete customer
// @access  Public
router.delete('/:id', deleteCustomer);

module.exports = router;