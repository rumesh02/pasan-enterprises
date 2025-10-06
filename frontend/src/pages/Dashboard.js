import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  CalendarDaysIcon,
  UsersIcon,
  CogIcon,
  TrendingUpIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { dashboardAPI, handleApiError } from '../services/apiService';

const Dashboard = () => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch dashboard stats and monthly revenue in parallel
        const [statsResponse, revenueResponse] = await Promise.all([
          dashboardAPI.getStats(),
          dashboardAPI.getMonthlyRevenue()
        ]);

        if (statsResponse.data.success) {
          setDashboardStats(statsResponse.data.data);
        }

        if (revenueResponse.data.success) {
          setMonthlyRevenue(revenueResponse.data.data);
        }

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        const errorInfo = handleApiError(err);
        setError(errorInfo.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Format large numbers
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Generate stats for top cards
  const getTopCardStats = () => {
    if (!dashboardStats) return [];

    return [
      {
        title: 'Total Revenue This Year',
        value: formatCurrency(dashboardStats.topCards.totalRevenueYear),
        icon: CurrencyDollarIcon,
        gradient: 'from-green-500 to-green-600'
      },
      {
        title: 'Total Orders This Year',
        value: dashboardStats.topCards.totalOrdersYear.toLocaleString(),
        icon: ChartBarIcon,
        gradient: 'from-blue-500 to-blue-600'
      },
      {
        title: 'Total Machines',
        value: dashboardStats.topCards.totalMachines.toLocaleString(),
        icon: CogIcon,
        gradient: 'from-purple-500 to-purple-600'
      },
      {
        title: 'Total Customers',
        value: dashboardStats.topCards.totalCustomers.toLocaleString(),
        icon: UsersIcon,
        gradient: 'from-orange-500 to-orange-600'
      }
    ];
  };

  // Get the maximum value for scaling the bar chart
  const maxRevenue = monthlyRevenue.length > 0 
    ? Math.max(...monthlyRevenue.map(item => item.revenue))
    : 0;

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <h3 className="font-bold">Error loading dashboard</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const topCardStats = getTopCardStats();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-slate-600 mt-2">Overview of your business management system</p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {topCardStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient} shadow-lg`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">{stat.value}</h3>
              <p className="text-slate-600 text-sm">{stat.title}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* This Month Orders Details */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center">
            <CalendarDaysIcon className="w-6 h-6 mr-2 text-purple-600" />
            This Month Overview
          </h3>
          <div className="mb-4">
            <div className="text-2xl font-bold text-purple-700">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
          {dashboardStats && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-purple-700">Total Orders</span>
                  <span className="text-2xl font-bold text-purple-800">
                    {dashboardStats.thisMonth.totalOrders}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-purple-700">Revenue</span>
                  <span className="text-lg font-semibold text-purple-800">
                    {formatCurrency(dashboardStats.thisMonth.revenue)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-purple-700">Growth</span>
                  <div className="flex items-center">
                    {dashboardStats.thisMonth.growth.revenue >= 0 ? (
                      <ArrowUpIcon className="w-4 h-4 text-green-600 mr-1" />
                    ) : (
                      <ArrowDownIcon className="w-4 h-4 text-red-600 mr-1" />
                    )}
                    <span className={`text-sm font-bold ${
                      dashboardStats.thisMonth.growth.revenue >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {Math.abs(dashboardStats.thisMonth.growth.revenue)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Monthly Revenue Bar Chart */}
        <div className="lg:col-span-2 bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
            <ChartBarIcon className="w-6 h-6 mr-2 text-blue-600" />
            Monthly Revenue Overview (Last 12 Months)
          </h3>
          
          <div className="space-y-4">
            {/* Legend */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded mr-2"></div>
                  <span className="text-slate-600">Revenue</span>
                </div>
              </div>
              <div className="text-slate-500">
                Max: {formatCurrency(maxRevenue)}
              </div>
            </div>

            {/* Bar Chart */}
            <div className="flex items-end justify-between h-48 bg-gradient-to-t from-slate-50 to-transparent rounded-lg p-4 border">
              {monthlyRevenue.length === 0 ? (
                <div className="flex items-center justify-center w-full h-full text-slate-500">
                  <div className="text-center">
                    <div className="text-lg mb-2">📊</div>
                    <div>Loading chart data...</div>
                  </div>
                </div>
              ) : (
                monthlyRevenue.map((data, index) => {
                  // Ensure minimum visible height even for zero values
                  const revenueHeight = maxRevenue > 0 ? (data.revenue / maxRevenue) * 85 : 0;
                  const displayHeight = data.revenue > 0 ? Math.max(revenueHeight, 8) : 3;
                  
                  return (
                    <div key={index} className="flex flex-col items-center space-y-2 flex-1 group">
                      {/* Revenue Bar Container */}
                      <div className="relative flex items-end" style={{ height: '180px' }}>
                        <div 
                          className={`w-8 rounded-t group-hover:shadow-lg transition-all duration-300 ${
                            data.revenue === 0 ? 'bg-slate-300' : ''
                          } ${
                            data.isCurrentMonth 
                              ? 'bg-gradient-to-t from-green-500 to-green-400' 
                              : 'bg-gradient-to-t from-blue-500 to-blue-400'
                          }`}
                          style={{ height: `${displayHeight}px` }}
                        >
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                            <div className="bg-slate-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                              <div>{formatCurrency(data.revenue)}</div>
                              <div>{data.orders} orders</div>
                              <div className="text-slate-300">{data.month} {data.year}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Month Label */}
                      <div className="text-center">
                        <div className={`text-xs font-medium ${
                          data.isCurrentMonth ? 'text-green-600' : 'text-slate-600'
                        }`}>
                          {data.month}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            {/* Bottom info */}
            <div className="flex justify-between items-center text-xs text-slate-500 mt-2">
              <span>Hover over bars for details</span>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded mr-1"></div>
                <span>Current Month</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
