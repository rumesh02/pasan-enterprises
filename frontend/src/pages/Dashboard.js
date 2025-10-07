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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setPartialErrors([]);
      const failed = [];

      const endpoints = [
        { key: 'monthlyRevenue', url: '/dashboard/monthly-revenue', setter: setMonthlyRevenue },
        { key: 'totalOrders', url: '/dashboard/total-orders', setter: setTotalOrders },
        { key: 'lowStock', url: '/dashboard/low-stock', setter: setLowStock },
        { key: 'totalItems', url: '/dashboard/total-items', setter: setTotalItems },
        { key: 'monthlyGraph', url: '/dashboard/monthly-graph', setter: setMonthlyGraph },
      ];

      for (const ep of endpoints) {
        try {
          const res = await api.get(ep.url);
          if (res.data.success) ep.setter(res.data.data);
          else failed.push(ep.key);
        } catch (err) {
          console.error(`❌ ${ep.key} failed:`, err.message, 'URL:', err.config?.url);
          failed.push(ep.key);
        }
      }

      if (failed.length > 0) setPartialErrors(failed);
      setLoading(false);
    };

    fetchData();
  }, []);

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'LKR 0.00';
    return `LKR ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center text-red-600">
      Error loading dashboard: {error}
    </div>
  );

  const maxRevenue = monthlyGraph.length > 0 ? Math.max(...monthlyGraph.map(d => d.revenue)) : 0;

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 to-slate-100">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>

      {partialErrors.length > 0 && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded">
          Warning: Some data could not be loaded: {partialErrors.join(', ')}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Cards */}
        <Card icon={<CurrencyDollarIcon />} color="green" title="Monthly Revenue" value={monthlyRevenue?.revenue} />
        <Card icon={<ShoppingCartIcon />} color="blue" title="Total Orders" value={totalOrders?.revenue} />
        <Card icon={<ExclamationTriangleIcon />} color="red" title="Low Stock Items" value={lowStock?.count} />
        <Card icon={<ChartBarIcon />} color="purple" title="Total Items" value={totalItems?.count} />
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <ChartBarIcon className="w-6 h-6 mr-2 text-blue-600" /> Monthly Revenue Overview
        </h2>
        {monthlyGraph.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-500">No data available</div>
        ) : (
          <div className="flex items-end justify-between h-64">
            {monthlyGraph.map((d, i) => {
              const hPercent = maxRevenue > 0 ? (d.revenue / maxRevenue) * 100 : 0;
              return (
                <div key={i} className="flex flex-col items-center flex-1">
                  <div className={`w-8 rounded-t ${d.revenue > 0 ? 'bg-blue-500' : 'bg-slate-200'}`} style={{ height: `${Math.max(hPercent, 5)}%` }} />
                  <span className="text-xs mt-1">{d.month}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Small reusable Card component
const Card = ({ icon: Icon, color, title, value }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
    <div className={`p-3 rounded-xl shadow-md bg-gradient-to-br from-${color}-500 to-${color}-600 mb-4`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <h3 className="text-3xl font-bold mb-2">{value ?? 0}</h3>
    <p className="text-slate-600 text-sm font-medium">{title}</p>
  </div>
);

export default Dashboard;
