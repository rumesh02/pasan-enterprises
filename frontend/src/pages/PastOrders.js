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
  // Helper function to format dates as DD/MM/YYYY
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Helper function to format date and time as DD/MM/YYYY HH:MM
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [returningItem, setReturningItem] = useState(null); // Track which item is being returned
  const [showReturnModal, setShowReturnModal] = useState(false); // Show return quantity modal
  const [returnModalData, setReturnModalData] = useState(null); // {orderId, machineId, itemName, maxQty, currentReturned}
  const [returnQuantity, setReturnQuantity] = useState(1); // Quantity to return
  
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
      const response = await pastOrdersAPI.getAll({ limit: 500 }); // Request a high limit to get all orders
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

  // Handle item return
  const handleReturnItem = (orderId, machineId, itemName, totalQuantity, returnedQuantity = 0) => {
    const availableToReturn = totalQuantity - returnedQuantity;
    
    if (availableToReturn <= 0) {
      alert('All units of this item have already been returned.');
      return;
    }

    // Show modal for quantity selection
    setReturnModalData({
      orderId,
      machineId,
      itemName,
      totalQuantity,
      returnedQuantity,
      availableToReturn
    });
    setReturnQuantity(availableToReturn === 1 ? 1 : 1); // Default to 1
    setShowReturnModal(true);
  };

  // Confirm and process the return
  const confirmReturnItem = async () => {
    if (!returnModalData) return;

    const { orderId, machineId, itemName, availableToReturn } = returnModalData;

    if (returnQuantity < 1 || returnQuantity > availableToReturn) {
      alert(`Please enter a valid quantity between 1 and ${availableToReturn}`);
      return;
    }

    try {
      setReturningItem(`${orderId}-${machineId}`);
      setShowReturnModal(false);
      
      const response = await pastOrdersAPI.returnItem(orderId, { 
        machineId,
        returnQuantity: parseInt(returnQuantity)
      });
      
      if (response.data.success) {
        alert(
          `✅ Item returned successfully!\n\n` +
          `Item: ${itemName}\n` +
          `Returned Quantity: ${returnQuantity}\n` +
          `Stock Updated: ${response.data.data.updatedStock.machineName} (+${returnQuantity})`
        );
        
        // Refresh orders list
        await loadOrders();
        
        // Update selected order if it's the one being viewed
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(response.data.data.order);
        }
      } else {
        alert('Failed to return item: ' + (response.data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error returning item:', err);
      const errorInfo = handleApiError(err);
      alert('Error returning item: ' + (errorInfo.message || 'Unknown error'));
    } finally {
      setReturningItem(null);
      setReturnModalData(null);
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

  // Format order ID to show number and date separately
  const formatOrderId = (orderId) => {
    if (!orderId) return 'N/A';
    
    // Extract parts from format: ORD-YYYYMMDD-NUMBER
    const parts = orderId.split('-');
    if (parts.length !== 3) return orderId;
    
    const dateStr = parts[1]; // YYYYMMDD
    const orderNum = parts[2]; // NUMBER
    
    // Format date as DD/MM/YYYY
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const formattedDate = `${day}/${month}/${year}`;
    
    return `${orderNum} | ${formattedDate}`;
  };

  // Calculate warranty expiry date and remaining time
  const getWarrantyInfo = (orderDate, warrantyMonths) => {
    const soldDate = new Date(orderDate);
    const expiryDate = new Date(soldDate);
    expiryDate.setMonth(expiryDate.getMonth() + warrantyMonths);
    
    const today = new Date();
    const daysRemaining = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    
    const isExpired = daysRemaining < 0;
    const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 30;
    
    return {
      expiryDate,
      daysRemaining: Math.abs(daysRemaining),
      isExpired,
      isExpiringSoon,
      formattedExpiry: formatDate(expiryDate)
    };
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
        ? formatCurrency(filteredOrders.reduce((sum, order) => sum + (order.finalTotal || order.total || 0), 0))
        : formatCurrency(0),
      icon: CalculatorIcon,
      gradient: 'from-orange-500 to-orange-600'
    },
    {
      title: 'Total Revenue This Year',
      value: thisYearOrders.length > 0
        ? formatCurrency(thisYearOrders.reduce((sum, order) => sum + (order.finalTotal || order.total || 0), 0))
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
            <div className="animate-spin-fast rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                            Order {formatOrderId(order.orderId)}
                          </h3>
                          <div className="flex items-center space-x-4 mt-1">
                            <div className="flex items-center space-x-2">
                              <UserIcon className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-600">{order.customerInfo.name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CalendarDaysIcon className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-600">
                                {formatDateTime(order.createdAt)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CurrencyDollarIcon className="w-4 h-4 text-slate-400" />
                              <span className="text-sm font-medium text-slate-900">
                                {formatCurrency(order.finalTotal || order.total)}
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
                          <div className="space-y-3">
                            {order.items.map((item, index) => {
                              const isReturning = returningItem === `${order._id}-${item.machineId}`;
                              const isReturned = item.returned === true;
                              
                              return (
                              <div key={index} className={`p-3 rounded-lg border ${
                                isReturned ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'
                              }`}>
                                {/* Returned Badge */}
                                {isReturned && (
                                  <div className="mb-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-600 text-white">
                                    <XCircleIcon className="w-3 h-3 mr-1" />
                                    Returned
                                  </div>
                                )}
                                
                                <div className="flex justify-between mb-2">
                                  <span className={`font-medium text-slate-800 ${isReturned ? 'line-through opacity-60' : ''}`}>
                                    {item.name} × {item.quantity}
                                  </span>
                                  <span className={`text-slate-900 font-semibold ${isReturned ? 'line-through opacity-60' : ''}`}>
                                    {formatCurrency(item.totalWithVAT || item.subtotal)}
                                  </span>
                                </div>
                                <div className={`space-y-1 text-xs text-slate-600 ${isReturned ? 'opacity-60' : ''}`}>
                                  <div className="flex justify-between">
                                    <span>Unit Price (incl. VAT):</span>
                                    <span>{formatCurrency(item.unitPrice)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Machine Price ({item.quantity}x):</span>
                                    <span>{formatCurrency(item.subtotal)}</span>
                                  </div>
                                  <div className="flex justify-between text-blue-600">
                                    <span>VAT ({item.vatPercentage || 0}%):</span>
                                    <span>{formatCurrency(item.vatAmount || 0)}</span>
                                  </div>
                                  {item.warrantyMonths !== undefined && (() => {
                                    const warrantyInfo = getWarrantyInfo(order.createdAt, item.warrantyMonths);
                                    return (
                                      <>
                                        <div className="flex justify-between">
                                          <span className="text-slate-600">Warranty:</span>
                                          <span className="text-slate-900">{item.warrantyMonths} months</span>
                                        </div>
                                        <div className={`flex justify-between font-medium ${
                                          warrantyInfo.isExpired ? 'text-red-600' : 
                                          warrantyInfo.isExpiringSoon ? 'text-orange-600' : 
                                          'text-green-600'
                                        }`}>
                                          <span>
                                            {warrantyInfo.isExpired ? 'Expired:' : 'Expires:'}
                                          </span>
                                          <span>{warrantyInfo.formattedExpiry}</span>
                                        </div>
                                        <div className={`flex justify-between text-xs ${
                                          warrantyInfo.isExpired ? 'text-red-500' : 
                                          warrantyInfo.isExpiringSoon ? 'text-orange-500' : 
                                          'text-green-500'
                                        }`}>
                                          <span>
                                            {warrantyInfo.isExpired ? 
                                              `Expired ${warrantyInfo.daysRemaining} days ago` : 
                                              `${warrantyInfo.daysRemaining} days remaining`
                                            }
                                          </span>
                                        </div>
                                      </>
                                    );
                                  })()}
                                </div>
                                
                                {/* Return Item Button */}
                                {!isReturned && order.orderStatus !== 'Cancelled' && (
                                  <div className="mt-3 pt-3 border-t border-slate-200">
                                    {/* Show partial return info if some units returned */}
                                    {item.returnedQuantity > 0 && item.returnedQuantity < item.quantity && (
                                      <div className="mb-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700">
                                        <div className="flex justify-between">
                                          <span>Partially Returned:</span>
                                          <span className="font-semibold">{item.returnedQuantity} of {item.quantity} units</span>
                                        </div>
                                        <div className="flex justify-between mt-1">
                                          <span>Remaining:</span>
                                          <span className="font-semibold">{item.quantity - item.returnedQuantity} units</span>
                                        </div>
                                      </div>
                                    )}
                                    <button
                                      onClick={() => handleReturnItem(order._id, item.machineId, item.name, item.quantity, item.returnedQuantity || 0)}
                                      disabled={isReturning}
                                      className="w-full px-3 py-2 bg-red-50 text-red-600 border border-red-300 rounded-lg hover:bg-red-100 hover:border-red-400 transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                    >
                                      {isReturning ? (
                                        <>
                                          <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                          </svg>
                                          Returning...
                                        </>
                                      ) : (
                                        <>
                                          <XCircleIcon className="w-4 h-4 mr-2" />
                                          Return Item
                                        </>
                                      )}
                                    </button>
                                  </div>
                                )}
                                
                                {/* Return Info */}
                                {isReturned && item.returnedAt && (
                                  <div className="mt-3 pt-3 border-t border-red-200">
                                    <div className="flex items-center justify-between text-xs text-red-600">
                                      <div className="flex items-center">
                                        <ClockIcon className="w-3 h-3 mr-1" />
                                        <span>Fully Returned on {formatDate(item.returnedAt)}</span>
                                      </div>
                                      <span className="font-semibold">{item.returnedQuantity || item.quantity} units</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                            })}
                            
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
                              <div className="flex justify-between text-sm text-slate-600">
                                <span>Subtotal (Machine Prices):</span>
                                <span>{formatCurrency(order.subtotal || 0)}</span>
                              </div>
                              <div className="flex justify-between text-sm text-blue-600">
                                <span>Total VAT:</span>
                                <span>{formatCurrency(order.vatAmount || 0)}</span>
                              </div>
                              <div className="flex justify-between text-sm font-medium text-slate-700">
                                <span>Total Before Discount:</span>
                                <span>{formatCurrency(order.totalBeforeDiscount || (order.subtotal + (order.vatAmount || 0)))}</span>
                              </div>
                              {order.discountPercentage > 0 && (
                                <div className="flex justify-between text-sm text-green-600">
                                  <span>Discount ({order.discountPercentage}%):</span>
                                  <span>-{formatCurrency(order.discountAmount || 0)}</span>
                                </div>
                              )}
                              {order.extrasTotal > 0 && (
                                <div className="flex justify-between text-sm text-slate-600">
                                  <span>Extra Charges:</span>
                                  <span>{formatCurrency(order.extrasTotal)}</span>
                                </div>
                              )}
                              <div className="flex justify-between font-bold text-base border-t border-slate-300 pt-1">
                                <span>Final Total:</span>
                                <span className="text-green-600">{formatCurrency(order.finalTotal || order.total)}</span>
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
                Order Details - {formatOrderId(selectedOrder.orderId)}
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
                    {formatDateTime(selectedOrder.createdAt)}
                  </span>
                </div>
                <span className="text-lg font-bold text-slate-900">
                  {formatCurrency(selectedOrder.finalTotal || selectedOrder.total)}
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
                  {selectedOrder.items.map((item, index) => {
                    const isReturning = returningItem === `${selectedOrder._id}-${item.machineId}`;
                    const isReturned = item.returned === true;
                    
                    return (
                    <div key={index} className={`border rounded-xl p-4 ${
                      isReturned ? 'bg-red-50 border-red-300' : 'border-slate-200 bg-white'
                    }`}>
                      {/* Returned Badge */}
                      {isReturned && (
                        <div className="mb-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-600 text-white">
                          <XCircleIcon className="w-4 h-4 mr-2" />
                          Item Returned
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className={isReturned ? 'opacity-60' : ''}>
                          <p className="font-medium text-slate-900">{item.name}</p>
                          <p className="text-sm text-slate-500">Item ID: {item.itemId}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-lg ${isReturned ? 'line-through text-slate-400' : ''}`}>
                            {formatCurrency(item.totalWithVAT || item.subtotal)}
                          </p>
                          <p className="text-xs text-slate-500">Total with VAT</p>
                        </div>
                      </div>
                      
                      <div className={`grid grid-cols-2 gap-3 text-sm bg-slate-50 p-3 rounded-lg ${isReturned ? 'opacity-60' : ''}`}>
                        <div>
                          <p className="text-slate-500">Quantity:</p>
                          <p className="font-medium">{item.quantity}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Unit Price:</p>
                          <p className="font-medium">{formatCurrency(item.unitPrice)}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Machine Price ({item.quantity}x):</p>
                          <p className="font-medium">{formatCurrency(item.subtotal)}</p>
                        </div>
                        <div>
                          <p className="text-blue-600">VAT ({item.vatPercentage || 0}%):</p>
                          <p className="font-medium text-blue-600">{formatCurrency(item.vatAmount || 0)}</p>
                        </div>
                        {item.warrantyMonths !== undefined && (() => {
                          const warrantyInfo = getWarrantyInfo(selectedOrder.createdAt, item.warrantyMonths);
                          return (
                            <>
                              <div className="col-span-2 border-t border-slate-200 pt-2 mt-2">
                                <p className="text-slate-700 font-medium mb-2">Warranty Information</p>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <p className="text-slate-500">Duration:</p>
                                    <p className="font-medium">{item.warrantyMonths} months</p>
                                  </div>
                                  <div>
                                    <p className={warrantyInfo.isExpired ? 'text-red-600' : warrantyInfo.isExpiringSoon ? 'text-orange-600' : 'text-green-600'}>
                                      {warrantyInfo.isExpired ? 'Expired:' : 'Expires:'}
                                    </p>
                                    <p className={`font-medium ${warrantyInfo.isExpired ? 'text-red-600' : warrantyInfo.isExpiringSoon ? 'text-orange-600' : 'text-green-600'}`}>
                                      {warrantyInfo.formattedExpiry}
                                    </p>
                                  </div>
                                  <div className="col-span-2">
                                    <div className={`px-3 py-2 rounded-lg text-center font-medium ${
                                      warrantyInfo.isExpired ? 'bg-red-100 text-red-700' : 
                                      warrantyInfo.isExpiringSoon ? 'bg-orange-100 text-orange-700' : 
                                      'bg-green-100 text-green-700'
                                    }`}>
                                      {warrantyInfo.isExpired ? 
                                        `Expired ${warrantyInfo.daysRemaining} days ago` : 
                                        `${warrantyInfo.daysRemaining} days remaining`
                                      }
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                      
                      {/* Return Item Button */}
                      {!isReturned && selectedOrder.orderStatus !== 'Cancelled' && (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                          {/* Show partial return info if some units returned */}
                          {item.returnedQuantity > 0 && item.returnedQuantity < item.quantity && (
                            <div className="mb-3 p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-700">
                              <div className="flex justify-between">
                                <span>Partially Returned:</span>
                                <span className="font-semibold">{item.returnedQuantity} of {item.quantity} units</span>
                              </div>
                              <div className="flex justify-between mt-1">
                                <span>Remaining:</span>
                                <span className="font-semibold">{item.quantity - item.returnedQuantity} units</span>
                              </div>
                            </div>
                          )}
                          <button
                            onClick={() => handleReturnItem(selectedOrder._id, item.machineId, item.name, item.quantity, item.returnedQuantity || 0)}
                            disabled={isReturning}
                            className="w-full px-4 py-2 bg-red-50 text-red-600 border border-red-300 rounded-lg hover:bg-red-100 hover:border-red-400 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                          >
                            {isReturning ? (
                              <>
                                <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing Return...
                              </>
                            ) : (
                              <>
                                <XCircleIcon className="w-5 h-5 mr-2" />
                                Return Item
                              </>
                            )}
                          </button>
                        </div>
                      )}
                      
                      {/* Return Information */}
                      {isReturned && item.returnedAt && (
                        <div className="mt-4 pt-4 border-t border-red-200">
                          <div className="flex items-center text-sm text-red-600">
                            <ClockIcon className="w-4 h-4 mr-2" />
                            <span>Returned on {formatDateTime(item.returnedAt)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                  })}
                  
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
                      <div className="flex justify-between text-sm text-slate-600">
                        <span>Subtotal (Machine Prices):</span>
                        <span>{formatCurrency(selectedOrder.subtotal || 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-blue-600">
                        <span>Total VAT:</span>
                        <span>{formatCurrency(selectedOrder.vatAmount || 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-medium text-slate-700">
                        <span>Total Before Discount:</span>
                        <span>{formatCurrency(selectedOrder.totalBeforeDiscount || (selectedOrder.subtotal + (selectedOrder.vatAmount || 0)))}</span>
                      </div>
                      {selectedOrder.discountPercentage > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Discount ({selectedOrder.discountPercentage}%):</span>
                          <span>-{formatCurrency(selectedOrder.discountAmount || 0)}</span>
                        </div>
                      )}
                      {selectedOrder.extrasTotal > 0 && (
                        <div className="flex justify-between text-sm text-slate-600">
                          <span>Extra Charges:</span>
                          <span>{formatCurrency(selectedOrder.extrasTotal)}</span>
                        </div>
                      )}
                    </div>
                    <div className="border-t border-slate-300 pt-2">
                      <div className="flex justify-between items-center text-xl font-bold text-slate-800">
                        <span>Final Total:</span>
                        <span className="text-green-600">{formatCurrency(selectedOrder.finalTotal || selectedOrder.total)}</span>
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

      {/* Return Quantity Modal */}
      {showReturnModal && returnModalData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                <XCircleIcon className="w-7 h-7 mr-2 text-red-600" />
                Return Item
              </h2>
              <button
                onClick={() => {
                  setShowReturnModal(false);
                  setReturnModalData(null);
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
              >
                <XCircleIcon className="w-6 h-6 text-slate-500" />
              </button>
            </div>

            {/* Item Details */}
            <div className="mb-6 p-4 bg-slate-50 rounded-lg">
              <h3 className="font-semibold text-slate-800 mb-3">{returnModalData.itemName}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Quantity:</span>
                  <span className="font-semibold text-slate-900">{returnModalData.totalQuantity} units</span>
                </div>
                {returnModalData.returnedQuantity > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Already Returned:</span>
                    <span className="font-semibold text-orange-600">{returnModalData.returnedQuantity} units</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="text-slate-600">Available to Return:</span>
                  <span className="font-bold text-green-600">{returnModalData.availableToReturn} units</span>
                </div>
              </div>
            </div>

            {/* Quantity Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                How many units do you want to return?
              </label>
              <input
                type="number"
                min="1"
                max={returnModalData.availableToReturn}
                value={returnQuantity}
                onChange={(e) => setReturnQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-lg font-semibold text-center"
              />
              <div className="mt-2 flex justify-between text-xs text-slate-500">
                <span>Minimum: 1</span>
                <span>Maximum: {returnModalData.availableToReturn}</span>
              </div>
            </div>

            {/* Quick Select Buttons */}
            {returnModalData.availableToReturn > 1 && (
              <div className="mb-6">
                <p className="text-sm text-slate-600 mb-2">Quick select:</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setReturnQuantity(1)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    1 unit
                  </button>
                  {returnModalData.availableToReturn >= 2 && (
                    <button
                      onClick={() => setReturnQuantity(Math.floor(returnModalData.availableToReturn / 2))}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors duration-200"
                    >
                      Half
                    </button>
                  )}
                  <button
                    onClick={() => setReturnQuantity(returnModalData.availableToReturn)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    All ({returnModalData.availableToReturn})
                  </button>
                </div>
              </div>
            )}

            {/* Warning Message */}
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>⚠️ Warning:</strong> This will return {returnQuantity} unit{returnQuantity > 1 ? 's' : ''} to inventory. This action cannot be undone.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowReturnModal(false);
                  setReturnModalData(null);
                }}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmReturnItem}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium flex items-center justify-center"
              >
                <XCircleIcon className="w-5 h-5 mr-2" />
                Confirm Return
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PastOrders;
