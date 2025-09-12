import React, { useState } from 'react';
import { 
  ClockIcon, 
  MagnifyingGlassIcon, 
  EyeIcon, 
  DocumentTextIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const PastOrders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Sample orders data
  const orders = [
    {
      id: 'ORD-2025-001',
      customerName: 'ABC Manufacturing',
      customerEmail: 'contact@abcmanufacturing.com',
      date: '2025-09-12',
      status: 'Completed',
      total: 8500.00,
      items: [
        { name: 'Hydraulic Pump HP-2000', quantity: 2, price: 2500.00 },
        { name: 'Industrial Motor IM-500', quantity: 2, price: 1800.00 }
      ]
    },
    {
      id: 'ORD-2025-002',
      customerName: 'Steel Works Ltd',
      customerEmail: 'orders@steelworks.com',
      date: '2025-09-11',
      status: 'Processing',
      total: 3600.00,
      items: [
        { name: 'Steel Pipes SP-100', quantity: 30, price: 120.00 }
      ]
    },
    {
      id: 'ORD-2025-003',
      customerName: 'Industrial Solutions',
      customerEmail: 'procurement@industrialsolutions.com',
      date: '2025-09-10',
      status: 'Completed',
      total: 1360.00,
      items: [
        { name: 'Hydraulic Valve VL-750', quantity: 2, price: 680.00 }
      ]
    },
    {
      id: 'ORD-2025-004',
      customerName: 'Machinery Corp',
      customerEmail: 'buying@machinerycorp.com',
      date: '2025-09-09',
      status: 'Cancelled',
      total: 4500.00,
      items: [
        { name: 'Bearing Set BS-250', quantity: 10, price: 450.00 }
      ]
    },
    {
      id: 'ORD-2025-005',
      customerName: 'Power Systems Inc',
      customerEmail: 'orders@powersystems.com',
      date: '2025-09-08',
      status: 'Completed',
      total: 5400.00,
      items: [
        { name: 'Industrial Motor IM-500', quantity: 3, price: 1800.00 }
      ]
    }
  ];

  const statuses = ['all', 'Completed', 'Processing', 'Cancelled'];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'Processing': return <ExclamationCircleIcon className="w-5 h-5 text-orange-600" />;
      case 'Cancelled': return <XCircleIcon className="w-5 h-5 text-red-600" />;
      default: return <ClockIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Processing': return 'bg-orange-100 text-orange-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTotalOrders = () => orders.length;
  const getCompletedOrders = () => orders.filter(order => order.status === 'Completed').length;
  const getTotalRevenue = () => orders.filter(order => order.status === 'Completed').reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
          Past Orders
        </h1>
        <p className="text-slate-600 mt-2">View and manage order history</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-slate-800">{getTotalOrders()}</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
              <DocumentTextIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Completed Orders</p>
              <p className="text-2xl font-bold text-slate-800">{getCompletedOrders()}</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
              <CheckCircleIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-slate-800">Rs. {getTotalRevenue().toFixed(2)}</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
              <ClockIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by order ID or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Statuses' : status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800">Order ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800">Total</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">{order.id}</td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-slate-800">{order.customerName}</div>
                      <div className="text-sm text-slate-600">{order.customerEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{order.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">Rs. {order.total.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg">No orders found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">Order Details</h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-slate-400 hover:text-slate-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-slate-600">Order ID</p>
                  <p className="font-semibold text-slate-800">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Date</p>
                  <p className="font-semibold text-slate-800">{selectedOrder.date}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Customer</p>
                  <p className="font-semibold text-slate-800">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Status</p>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedOrder.status)}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-semibold text-slate-800 mb-4">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-800">{item.name}</p>
                        <p className="text-sm text-slate-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-800">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                        <p className="text-sm text-slate-600">Rs. {item.price.toFixed(2)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="flex justify-between items-center text-lg font-bold text-slate-800">
                  <span>Total Amount:</span>
                  <span>Rs. {selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PastOrders;
