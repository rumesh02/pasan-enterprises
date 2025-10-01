const PastOrder = require('../models/PastOrder');

// @desc    Get all past orders
// @route   GET /api/past-orders
// @access  Public
const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const customerId = req.query.customerId;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const status = req.query.status;
    const search = req.query.search;

    // Build query
    let query = {};
    
    if (customerId) {
      query.customerId = customerId;
    }
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (status && status !== 'all') {
      query.orderStatus = status;
    }
    
    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { 'customerInfo.name': { $regex: search, $options: 'i' } },
        { 'customerInfo.phone': { $regex: search, $options: 'i' } },
        { 'items.name': { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination and populate customer
    const orders = await PastOrder.find(query)
      .populate('customerId', 'name phone email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination info
    const total = await PastOrder.countDocuments(query);

    res.json({
      success: true,
      count: orders.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single order by ID
// @route   GET /api/past-orders/:id
// @access  Public
const getOrderById = async (req, res) => {
  try {
    const order = await PastOrder.findById(req.params.id)
      .populate('customerId', 'name phone email nic totalOrders totalSpent')
      .populate('items.machineId', 'itemId name category');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get order by order ID
// @route   GET /api/past-orders/order/:orderId
// @access  Public
const getOrderByOrderId = async (req, res) => {
  try {
    const order = await PastOrder.findOne({ orderId: req.params.orderId })
      .populate('customerId', 'name phone email nic')
      .populate('items.machineId', 'itemId name category');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order by orderId:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update order status
// @route   PATCH /api/past-orders/:id/status
// @access  Public
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus, notes } = req.body;

    const updateData = {};
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (notes !== undefined) updateData.notes = notes;

    const order = await PastOrder.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('customerId', 'name phone email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Error updating order:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors
      });
    }
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get orders statistics
// @route   GET /api/past-orders/stats
// @access  Public
const getOrderStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Total orders and revenue
    const totalOrders = await PastOrder.countDocuments();
    const totalRevenue = await PastOrder.aggregate([
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);

    // Today's stats
    const todayOrders = await PastOrder.countDocuments({
      createdAt: { $gte: startOfDay }
    });
    const todayRevenue = await PastOrder.aggregate([
      { $match: { createdAt: { $gte: startOfDay } } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);

    // This month's stats
    const monthOrders = await PastOrder.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    const monthRevenue = await PastOrder.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);

    // Top selling items
    const topItems = await PastOrder.aggregate([
      { $unwind: "$items" },
      { 
        $group: { 
          _id: "$items.name", 
          totalSold: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.subtotal" }
        } 
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    // Recent orders
    const recentOrders = await PastOrder.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderId customerInfo.name total orderStatus createdAt');

    res.json({
      success: true,
      data: {
        overview: {
          totalOrders,
          totalRevenue: totalRevenue[0]?.total || 0,
          todayOrders,
          todayRevenue: todayRevenue[0]?.total || 0,
          monthOrders,
          monthRevenue: monthRevenue[0]?.total || 0
        },
        topItems,
        recentOrders
      }
    });
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get orders by date range
// @route   GET /api/past-orders/range
// @access  Public
const getOrdersByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const orders = await PastOrder.getOrdersByDateRange(startDate, endDate)
      .populate('customerId', 'name phone')
      .select('orderId customerInfo total orderStatus createdAt');

    const stats = await PastOrder.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$total" },
          averageOrderValue: { $avg: "$total" }
        }
      }
    ]);

    res.json({
      success: true,
      count: orders.length,
      data: orders,
      stats: stats[0] || { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 }
    });
  } catch (error) {
    console.error('Error fetching orders by date range:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete order (soft delete by changing status)
// @route   DELETE /api/past-orders/:id
// @access  Public
const deleteOrder = async (req, res) => {
  try {
    const order = await PastOrder.findByIdAndUpdate(
      req.params.id,
      { orderStatus: 'Cancelled' },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  getOrderByOrderId,
  updateOrderStatus,
  getOrderStats,
  getOrdersByDateRange,
  deleteOrder
};