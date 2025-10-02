import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShoppingCartIcon, 
  MagnifyingGlassIcon, 
  PlusIcon, 
  MinusIcon, 
  CreditCardIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  CalculatorIcon,
  ReceiptPercentIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { machineAPI, salesAPI, handleApiError } from '../services/apiService';
import { generateInvoice } from '../services/invoiceService';

const SellItem = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [machines, setMachines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [extras, setExtras] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    nic: ''
  });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMachines, setTotalMachines] = useState(0);
  const itemsPerPage = 3;
  
  // VAT and Discount states
  const [vatRate, setVatRate] = useState(15); // 15% VAT
  const [discountPercentage, setDiscountPercentage] = useState(0);

  const fetchMachines = useCallback(async (page = currentPage, category = selectedCategory, search = searchTerm) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: itemsPerPage,
        inStock: true
      };

      if (category !== 'all') {
        params.category = category;
      }

      if (search.trim()) {
        params.search = search.trim();
      }

      const response = await machineAPI.getAll(params);
      if (response.data.success) {
        setMachines(response.data.data);
        setTotalPages(response.data.pages || 1);
        setTotalMachines(response.data.total || 0);
      }
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedCategory, searchTerm, itemsPerPage]);

  // Fetch machines and categories on component mount
  useEffect(() => {
    fetchMachines();
    fetchCategories();
  }, [fetchMachines]);

  // Fetch machines when page, category, or search changes
  useEffect(() => {
    fetchMachines();
  }, [fetchMachines]);

  const fetchCategories = async () => {
    try {
      const response = await machineAPI.getCategories();
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Pagination functions
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleSearchChange = (search) => {
    setSearchTerm(search);
    setCurrentPage(1); // Reset to first page when searching
  };

  const addToCart = (machine) => {
    const existingItem = cart.find(item => item.machineId === machine._id);
    if (existingItem) {
      if (existingItem.quantity < machine.quantity) {
        setCart(cart.map(item =>
          item.machineId === machine._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        setError('Cannot add more items than available in stock');
        setTimeout(() => setError(''), 3000);
      }
    } else {
      setCart([...cart, {
        machineId: machine._id,
        itemId: machine.itemId,
        name: machine.name,
        category: machine.category,
        unitPrice: machine.price,
        quantity: 1,
        availableStock: machine.quantity
      }]);
    }
  };

  const updateCartQuantity = (machineId, change) => {
    setCart(cart.map(item => {
      if (item.machineId === machineId) {
        const newQuantity = item.quantity + change;
        if (newQuantity <= 0) {
          return null;
        }
        if (newQuantity > item.availableStock) {
          setError('Cannot exceed available stock');
          setTimeout(() => setError(''), 3000);
          return item;
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (machineId) => {
    setCart(cart.filter(item => item.machineId !== machineId));
  };

  const addExtra = () => {
    setExtras([...extras, { description: '', amount: 0 }]);
  };

  const updateExtra = (index, field, value) => {
    setExtras(extras.map((extra, i) => {
      if (i === index) {
        return { ...extra, [field]: field === 'amount' ? parseFloat(value) || 0 : value };
      }
      return extra;
    }));
  };

  const removeExtra = (index) => {
    setExtras(extras.filter((_, i) => i !== index));
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);
  };

  const getVATAmount = () => {
    return (getSubtotal() * vatRate) / 100;
  };

  const getTotalBeforeDiscount = () => {
    return getSubtotal() + getVATAmount();
  };

  const getDiscountAmount = () => {
    return (getTotalBeforeDiscount() * discountPercentage) / 100;
  };

  const getExtrasTotal = () => {
    return extras.reduce((total, extra) => total + (extra.amount || 0), 0);
  };

  const getFinalTotal = () => {
    return getTotalBeforeDiscount() - getDiscountAmount() + getExtrasTotal();
  };

  // Function to generate invoice preview (for testing)
  const handleGenerateInvoicePreview = async () => {
    if (cart.length === 0) {
      setError('Please add items to cart before generating invoice preview.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!customerInfo.name?.trim()) {
      setError('Customer name is required for invoice.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      const mockOrderData = {
        orderId: 'PREVIEW-' + Date.now(),
        date: new Date().toISOString()
      };

      const invoiceData = {
        customerInfo: {
          name: customerInfo.name.trim() || 'Sample Customer',
          phone: customerInfo.phone.trim() || '0771234567',
          email: customerInfo.email?.trim() || '',
          nic: customerInfo.nic?.trim() || ''
        },
        items: cart.map(item => ({
          machineId: item.machineId,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        })),
        cart: cart,
        extras: extras.filter(extra => extra.description && extra.amount > 0),
        subtotal: getSubtotal(),
        vatRate: vatRate,
        vatAmount: getVATAmount(),
        discountPercentage: discountPercentage,
        discountAmount: getDiscountAmount(),
        finalTotal: getFinalTotal()
      };

      const invoiceResult = await generateInvoice(invoiceData, mockOrderData);
      if (invoiceResult.success) {
        setSuccessMessage(`Invoice preview generated successfully! Downloaded as ${invoiceResult.filename}`);
      } else {
        setError(`Invoice preview generation failed: ${invoiceResult.message}`);
      }
    } catch (error) {
      console.error('Invoice preview error:', error);
      setError('Failed to generate invoice preview');
    }

    setTimeout(() => {
      setError('');
      setSuccessMessage('');
    }, 5000);
  };



  const validateSale = async () => {
    try {
      const saleData = {
        customerInfo,
        items: cart.map(item => ({
          machineId: item.machineId,
          quantity: item.quantity
        })),
        extras: extras.filter(extra => extra.description && extra.amount > 0)
      };

      console.log('Validating sale with data:', saleData);
      console.log('Customer info:', customerInfo);
      console.log('Cart items:', cart);

      const response = await salesAPI.validate(saleData);
      console.log('Validation response:', response);
      
      if (response.data && response.data.success) {
        // If validation failed, show specific errors
        if (!response.data.data.isValid) {
          const errors = response.data.data.errors || [];
          console.log('Validation errors:', errors);
          setError(`Validation failed: ${errors.join(', ')}`);
        }
        
        return response.data.data.isValid;
      } else {
        console.error('Validation response not successful:', response);
        setError(`Validation failed: ${response.data?.message || 'Unknown error'}`);
        return false;
      }
    } catch (err) {
      console.error('Validation error details:', err);
      console.error('Error response:', err.response?.data);
      
      let errorMessage = 'Unknown validation error';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.errors) {
        errorMessage = Array.isArray(err.response.data.errors) 
          ? err.response.data.errors.join(', ')
          : err.response.data.errors;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(`Validation Error: ${errorMessage}`);
      return false;
    }
  };

  const handleSale = async () => {
    // Clear previous errors
    setError('');
    
    if (cart.length === 0) {
      setError('Please add items to cart before processing sale.');
      setTimeout(() => setError(''), 5000);
      return;
    }

    if (!customerInfo.name?.trim()) {
      setError('Customer name is required.');
      setTimeout(() => setError(''), 5000);
      return;
    }

    if (!customerInfo.phone?.trim()) {
      setError('Customer phone number is required.');
      setTimeout(() => setError(''), 5000);
      return;
    }

    try {
      setProcessing(true);

      // Validate sale first
      const isValid = await validateSale();
      if (!isValid) {
        // Error message is already set in validateSale function
        setProcessing(false);
        return;
      }

      const saleData = {
        customerInfo: {
          name: customerInfo.name.trim(),
          phone: customerInfo.phone.trim(),
          email: customerInfo.email?.trim() || '',
          nic: customerInfo.nic?.trim() || ''
        },
        items: cart.map(item => ({
          machineId: item.machineId,
          quantity: item.quantity
        })),
        extras: extras.filter(extra => extra.description && extra.amount > 0),
        vatRate: vatRate,
        discountPercentage: discountPercentage,
        notes: '',
        processedBy: 'Admin'
      };

      console.log('Processing sale with data:', saleData);
      const response = await salesAPI.process(saleData);
      
      if (response.data.success) {
        const orderData = response.data.data.orderSummary;
        setSuccessMessage(`Sale processed successfully! Order ID: ${orderData.orderId}`);
        
        // Generate and download invoice
        try {
          const invoiceData = {
            customerInfo: saleData.customerInfo,
            items: cart.map(item => ({
              machineId: item.machineId,
              name: item.name,
              quantity: item.quantity,
              unitPrice: item.unitPrice
            })),
            cart: cart, // Include full cart data for invoice generation
            extras: extras.filter(extra => extra.description && extra.amount > 0),
            subtotal: getSubtotal(),
            vatRate: vatRate,
            vatAmount: getVATAmount(),
            discountPercentage: discountPercentage,
            discountAmount: getDiscountAmount(),
            finalTotal: getFinalTotal()
          };

          const invoiceResult = await generateInvoice(invoiceData, orderData);
          if (invoiceResult.success) {
            setSuccessMessage(`Sale processed successfully! Order ID: ${orderData.orderId}. Invoice downloaded as ${invoiceResult.filename}`);
          } else {
            setSuccessMessage(`Sale processed successfully! Order ID: ${orderData.orderId}. Note: Invoice generation failed - ${invoiceResult.message}`);
          }
        } catch (invoiceError) {
          console.error('Invoice generation error:', invoiceError);
          setSuccessMessage(`Sale processed successfully! Order ID: ${orderData.orderId}. Note: Invoice generation failed.`);
        }
        
        // Reset form
        setCart([]);
        setExtras([]);
        setCustomerInfo({ name: '', email: '', phone: '', nic: '' });
        setDiscountPercentage(0);
        
        // Refresh machines to get updated stock
        await fetchMachines();
        
        // Clear success message after 8 seconds (longer due to invoice message)
        setTimeout(() => setSuccessMessage(''), 8000);
      } else {
        setError(`Sale processing failed: ${response.data.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Sale processing error:', err);
      const errorInfo = handleApiError(err);
      setError(`Sale Error: ${errorInfo.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccessMessage('');
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
          Sell Item
        </h1>
        <p className="text-slate-600 mt-2">Process sales and manage customer orders</p>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
            {error}
          </div>
          <button onClick={clearMessages} className="text-red-600 hover:text-red-800">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircleIcon className="w-5 h-5 mr-2" />
            {successMessage}
          </div>
          <button onClick={clearMessages} className="text-green-600 hover:text-green-800">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* First Row: Items and Cart Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Product Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6 h-full">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Available Machines</h3>
            
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search machines..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.name} value={category.name}>
                    {category.name} ({category.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-slate-600 mt-4">Loading machines...</p>
              </div>
            )}

            {/* Pagination Info */}
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-slate-600">
                Showing page {currentPage} of {totalPages} ({totalMachines} total items)
              </p>
            </div>

            {/* Items Grid */}
            {!loading && (
              <div className="space-y-4">
                {machines.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <p className="text-slate-600">No machines found matching your criteria.</p>
                  </div>
                ) : (
                  machines.map((machine) => (
                    <div key={machine._id} className="border border-slate-200 rounded-lg p-3 hover:shadow-md transition-all duration-200 bg-white/50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-800 mb-1 text-sm">{machine.name}</h4>
                          <div className="flex items-center justify-between">
                            <span className="text-base font-bold text-slate-800">Rs. {machine.price.toFixed(2)}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              machine.quantity > 10 ? 'bg-green-100 text-green-600' :
                              machine.quantity > 5 ? 'bg-yellow-100 text-yellow-600' :
                              'bg-red-100 text-red-600'
                            }`}>
                              Stock: {machine.quantity}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <button
                            onClick={() => addToCart(machine)}
                            disabled={machine.quantity === 0}
                            className="px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
              <div className="mt-4 flex items-center justify-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {(() => {
                  const pages = [];
                  const maxPagesToShow = 5;
                  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
                  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
                  
                  if (endPage - startPage < maxPagesToShow - 1) {
                    startPage = Math.max(1, endPage - maxPagesToShow + 1);
                  }
                  
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(i);
                  }
                  
                  return pages.map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 text-sm rounded ${
                        currentPage === page
                          ? 'bg-blue-500 text-white'
                          : 'border border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {page}
                    </button>
                  ));
                })()}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Cart Section with VAT/Discount and Extra Charges */}
        <div className="lg:col-span-1">
          <div className="space-y-4 h-full">
            {/* Cart */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                  <ShoppingCartIcon className="w-6 h-6 mr-2" />
                  Cart ({cart.length})
                </h3>
                
                {cart.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No items in cart</p>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.machineId} className="border border-slate-200 rounded-lg p-3 bg-white/50">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h5 className="font-medium text-slate-800 text-sm">{item.name}</h5>
                            <p className="text-xs text-slate-600">ID: {item.itemId}</p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.machineId)}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateCartQuantity(item.machineId, -1)}
                              className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center hover:bg-slate-300"
                            >
                              <MinusIcon className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.machineId, 1)}
                              className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center hover:bg-slate-300"
                            >
                              <PlusIcon className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-sm font-bold text-slate-800">
                            Rs. {(item.unitPrice * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {/* Cart Totals */}
                    <div className="border-t border-slate-200 pt-4 space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-slate-600">
                          <span>Subtotal (Items):</span>
                          <span>Rs. {getSubtotal().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-600">
                          <span>VAT ({vatRate}%):</span>
                          <span>Rs. {getVATAmount().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-medium text-slate-700">
                          <span>Total Before Discount:</span>
                          <span>Rs. {getTotalBeforeDiscount().toFixed(2)}</span>
                        </div>
                        {discountPercentage > 0 && (
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Discount ({discountPercentage}%):</span>
                            <span>-Rs. {getDiscountAmount().toFixed(2)}</span>
                          </div>
                        )}
                        {getExtrasTotal() > 0 && (
                          <div className="flex justify-between text-sm text-slate-600">
                            <span>Extra Charges:</span>
                            <span>Rs. {getExtrasTotal().toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                      <div className="border-t border-slate-200 pt-2">
                        <div className="flex justify-between items-center text-xl font-bold text-slate-800">
                          <span>Final Total:</span>
                          <span className="text-green-600">Rs. {getFinalTotal().toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            {/* VAT and Discount */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <CalculatorIcon className="w-5 h-5 mr-2" />
                VAT & Discount
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">VAT Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={vatRate}
                    onChange={(e) => setVatRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Extra Charges */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold text-slate-800 flex items-center">
                  <ReceiptPercentIcon className="w-5 h-5 mr-2" />
                  Extra Charges
                </h3>
                <button
                  onClick={addExtra}
                  className="text-sm bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600"
                >
                  <PlusIcon className="w-4 h-4 inline mr-1" />
                  Add
                </button>
              </div>
              
              {extras.length === 0 ? (
                <p className="text-slate-500 text-center py-3 text-sm">No extra charges</p>
              ) : (
                <div className="space-y-3">
                  {extras.map((extra, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Description"
                        value={extra.description}
                        onChange={(e) => updateExtra(index, 'description', e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white/50"
                      />
                      <input
                        type="number"
                        placeholder="Amount"
                        value={extra.amount || ''}
                        onChange={(e) => updateExtra(index, 'amount', e.target.value)}
                        className="w-20 px-2 py-2 border border-slate-300 rounded-lg text-sm bg-white/50"
                      />
                      <button
                        onClick={() => removeExtra(index)}
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Second Row: Customer Information - Full Width */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Customer Information & Complete Sale</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Customer Name *</label>
            <input
              type="text"
              placeholder="Enter customer name"
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number *</label>
            <input
              type="tel"
              placeholder="Enter phone number"
              value={customerInfo.phone}
              onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email (Optional)</label>
            <input
              type="email"
              placeholder="Enter email address"
              value={customerInfo.email}
              onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">NIC (Optional)</label>
            <input
              type="text"
              placeholder="Enter NIC number"
              value={customerInfo.nic}
              onChange={(e) => setCustomerInfo({...customerInfo, nic: e.target.value})}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
            />
          </div>
        </div>

        {/* Process Sale Button */}
        <div className="flex justify-center gap-4">
          {/* Preview Invoice Button */}
          <button
            onClick={handleGenerateInvoicePreview}
            disabled={cart.length === 0}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
          >
            <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
            Preview Invoice
          </button>

          {/* Complete Sale Button */}
          <button
            onClick={handleSale}
            disabled={cart.length === 0 || processing}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold text-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing Sale...
              </>
            ) : (
              <>
                <CreditCardIcon className="w-6 h-6 mr-2" />
                <DocumentArrowDownIcon className="w-5 h-5 mr-1" />
                Complete Sale & Generate Invoice - Rs. {getFinalTotal().toFixed(2)}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellItem;
