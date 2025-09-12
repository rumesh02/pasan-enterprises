import React from 'react';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  TruckIcon, 
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

const Dashboard = () => {
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
      title: 'Pending Orders',
      value: '23',
      change: '-5.1%',
      changeType: 'negative',
      icon: TruckIcon,
      gradient: 'from-orange-500 to-orange-600'
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { action: 'New item added', item: 'Hydraulic Pump HP-2000', time: '2 hours ago', type: 'add' },
              { action: 'Item sold', item: 'Industrial Motor IM-500', time: '4 hours ago', type: 'sell' },
              { action: 'Stock updated', item: 'Steel Pipes SP-100', time: '6 hours ago', type: 'update' },
              { action: 'Low stock alert', item: 'Bearing Set BS-250', time: '8 hours ago', type: 'alert' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className={`w-3 h-3 rounded-full ${
                  activity.type === 'add' ? 'bg-green-500' :
                  activity.type === 'sell' ? 'bg-blue-500' :
                  activity.type === 'update' ? 'bg-orange-500' :
                  'bg-red-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-slate-800 font-medium">{activity.action}</p>
                  <p className="text-slate-600 text-sm">{activity.item}</p>
                </div>
                <span className="text-slate-500 text-sm">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { title: 'Add New Item', icon: '➕', color: 'from-green-500 to-green-600' },
              { title: 'Process Sale', icon: '🛒', color: 'from-blue-500 to-blue-600' },
              { title: 'Update Stock', icon: '📦', color: 'from-orange-500 to-orange-600' },
              { title: 'Generate Report', icon: '📊', color: 'from-purple-500 to-purple-600' }
            ].map((action, index) => (
              <button key={index} className={`p-4 rounded-xl bg-gradient-to-r ${action.color} text-white hover:scale-105 transition-all duration-200 shadow-lg`}>
                <div className="text-2xl mb-2">{action.icon}</div>
                <div className="text-sm font-medium">{action.title}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
