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
    const startOfPreviousMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfPreviousMonth = new Date(currentYear, currentMonth, 0);

    // OPTIMIZED: Run all queries in parallel with Promise.all
    const [
      orderStats,
      machineCount,
      customerCount
    ] = await Promise.all([
      // Single aggregation for all order-related stats
      PastOrder.aggregate([
        {
          $facet: {
            // Yearly stats
            yearly: [
              { $match: { createdAt: { $gte: startOfYear } } },
              { $group: { _id: null, revenue: { $sum: "$total" }, count: { $sum: 1 } } }
            ],
            // Current month stats
            currentMonth: [
              { $match: { createdAt: { $gte: startOfMonth } } },
              { $group: { _id: null, revenue: { $sum: "$total" }, count: { $sum: 1 } } }
            ],
            // Previous month stats
            previousMonth: [
              { 
                $match: { 
                  createdAt: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth } 
                } 
              },
              { $group: { _id: null, revenue: { $sum: "$total" }, count: { $sum: 1 } } }
            ],
            // Top selling items this month
            topItems: [
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
            ]
          }
        }
      ]),
      // Simple counts in parallel
      Machine.countDocuments(),
      Customer.countDocuments()
    ]);

    // Extract results from aggregation
    const yearlyData = orderStats[0].yearly[0] || { revenue: 0, count: 0 };
    const currentMonthData = orderStats[0].currentMonth[0] || { revenue: 0, count: 0 };
    const previousMonthData = orderStats[0].previousMonth[0] || { revenue: 0, count: 0 };
    const topItems = orderStats[0].topItems || [];

    // Calculate growth percentages
    const revenueGrowth = previousMonthData.revenue > 0 
      ? ((currentMonthData.revenue - previousMonthData.revenue) / previousMonthData.revenue * 100).toFixed(1)
      : currentMonthData.revenue > 0 ? 100 : 0;

    const ordersGrowth = previousMonthData.count > 0 
      ? ((currentMonthData.count - previousMonthData.count) / previousMonthData.count * 100).toFixed(1)
      : currentMonthData.count > 0 ? 100 : 0;

    // Calculate average order value
    const avgOrderValue = currentMonthData.count > 0 
      ? (currentMonthData.revenue / currentMonthData.count).toFixed(0)
      : 0;

    res.json({
      success: true,
      data: {
        topCards: {
          totalRevenueYear: yearlyData.revenue,
          totalOrdersYear: yearlyData.count,
          totalMachines: machineCount,
          totalCustomers: customerCount
        },
        thisMonth: {
          totalOrders: currentMonthData.count,
          revenue: currentMonthData.revenue,
          growth: {
            orders: parseFloat(ordersGrowth),
            revenue: parseFloat(revenueGrowth)
          },
          avgOrderValue: parseFloat(avgOrderValue),
          completedOrders: Math.floor(currentMonthData.count * 0.95),
          processingOrders: currentMonthData.count - Math.floor(currentMonthData.count * 0.95),
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