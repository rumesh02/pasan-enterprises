import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  ExclamationTriangleIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [yearlyData, setYearlyData] = useState([]);
  
  // Sample yearly data for the bar graph
  useEffect(() => {
    // Simulate fetching yearly data - you can replace this with actual API calls
    const monthlyOrdersData = [
      { month: 'Jan', orders: 45, revenue: 125000 },
      { month: 'Feb', orders: 52, revenue: 148000 },
      { month: 'Mar', orders: 61, revenue: 167000 },
      { month: 'Apr', orders: 48, revenue: 134000 },
      { month: 'May', orders: 71, revenue: 192000 },
      { month: 'Jun', orders: 66, revenue: 178000 },
      { month: 'Jul', orders: 58, revenue: 156000 },
      { month: 'Aug', orders: 73, revenue: 201000 },
      { month: 'Sep', orders: 69, revenue: 189000 },
      { month: 'Oct', orders: 84, revenue: 235000 },
      { month: 'Nov', orders: 0, revenue: 0 },
      { month: 'Dec', orders: 0, revenue: 0 }
    ];
    setYearlyData(monthlyOrdersData);
  }, []);

  const stats = [
    {
      title: 'Total Inventory Value',
      value: 'Rs. 2,450,000',
      change: '+12.5%',
      changeType: 'positive',
      icon: CurrencyDollarIcon,
      gradient: 'from-green-500 to-green-600'
    },
    {
      title: 'Total Items',
      value: '1,247',
      change: '+8.2%',
      changeType: 'positive',
      icon: ChartBarIcon,
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'This Month Orders',
      value: '84',
      change: '+21.7%',
      changeType: 'positive',
      icon: CalendarDaysIcon,
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Low Stock Items',
      value: '8',
      change: '+2',
      changeType: 'warning',
      icon: ExclamationTriangleIcon,
      gradient: 'from-red-500 to-red-600'
    }
  ];

  // Get the maximum value for scaling the bar chart
  const maxOrders = Math.max(...yearlyData.map(item => item.orders));

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
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                  stat.changeType === 'positive' ? 'text-green-700 bg-green-100' :
                  stat.changeType === 'negative' ? 'text-red-700 bg-red-100' :
                  'text-orange-700 bg-orange-100'
                }`}>
                  {stat.change}
                </span>
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
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
            <CalendarDaysIcon className="w-6 h-6 mr-2 text-purple-600" />
            This Month Orders
          </h3>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-purple-700">Total Orders</span>
                <span className="text-2xl font-bold text-purple-800">84</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-purple-700">Revenue</span>
                <span className="text-lg font-semibold text-purple-800">Rs. 2,35,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-purple-700">Growth</span>
                <span className="text-sm font-bold text-green-600">+21.7% ↗</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Completed</span>
                <div className="flex items-center">
                  <div className="w-20 bg-slate-200 rounded-full h-2 mr-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '95%'}}></div>
                  </div>
                  <span className="text-sm font-medium">80</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Processing</span>
                <div className="flex items-center">
                  <div className="w-20 bg-slate-200 rounded-full h-2 mr-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{width: '5%'}}></div>
                  </div>
                  <span className="text-sm font-medium">4</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Yearly Bar Graph */}
        <div className="lg:col-span-2 bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
            <ChartBarIcon className="w-6 h-6 mr-2 text-blue-600" />
            Monthly Orders Overview (2025)
          </h3>
          
          <div className="space-y-4">
            {/* Legend */}
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded mr-2"></div>
                <span className="text-slate-600">Orders</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-green-600 rounded mr-2"></div>
                <span className="text-slate-600">Revenue (in thousands)</span>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="flex items-end justify-between h-48 bg-gradient-to-t from-slate-50 to-transparent rounded-lg p-4 border">
              {yearlyData.map((data, index) => {
                const orderHeight = maxOrders > 0 ? (data.orders / maxOrders) * 100 : 0;
                const revenueHeight = data.revenue > 0 ? (data.revenue / 250000) * 100 : 0;
                
                return (
                  <div key={index} className="flex flex-col items-center space-y-2 flex-1">
                    {/* Revenue Bar (Background) */}
                    <div className="relative w-6 bg-slate-200 rounded-t">
                      <div 
                        className="bg-gradient-to-t from-green-500 to-green-400 rounded-t transition-all duration-1000 ease-out"
                        style={{ height: `${Math.max(revenueHeight, 5)}%` }}
                      ></div>
                    </div>
                    
                    {/* Orders Bar (Foreground) */}
                    <div className="relative w-4 bg-slate-200 rounded-t -mt-2">
                      <div 
                        className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all duration-1000 ease-out"
                        style={{ height: `${Math.max(orderHeight, 5)}%` }}
                      ></div>
                    </div>
                    
                    {/* Values */}
                    <div className="text-center">
                      <div className="text-xs font-bold text-slate-800">{data.orders}</div>
                      <div className="text-xs text-slate-500">{data.month}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Y-axis labels */}
            <div className="flex justify-between text-xs text-slate-500 mt-2">
              <span>0</span>
              <span className="text-blue-600">Orders: {maxOrders}</span>
              <span className="text-green-600">Revenue: Rs. 2.5L</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
