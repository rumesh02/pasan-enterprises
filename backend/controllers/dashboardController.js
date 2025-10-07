const Machine = require('../models/Machine');
const Customer = require('../models/Customer');
const PastOrder = require('../models/PastOrder');

// @desc    Get simple dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Public
const getDashboardStats = async (req, res) => {
  try {
    // SIMPLE APPROACH - Just get basic counts
    const [
      totalOrders,
      totalMachines,
      totalCustomers,
      allOrders
    ] = await Promise.all([
      PastOrder.countDocuments(),
      Machine.countDocuments(),
      Customer.countDocuments(),
      PastOrder.find().select('total createdAt').lean()
    ]);

    // Calculate total revenue from all orders
    const totalRevenue = allOrders.reduce((sum, order) => sum + (order.total || 0), 0);

    // Get current month data
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const thisMonthOrders = allOrders.filter(order => 
      new Date(order.createdAt) >= startOfMonth
    );
    
    const monthlyRevenue = thisMonthOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const monthlyOrderCount = thisMonthOrders.length;

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        totalMachines,
        totalCustomers,
        monthlyRevenue,
        monthlyOrders: monthlyOrderCount
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
};

// @desc    Get monthly revenue (simplified)
// @route   GET /api/dashboard/monthly-revenue
// @access  Public
const getMonthlyRevenue = async (req, res) => {
  try {
    // Get all orders with date and total
    const allOrders = await PastOrder.find().select('total createdAt').lean();

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    // Month names
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Generate last 12 months data
    const monthlyData = [];
    
    for (let i = 11; i >= 0; i--) {
      let targetMonth = currentMonth - i;
      let targetYear = currentYear;
      
      if (targetMonth < 0) {
        targetMonth += 12;
        targetYear--;
      }

      // Filter orders for this month
      const monthStart = new Date(targetYear, targetMonth, 1);
      const monthEnd = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);
      
      const monthOrders = allOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= monthStart && orderDate <= monthEnd;
      });

      const revenue = monthOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      
      monthlyData.push({
        month: monthNames[targetMonth],
        year: targetYear,
        revenue: revenue,
        orders: monthOrders.length,
        isCurrentMonth: targetYear === currentYear && targetMonth === currentMonth
      });
    }

    res.json({
      success: true,
      data: monthlyData
    });

  } catch (error) {
    console.error('Error fetching monthly revenue:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching monthly revenue data',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats,
  getMonthlyRevenue
};