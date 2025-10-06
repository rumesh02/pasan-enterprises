const express = require('express');
const router = express.Router();
const {
  getAllOrders,
  getOrderById,
  getOrderByOrderId,
  updateOrderStatus,
  getOrderStats,
  getOrdersByDateRange,
  deleteOrder,
  returnItem,
  updateOrder
} = require('../controllers/ordersController');

// @route   GET /api/past-orders/stats
// @desc    Get order statistics
// @access  Public
router.get('/stats', getOrderStats);

// @route   GET /api/past-orders/range
// @desc    Get orders by date range
// @access  Public
router.get('/range', getOrdersByDateRange);

// @route   GET /api/past-orders/order/:orderId
// @desc    Get order by order ID
// @access  Public
router.get('/order/:orderId', getOrderByOrderId);

// @route   GET /api/past-orders
// @desc    Get all past orders
// @access  Public
router.get('/', getAllOrders);

// @route   GET /api/past-orders/:id
// @desc    Get single order by ID
// @access  Public
router.get('/:id', getOrderById);

// @route   PATCH /api/past-orders/:id/status
// @desc    Update order status
// @access  Public
router.patch('/:id/status', updateOrderStatus);

// @route   PUT /api/past-orders/return-item/:orderId
// @desc    Return an item from an order
// @access  Public
router.put('/return-item/:orderId', returnItem);

// @route   PUT /api/past-orders/:orderId
// @desc    Update/Edit an order
// @access  Public
router.put('/:orderId', updateOrder);

// @route   DELETE /api/past-orders/:id
// @desc    Cancel order (soft delete)
// @access  Public
router.delete('/:id', deleteOrder);

module.exports = router;