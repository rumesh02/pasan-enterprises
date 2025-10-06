const Machine = require('../models/Machine');
const Customer = require('../models/Customer');
const PastOrder = require('../models/PastOrder');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Public
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    // Calculate date ranges
    const startOfYear = new Date(currentYear, 0, 1);
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    
    // Get previous month for growth calculation
    const startOfPreviousMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfPreviousMonth = new Date(currentYear, currentMonth, 0);

    // Total revenue this year
    const yearlyRevenue = await PastOrder.aggregate([
      { $match: { createdAt: { $gte: startOfYear } } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);

    // Total orders this year
    const yearlyOrders = await PastOrder.countDocuments({
      createdAt: { $gte: startOfYear }
    });

    // Total machines count
    const totalMachines = await Machine.countDocuments();

    // Total customers count
    const totalCustomers = await Customer.countDocuments();

    // This month stats
    const monthlyRevenue = await PastOrder.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);

    const monthlyOrders = await PastOrder.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    // Previous month stats for growth calculation
    const previousMonthRevenue = await PastOrder.aggregate([
      { 
        $match: { 
          createdAt: { 
            $gte: startOfPreviousMonth, 
            $lte: endOfPreviousMonth 
          } 
        } 
      },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);

    const previousMonthOrders = await PastOrder.countDocuments({
      createdAt: { 
        $gte: startOfPreviousMonth, 
        $lte: endOfPreviousMonth 
      }
    });

    // Calculate growth percentages
    const currentMonthRevenue = monthlyRevenue[0]?.total || 0;
    const prevMonthRevenue = previousMonthRevenue[0]?.total || 0;
    const revenueGrowth = prevMonthRevenue > 0 
      ? ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue * 100).toFixed(1)
      : currentMonthRevenue > 0 ? 100 : 0;

    const currentMonthOrders = monthlyOrders;
    const prevMonthOrders = previousMonthOrders;
    const ordersGrowth = prevMonthOrders > 0 
      ? ((currentMonthOrders - prevMonthOrders) / prevMonthOrders * 100).toFixed(1)
      : currentMonthOrders > 0 ? 100 : 0;

    // Calculate average order value
    const avgOrderValue = currentMonthOrders > 0 
      ? (currentMonthRevenue / currentMonthOrders).toFixed(0)
      : 0;

    // Top selling items this month
    const topItems = await PastOrder.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.subtotal" }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      data: {
        topCards: {
          totalRevenueYear: yearlyRevenue[0]?.total || 0,
          totalOrdersYear: yearlyOrders,
          totalMachines: totalMachines,
          totalCustomers: totalCustomers
        },
        thisMonth: {
          totalOrders: currentMonthOrders,
          revenue: currentMonthRevenue,
          growth: {
            orders: parseFloat(ordersGrowth),
            revenue: parseFloat(revenueGrowth)
          },
          avgOrderValue: parseFloat(avgOrderValue),
          completedOrders: Math.floor(currentMonthOrders * 0.95), // Assuming 95% completion rate
          processingOrders: currentMonthOrders - Math.floor(currentMonthOrders * 0.95),
          topItems: topItems
        }
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

// @desc    Get monthly revenue data for the last 12 months
// @route   GET /api/dashboard/monthly-revenue
// @access  Public
const getMonthlyRevenue = async (req, res) => {
  try {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    // Generate 12 months of data ending with current month
    const monthlyData = [];
    
    for (let i = 11; i >= 0; i--) {
      let targetMonth = currentMonth - i;
      let targetYear = currentYear;
      
      // Handle year boundary
      if (targetMonth < 0) {
        targetMonth += 12;
        targetYear--;
      }
      
      const startOfMonth = new Date(targetYear, targetMonth, 1);
      const endOfMonth = new Date(targetYear, targetMonth + 1, 0);
      
      // Get revenue for this month
      const monthRevenue = await PastOrder.aggregate([
        { 
          $match: { 
            createdAt: { 
              $gte: startOfMonth, 
              $lte: endOfMonth 
            } 
          } 
        },
        { $group: { _id: null, total: { $sum: "$total" } } }
      ]);

      // Get order count for this month
      const monthOrders = await PastOrder.countDocuments({
        createdAt: { 
          $gte: startOfMonth, 
          $lte: endOfMonth 
        }
      });

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      monthlyData.push({
        month: monthNames[targetMonth],
        year: targetYear,
        revenue: monthRevenue[0]?.total || 0,
        orders: monthOrders,
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