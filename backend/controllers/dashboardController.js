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

    // Calculate start date (12 months ago)
    let startYear = currentYear;
    let startMonth = currentMonth - 11;
    if (startMonth < 0) {
      startMonth += 12;
      startYear--;
    }
    const startDate = new Date(startYear, startMonth, 1);

    // Use single aggregation query for all months
    const monthlyResults = await PastOrder.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startDate } 
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Create a map for quick lookup
    const dataMap = {};
    monthlyResults.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      dataMap[key] = {
        revenue: item.revenue,
        orders: item.orders
      };
    });

    // Generate complete 12-month array
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = [];
    
    for (let i = 11; i >= 0; i--) {
      let targetMonth = currentMonth - i;
      let targetYear = currentYear;
      
      if (targetMonth < 0) {
        targetMonth += 12;
        targetYear--;
      }
      
      const key = `${targetYear}-${targetMonth + 1}`; // MongoDB months are 1-indexed
      const data = dataMap[key] || { revenue: 0, orders: 0 };
      
      monthlyData.push({
        month: monthNames[targetMonth],
        year: targetYear,
        revenue: data.revenue,
        orders: data.orders,
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