import React, { useState, useEffect } from 'react';
import { 
  ShoppingCartIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  UserIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline';
import { pastOrdersAPI, handleApiError } from '../services/apiService';

const PastOrders = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  // Load orders from backend
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await pastOrdersAPI.getAll();
      console.log('Orders API Response:', response.data);
      
      if (response.data.success) {
        const ordersData = response.data.data || [];
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      } else {
        setError('Failed to load orders');
        setOrders([]);
      }
    } catch (err) {
      console.error('Error loading orders:', err);
      const errorInfo = handleApiError(err);
      setError(errorInfo.message || 'Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = Array.isArray(orders) ? orders.filter(order => {
    const matchesSearch = 
      order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo?.phone?.includes(searchTerm);
    
    let matchesDateRange = true;
    if (fromDate || toDate) {
      const orderDate = new Date(order.createdAt);
      
      if (fromDate) {
        const fromDateTime = new Date(fromDate);
        fromDateTime.setHours(0, 0, 0, 0);
        matchesDateRange = matchesDateRange && orderDate >= fromDateTime;
      }
      
      if (toDate) {
        const toDateTime = new Date(toDate);
        toDateTime.setHours(23, 59, 59, 999);
        matchesDateRange = matchesDateRange && orderDate <= toDateTime;
      }
    }
    
    return matchesSearch && matchesDateRange;
  }) : [];

  // Pagination calculations
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, fromDate, toDate]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'Returned':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return CheckCircleIcon;
      case 'Processing':
        return ClockIcon;
      case 'Cancelled':
        return XCircleIcon;
      case 'Returned':
        return TruckIcon;
      default:
        return DocumentTextIcon;
    }
  };

  const toggleOrderExpansion = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  // Calculate this year's orders
  const currentYear = new Date().getFullYear();
  const thisYearOrders = Array.isArray(orders) ? orders.filter(order => {
    const orderYear = new Date(order.createdAt).getFullYear();
    return orderYear === currentYear;
  }) : [];

  const stats = [
    {
      title: 'Total Orders',
      value: Array.isArray(orders) ? orders.length.toString() : '0',
      icon: ShoppingCartIcon,
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Filtered Orders',
      value: filteredOrders.length.toString(),
      icon: DocumentTextIcon,
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Filtered Orders Revenue',
      value: filteredOrders.length > 0
        ? formatCurrency(filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0))
        : formatCurrency(0),
      icon: CalculatorIcon,
      gradient: 'from-orange-500 to-orange-600'
    },
    {
      title: 'Total Revenue This Year',
      value: thisYearOrders.length > 0
        ? formatCurrency(thisYearOrders.reduce((sum, order) => sum + (order.total || 0), 0))
        : formatCurrency(0),
      icon: CurrencyDollarIcon,
      gradient: 'from-green-500 to-green-600'
    }
  ];

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center">
              <ShoppingCartIcon className="w-8 h-8 mr-3 text-blue-600" />
              Order History
            </h1>
            <p className="text-slate-600 mt-2">Track and manage all customer orders</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient}`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search orders by ID, customer name, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <CalendarDaysIcon className="w-5 h-5 text-slate-400" />
              <label className="text-sm text-slate-600 whitespace-nowrap">From:</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <CalendarDaysIcon className="w-5 h-5 text-slate-400" />
              <label className="text-sm text-slate-600 whitespace-nowrap">To:</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {(fromDate || toDate) && (
              <button
                onClick={() => {
                  setFromDate('');
                  setToDate('');
                }}
                className="px-3 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Clear Dates
              </button>
            )}
          </div>
        </div>
        
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">All Orders</h2>
              <p className="text-slate-600 text-sm mt-1">
                {filteredOrders.length} orders found • Showing {Math.min(startIndex + 1, filteredOrders.length)}-{Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length}
              </p>
            </div>
            {totalPages > 1 && (
              <div className="text-sm text-slate-600">
                Page {currentPage} of {totalPages}
              </div>
            )}
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-slate-600">Loading orders...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCartIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No orders found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {currentOrders.map((order) => {
              const StatusIcon = getStatusIcon(order.orderStatus);
              const isExpanded = expandedOrders.has(order._id);
              
              return (
                <div key={order._id} className="p-6 hover:bg-slate-50 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            Order #{order.orderId}
                          </h3>
                          <div className="flex items-center space-x-4 mt-1">
                            <div className="flex items-center space-x-2">
                              <UserIcon className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-600">{order.customerInfo.name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CalendarDaysIcon className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-600">
                                {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CurrencyDollarIcon className="w-4 h-4 text-slate-400" />
                              <span className="text-sm font-medium text-slate-900">
                                {formatCurrency(order.total)}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                              order.paymentStatus === 'Paid' 
                                ? 'bg-green-100 text-green-800'
                                : order.paymentStatus === 'Pending'
                                ? 'bg-yellow-100 text-yellow-800' 
                                : order.paymentStatus === 'Partial'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              Payment: {order.paymentStatus}
                            </span>
                            {order.processedBy && (
                              <span className="ml-2 text-xs text-slate-500">
                                by {order.processedBy}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {order.orderStatus}
                      </span>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewOrderDetails(order)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          title="View Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => toggleOrderExpansion(order._id)}
                          className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-all duration-200"
                          title={isExpanded ? "Collapse" : "Expand"}
                        >
                          {isExpanded ? (
                            <ChevronUpIcon className="w-4 h-4" />
                          ) : (
                            <ChevronDownIcon className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Customer Info */}
                        <div>
                          <h4 className="font-medium text-slate-900 mb-2">Customer Information</h4>
                          <div className="text-sm text-slate-600 space-y-1">
                            <p><span className="font-medium">Name:</span> {order.customerInfo.name}</p>
                            <p><span className="font-medium">Phone:</span> {order.customerInfo.phone}</p>
                            {order.customerInfo.email && <p><span className="font-medium">Email:</span> {order.customerInfo.email}</p>}
                            {order.customerInfo.nic && <p><span className="font-medium">NIC:</span> {order.customerInfo.nic}</p>}
                          </div>
                        </div>
                        
                        {/* Items */}
                        <div>
                          <h4 className="font-medium text-slate-900 mb-2">Order Items</h4>
                          <div className="space-y-2">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span className="text-slate-600">
                                  {item.name} × {item.quantity}
                                </span>
                                <span className="text-slate-900 font-medium">
                                  {formatCurrency(item.subtotal)}
                                </span>
                              </div>
                            ))}
                            
                            {/* Extras */}
                            {order.extras && order.extras.length > 0 && (
                              <>
                                <div className="border-t border-slate-200 pt-2 mt-2">
                                  <p className="text-xs text-slate-500 font-medium mb-1">EXTRAS:</p>
                                  {order.extras.map((extra, index) => (
                                    <div key={index} className="flex justify-between text-sm">
                                      <span className="text-slate-600">
                                        {extra.description}
                                      </span>
                                      <span className="text-slate-900">
                                        {formatCurrency(extra.amount)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                            
                            <div className="border-t border-slate-200 pt-2 space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>Subtotal:</span>
                                <span>{formatCurrency(order.subtotal || 0)}</span>
                              </div>
                              {order.extrasTotal > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span>Extras:</span>
                                  <span>{formatCurrency(order.extrasTotal)}</span>
                                </div>
                              )}
                              <div className="flex justify-between font-medium text-base border-t border-slate-300 pt-1">
                                <span>Total:</span>
                                <span>{formatCurrency(order.total)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Notes */}
                        {order.notes && (
                          <div className="col-span-1 lg:col-span-2">
                            <h4 className="font-medium text-slate-900 mb-2">Order Notes</h4>
                            <div className="p-3 bg-slate-50 rounded-lg">
                              <p className="text-sm text-slate-600">{order.notes}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Showing {Math.min(startIndex + 1, filteredOrders.length)}-{Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length} orders
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">
                Order Details - #{selectedOrder.orderId}
              </h2>
              <button
                onClick={() => setShowOrderDetails(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
              >
                <XCircleIcon className="w-6 h-6 text-slate-500" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Order Status and Date */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.orderStatus)}`}>
                    {selectedOrder.orderStatus}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                    selectedOrder.paymentStatus === 'Paid' 
                      ? 'bg-green-100 text-green-800'
                      : selectedOrder.paymentStatus === 'Pending'
                      ? 'bg-yellow-100 text-yellow-800' 
                      : selectedOrder.paymentStatus === 'Partial'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedOrder.paymentStatus}
                  </span>
                  <span className="text-slate-600">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </span>
                </div>
                <span className="text-lg font-bold text-slate-900">
                  {formatCurrency(selectedOrder.total)}
                </span>
              </div>
              
              {/* Customer Details */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
                  <div>
                    <p className="text-sm text-slate-500">Name</p>
                    <p className="font-medium">{selectedOrder.customerInfo.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Phone</p>
                    <p className="font-medium">{selectedOrder.customerInfo.phone}</p>
                  </div>
                  {selectedOrder.customerInfo.email && (
                    <div>
                      <p className="text-sm text-slate-500">Email</p>
                      <p className="font-medium">{selectedOrder.customerInfo.email}</p>
                    </div>
                  )}
                  {selectedOrder.customerInfo.nic && (
                    <div>
                      <p className="text-sm text-slate-500">NIC</p>
                      <p className="font-medium">{selectedOrder.customerInfo.nic}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Order Items */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                      <div>
                        <p className="font-medium text-slate-900">{item.name}</p>
                        <p className="text-sm text-slate-500">Quantity: {item.quantity} × {formatCurrency(item.unitPrice)} each</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(item.subtotal)}</p>
                        <p className="text-sm text-slate-500">subtotal</p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Extras */}
                  {selectedOrder.extras && selectedOrder.extras.length > 0 && (
                    <>
                      <div className="pt-3 border-t border-slate-200">
                        <h4 className="font-medium text-slate-900 mb-2">Additional Items</h4>
                        {selectedOrder.extras.map((extra, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg mb-2">
                            <div>
                              <p className="text-slate-900">{extra.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(extra.amount)}</p>
                              <p className="text-sm text-slate-500">extra charge</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  
                  {/* Total */}
                  <div className="pt-3 border-t border-slate-300">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(selectedOrder.subtotal || 0)}</span>
                      </div>
                      {selectedOrder.extrasTotal > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Extras:</span>
                          <span>{formatCurrency(selectedOrder.extrasTotal)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-lg font-bold border-t border-slate-300 pt-2">
                        <span>Total Amount:</span>
                        <span>{formatCurrency(selectedOrder.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Notes Section */}
              {selectedOrder.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Order Notes</h3>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-slate-700">{selectedOrder.notes}</p>
                  </div>
                  <div className="mt-2 text-sm text-slate-500">
                    Processed by: {selectedOrder.processedBy || 'System'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PastOrders;
