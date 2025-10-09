const Machine = require('../models/Machine');
const Customer = require('../models/Customer');
const PastOrder = require('../models/PastOrder');

// @desc    Get monthly revenue for current month
// @route   GET /api/dashboard/monthly-revenue
// @access  Public
const getMonthlyRevenue = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

    // Get all orders from this month
    const monthOrders = await PastOrder.find({
      createdAt: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    }).select('finalTotal total').lean();

    // Calculate total revenue (use finalTotal which includes VAT, discount, extras)
    const monthlyRevenue = monthOrders.reduce((sum, order) => {
      return sum + (order.finalTotal || order.total || 0);
    }, 0);

    res.json({
      success: true,
      data: {
        revenue: monthlyRevenue,
        orderCount: monthOrders.length,
        month: today.toLocaleString('en-US', { month: 'long' }),
        year: today.getFullYear()
      }
    });

  } catch (error) {
    console.error('Error fetching monthly revenue:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching monthly revenue',
      error: error.message
    });
  }
};

// @desc    Get total revenue from all orders
// @route   GET /api/dashboard/total-orders
// @access  Public
const getTotalOrders = async (req, res) => {
  try {
    // Get all orders
    const allOrders = await PastOrder.find().select('finalTotal total').lean();

    // Calculate total revenue (use finalTotal which includes VAT, discount, extras)
    const totalRevenue = allOrders.reduce((sum, order) => {
      return sum + (order.finalTotal || order.total || 0);
    }, 0);

    res.json({
      success: true,
      data: {
        revenue: totalRevenue,
        orderCount: allOrders.length,
        description: 'All time revenue'
      }
    });

  } catch (error) {
    console.error('Error fetching total orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching total orders',
      error: error.message
    });
  }
};

// @desc    Get low stock items count (quantity < 3)
// @route   GET /api/dashboard/low-stock
// @access  Public
const getLowStock = async (req, res) => {
  try {
    // Count machines with quantity < 3
    const lowStockCount = await Machine.countDocuments({
      quantity: { $lt: 3 }
    });

    // Optional: Get the actual items for reference
    const lowStockItems = await Machine.find({
      quantity: { $lt: 3 }
    }).select('itemId name quantity').lean();

    res.json({
      success: true,
      data: {
        count: lowStockCount,
        items: lowStockItems,
        threshold: 3
      }
    });

  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching low stock items',
      error: error.message
    });
  }
};

// @desc    Get total items in inventory
// @route   GET /api/dashboard/total-items
// @access  Public
const getTotalItems = async (req, res) => {
  try {
    // Count all machines in inventory
    const totalItems = await Machine.countDocuments();

    // Optional: Get category breakdown
    const categoryBreakdown = await Machine.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        count: totalItems,
        categoryBreakdown,
        description: 'In inventory'
      }
    });

  } catch (error) {
    console.error('Error fetching total items:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching total items',
      error: error.message
    });
  }
};

// @desc    Get monthly revenue data for the entire year (bar chart)
// @route   GET /api/dashboard/monthly-graph
// @access  Public
const getMonthlyGraph = async (req, res) => {
  try {
    const today = new Date();
    const currentYear = today.getFullYear();

    // Month names
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Get all orders for the current year
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);

    const allOrders = await PastOrder.find({
      createdAt: {
        $gte: yearStart,
        $lte: yearEnd
      }
    }).select('finalTotal total createdAt').lean();

    // Generate data for all 12 months
    const monthlyData = [];

    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(currentYear, month, 1);
      const monthEnd = new Date(currentYear, month + 1, 0, 23, 59, 59);

      // Filter orders for this month
      const monthOrders = allOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= monthStart && orderDate <= monthEnd;
      });

      // Calculate revenue (use finalTotal which includes VAT, discount, extras)
      const revenue = monthOrders.reduce((sum, order) => {
        return sum + (order.finalTotal || order.total || 0);
      }, 0);

      monthlyData.push({
        month: monthNames[month],
        revenue: revenue
      });
    }

    res.json({
      success: true,
      data: monthlyData
    });

  } catch (error) {
    console.error('Error fetching monthly graph data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching monthly graph data',
      error: error.message
    });
  }
};

module.exports = {
  getMonthlyRevenue,
  getTotalOrders,
  getLowStock,
  getTotalItems,
  getMonthlyGraph
};