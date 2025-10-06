import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  ExclamationTriangleIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline';
import { pastOrdersAPI, machineAPI } from '../services/apiService';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for data
  const [pastOrders, setPastOrders] = useState([]);
  const [machines, setMachines] = useState([]);
  
  // State for calculated stats
  const [totalOrders, setTotalOrders] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [monthlyOrders, setMonthlyOrders] = useState([]);

  // Calculate monthly order data for bar chart
  const calculateMonthlyData = useCallback((ordersData) => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    const currentYear = new Date().getFullYear();
    
    // Initialize monthly data
    const monthlyStats = months.map((month, index) => ({
      month,
      monthIndex: index,
      revenue: 0,
      orders: 0
    }));
    
    // Group orders by month
    ordersData.forEach(order => {
      const orderDate = new Date(order.createdAt);
      if (orderDate.getFullYear() === currentYear) {
        const monthIndex = orderDate.getMonth();
        monthlyStats[monthIndex].revenue += (order.finalTotal || order.total || 0);
        monthlyStats[monthIndex].orders += 1;
      }
    });
    
    console.log('📊 Monthly Data Calculated:', monthlyStats);
    console.log('📅 Current Year:', currentYear);
    console.log('📦 Total Orders Processed:', ordersData.length);
    
    return monthlyStats;
  }, []);

  // Calculate all statistics
  const calculateStats = useCallback((ordersData, machinesData) => {
    // 1. Total Orders: Sum all order prices
    const total = ordersData.reduce((sum, order) => sum + (order.finalTotal || order.total || 0), 0);
    setTotalOrders(total);
    
    // 2. Low Stock Count: Count machines with quantity < 3
    const lowStock = machinesData.filter(machine => machine.quantity < 3).length;
    setLowStockCount(lowStock);
    
    // 3. Monthly Revenue: Filter orders by current month and sum prices
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const monthRevenue = ordersData
      .filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
      })
      .reduce((sum, order) => sum + (order.finalTotal || order.total || 0), 0);
    
    setMonthlyRevenue(monthRevenue);
    
    // 4. Total Items: Total number of machines
    setTotalItems(machinesData.length);
    
    // 5. Monthly Orders: Group orders by month and calculate totals
    const monthlyData = calculateMonthlyData(ordersData);
    setMonthlyOrders(monthlyData);
  }, [calculateMonthlyData]);

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch past orders and machines in parallel
        const [ordersResponse, machinesResponse] = await Promise.all([
          pastOrdersAPI.getAll(),
          machineAPI.getAll()
        ]);
        
        console.log('Orders Response:', ordersResponse.data);
        console.log('Machines Response:', machinesResponse.data);
        
        // Extract data
        const ordersData = ordersResponse.data?.data || [];
        const machinesData = machinesResponse.data?.data || [];
        
        console.log('📦 Extracted Orders:', ordersData.length, 'orders');
        console.log('🔧 Extracted Machines:', machinesData.length, 'machines');
        console.log('📋 Sample Order:', ordersData[0]);
        
        setPastOrders(ordersData);
        setMachines(machinesData);
        
        // Perform calculations
        calculateStats(ordersData, machinesData);
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [calculateStats]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Stats configuration
  const stats = [
    {
      title: 'Monthly Revenue',
      value: formatCurrency(monthlyRevenue),
      icon: CurrencyDollarIcon,
      gradient: 'from-green-500 to-green-600',
      description: 'This month'
    },
    {
      title: 'Total Orders',
      value: formatCurrency(totalOrders),
      icon: ShoppingCartIcon,
      gradient: 'from-blue-500 to-blue-600',
      description: 'All time revenue'
    },
    {
      title: 'Low Stock Items',
      value: lowStockCount,
      icon: ExclamationTriangleIcon,
      gradient: 'from-red-500 to-red-600',
      description: 'Items with qty < 3'
    },
    {
      title: 'Total Items',
      value: totalItems,
      icon: ChartBarIcon,
      gradient: 'from-purple-500 to-purple-600',
      description: 'In inventory'
    }
  ];

  // Custom tooltip for bar chart
  const [hoveredMonth, setHoveredMonth] = useState(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-slate-600 mt-2">Overview of your inventory management system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient} shadow-lg`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">{stat.value}</h3>
              <p className="text-slate-600 text-sm font-medium">{stat.title}</p>
              <p className="text-slate-500 text-xs mt-1">{stat.description}</p>
            </div>
          );
        })}
      </div>

      {/* Monthly Revenue Chart */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
          <ChartBarIcon className="w-6 h-6 mr-2 text-blue-600" />
          Monthly Revenue Overview ({new Date().getFullYear()})
        </h3>
        
        {/* Custom Bar Chart */}
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex items-center justify-center space-x-6 text-sm mb-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded mr-2"></div>
              <span className="text-slate-600">Monthly Revenue</span>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="relative bg-gradient-to-t from-slate-50 to-transparent rounded-lg p-6 border border-slate-200">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-slate-500 pr-2 pt-4 pb-12">
              {(() => {
                const maxRevenue = Math.max(...monthlyOrders.map(m => m.revenue), 100000);
                return (
                  <>
                    <span>{formatCurrency(maxRevenue)}</span>
                    <span>{formatCurrency(maxRevenue * 0.75)}</span>
                    <span>{formatCurrency(maxRevenue * 0.5)}</span>
                    <span>{formatCurrency(maxRevenue * 0.25)}</span>
                    <span>Rs. 0</span>
                  </>
                );
              })()}
            </div>

            {/* Bars Container */}
            <div className="ml-20 flex items-end justify-between h-80 gap-2 pt-4 pb-12">
              {monthlyOrders.map((data, index) => {
                const maxRevenue = Math.max(...monthlyOrders.map(m => m.revenue), 1); // At least 1 to avoid division by zero
                const barHeightPercent = data.revenue > 0 ? (data.revenue / maxRevenue) * 100 : 0;
                // Ensure minimum visible height for bars with data
                const displayHeight = data.revenue > 0 ? Math.max(barHeightPercent, 5) : 0;
                
                console.log(`${data.month}: Revenue=${data.revenue}, MaxRevenue=${maxRevenue}, Height=${displayHeight}%`);
                
                return (
                  <div 
                    key={index} 
                    className="flex-1 flex flex-col items-center group relative"
                    onMouseEnter={() => setHoveredMonth(index)}
                    onMouseLeave={() => setHoveredMonth(null)}
                  >
                    {/* Tooltip */}
                    {hoveredMonth === index && (
                      <div className="absolute bottom-full mb-2 bg-white p-3 border border-slate-200 rounded-lg shadow-lg z-10 whitespace-nowrap">
                        <p className="font-semibold text-slate-800 mb-1">{data.month} 2025</p>
                        <p className="text-sm text-blue-600 font-medium">Revenue: {formatCurrency(data.revenue)}</p>
                        <p className="text-sm text-slate-600">Orders: {data.orders}</p>
                      </div>
                    )}

                    {/* Bar */}
                    <div className="w-full flex flex-col items-center justify-end h-full min-w-[20px]">
                      {data.revenue > 0 ? (
                        <div 
                          className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all duration-500 ease-out hover:from-blue-600 hover:to-blue-500 cursor-pointer shadow-md"
                          style={{ 
                            height: `${displayHeight}%`,
                            minHeight: '8px' // Absolute minimum height
                          }}
                        ></div>
                      ) : (
                        <div className="w-full h-1 bg-slate-200 rounded"></div>
                      )}
                    </div>
                    
                    {/* Month Label */}
                    <div className="text-center mt-2">
                      <div className="text-xs font-semibold text-slate-700">{data.month}</div>
                      <div className={`text-xs font-medium ${data.orders > 0 ? 'text-blue-600' : 'text-slate-400'}`}>
                        {data.orders > 0 ? data.orders : '-'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* X-axis line */}
            <div className="ml-20 border-t-2 border-slate-300"></div>
            
            {/* Debug Info */}
            <div className="ml-20 mt-2 text-xs text-slate-500">
              <p>Total data points: {monthlyOrders.length} | 
                 Max Revenue: {formatCurrency(Math.max(...monthlyOrders.map(m => m.revenue), 0))} | 
                 Total Orders: {monthlyOrders.reduce((sum, m) => sum + m.orders, 0)}
              </p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-slate-600">Total Revenue</p>
              <p className="text-lg font-bold text-blue-600">
                {formatCurrency(monthlyOrders.reduce((sum, m) => sum + m.revenue, 0))}
              </p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-slate-600">Total Orders</p>
              <p className="text-lg font-bold text-green-600">
                {monthlyOrders.reduce((sum, m) => sum + m.orders, 0)}
              </p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-slate-600">Avg per Month</p>
              <p className="text-lg font-bold text-purple-600">
                {formatCurrency(monthlyOrders.reduce((sum, m) => sum + m.revenue, 0) / 12)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
