import React, { useState, useEffect } from 'react';
import api from '../services/apiService';
import { 
  CurrencyDollarIcon, 
  ShoppingCartIcon,
  ExclamationTriangleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [monthlyRevenue, setMonthlyRevenue] = useState(null);
  const [totalOrders, setTotalOrders] = useState(null);
  const [lowStock, setLowStock] = useState(null);
  const [totalItems, setTotalItems] = useState(null);
  const [monthlyGraph, setMonthlyGraph] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [partialErrors, setPartialErrors] = useState([]);

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        setPartialErrors([]);

        console.log('🔄 Dashboard: Starting to fetch data...');
        console.log('📡 API Base URL:', api.defaults.baseURL);
        console.log('🌍 Environment:', process.env.NODE_ENV);
        console.log('🔗 REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

        const failedRequests = [];

        // Fetch Monthly Revenue
        try {
          const response = await api.get('/dashboard/monthly-revenue');
          console.log('✅ Monthly Revenue loaded:', response.data);
          if (response.data.success) {
            setMonthlyRevenue(response.data.data);
          }
        } catch (err) {
          console.error('❌ Monthly Revenue failed:', err.message);
          console.error('   URL attempted:', err.config?.url);
          console.error('   Status:', err.response?.status);
          failedRequests.push('Monthly Revenue');
        }

        // Fetch Total Orders
        try {
          const response = await api.get('/dashboard/total-orders');
          console.log('✅ Total Orders loaded:', response.data);
          if (response.data.success) {
            setTotalOrders(response.data.data);
          }
        } catch (err) {
          console.error('❌ Total Orders failed:', err.message);
          console.error('   URL attempted:', err.config?.url);
          console.error('   Status:', err.response?.status);
          failedRequests.push('Total Orders');
        }

        // Fetch Low Stock
        try {
          const response = await api.get('/dashboard/low-stock');
          console.log('✅ Low Stock loaded:', response.data);
          if (response.data.success) {
            setLowStock(response.data.data);
          }
        } catch (err) {
          console.error('❌ Low Stock failed:', err.message);
          console.error('   URL attempted:', err.config?.url);
          console.error('   Status:', err.response?.status);
          failedRequests.push('Low Stock');
        }

        // Fetch Total Items
        try {
          const response = await api.get('/dashboard/total-items');
          console.log('✅ Total Items loaded:', response.data);
          if (response.data.success) {
            setTotalItems(response.data.data);
          }
        } catch (err) {
          console.error('❌ Total Items failed:', err.message);
          console.error('   URL attempted:', err.config?.url);
          console.error('   Status:', err.response?.status);
          failedRequests.push('Total Items');
        }

        // Fetch Monthly Graph
        try {
          const response = await api.get('/dashboard/monthly-graph');
          console.log('✅ Monthly Graph loaded:', response.data);
          if (response.data.success) {
            setMonthlyGraph(response.data.data);
          }
        } catch (err) {
          console.error('❌ Monthly Graph failed:', err.message);
          console.error('   URL attempted:', err.config?.url);
          console.error('   Status:', err.response?.status);
          failedRequests.push('Monthly Graph');
        }

        // Set partial errors if any requests failed
        if (failedRequests.length > 0) {
          setPartialErrors(failedRequests);
          console.warn('⚠️ Dashboard loaded with some errors:', failedRequests);
        } else {
          console.log('✅ Dashboard: All data loaded successfully!');
        }

      } catch (err) {
        console.error('❌ Critical Dashboard error:', err);
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          config: err.config?.url
        });
        setError(err.response?.data?.message || err.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format currency as "LKR 123,456.78"
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'LKR 0.00';
    return `LKR ${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          <h3 className="font-bold text-lg mb-2">Error loading dashboard</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Calculate max revenue for chart scaling
  const maxRevenue = monthlyGraph.length > 0 
    ? Math.max(...monthlyGraph.map(item => item.revenue))
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-600 mt-2">Business overview and statistics</p>
      </div>

      {/* Partial Errors Warning */}
      {partialErrors.length > 0 && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-4 rounded-lg">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="w-5 h-5 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">Some data could not be loaded</h3>
              <p className="text-sm">Failed to load: {partialErrors.join(', ')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Statistic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Monthly Revenue Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-md">
              <CurrencyDollarIcon className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-800 mb-2 whitespace-nowrap">
            {monthlyRevenue ? formatCurrency(monthlyRevenue.revenue) : 'LKR 0.00'}
          </h3>
          <p className="text-slate-600 text-sm font-medium">Monthly Revenue</p>
          <p className="text-slate-500 text-xs mt-1">This month</p>
        </div>

        {/* Total Orders Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
              <ShoppingCartIcon className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-800 mb-2 whitespace-nowrap">
            {totalOrders ? formatCurrency(totalOrders.revenue) : 'LKR 0.00'}
          </h3>
          <p className="text-slate-600 text-sm font-medium">Total Orders</p>
          <p className="text-slate-500 text-xs mt-1">All time revenue</p>
        </div>

        {/* Low Stock Items Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-md">
              <ExclamationTriangleIcon className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-800 mb-2">
            {lowStock ? lowStock.count : 0}
          </h3>
          <p className="text-slate-600 text-sm font-medium">Low Stock Items</p>
          <p className="text-slate-500 text-xs mt-1">Items with qty &lt; 3</p>
        </div>

        {/* Total Items Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-md">
              <ChartBarIcon className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-800 mb-2">
            {totalItems ? totalItems.count : 0}
          </h3>
          <p className="text-slate-600 text-sm font-medium">Total Items</p>
          <p className="text-slate-500 text-xs mt-1">In inventory</p>
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center mb-6">
          <ChartBarIcon className="w-6 h-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-bold text-slate-800">
            Monthly Revenue Overview (2025)
          </h2>
        </div>

        {/* Chart Legend */}
        <div className="flex items-center justify-end mb-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
            <span className="text-sm text-slate-600">Monthly Revenue</span>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="relative">
          {monthlyGraph.length === 0 ? (
            <div className="flex items-center justify-center h-64 bg-slate-50 rounded-lg">
              <p className="text-slate-500">No data available</p>
            </div>
          ) : (
            <div className="flex items-end justify-between h-64 bg-gradient-to-t from-slate-50 to-transparent rounded-lg p-4">
              {monthlyGraph.map((data, index) => {
                // Calculate bar height (percentage of max)
                const heightPercentage = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0;
                const displayHeight = data.revenue > 0 ? Math.max(heightPercentage, 5) : 2;

                return (
                  <div key={index} className="flex flex-col items-center flex-1 group">
                    {/* Bar Container */}
                    <div className="relative flex items-end mb-2" style={{ height: '200px' }}>
                      <div
                        className={`w-8 rounded-t transition-all duration-300 group-hover:opacity-80 ${
                          data.revenue === 0 
                            ? 'bg-slate-200' 
                            : 'bg-gradient-to-t from-blue-500 to-blue-400'
                        }`}
                        style={{ height: `${displayHeight}%` }}
                        title={`${data.month}: ${formatCurrency(data.revenue)}`}
                      >
                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none">
                          <div className="bg-slate-800 text-white text-xs rounded py-2 px-3 whitespace-nowrap shadow-lg">
                            <div className="font-semibold">{formatCurrency(data.revenue)}</div>
                            <div className="text-slate-300">{data.month}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Month Label */}
                    <div className="text-xs font-medium text-slate-600">
                      {data.month}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Chart Footer */}
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-500">
            Hover over bars to see details • Max: {formatCurrency(maxRevenue)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
