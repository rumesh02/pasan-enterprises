import React, { useState, useEffect } from 'react';
import { 
  ShoppingCartIcon, 
  MagnifyingGlassIcon, 
  PlusIcon, 
  MinusIcon, 
  CreditCardIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';
import { machineAPI, salesAPI, handleApiError } from '../services/apiService';

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
  const [validation, setValidation] = useState(null);

  // Fetch machines and categories on component mount
  useEffect(() => {
    fetchMachines();
    fetchCategories();
  }, []);

  const fetchMachines = async () => {
    try {
      setLoading(true);
      const response = await machineAPI.getAll({ inStock: true });
      if (response.data.success) {
        setMachines(response.data.data);
      }
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

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

  // Filter machines based on search and category
  const filteredMachines = machines.filter(machine => {
    const matchesSearch = machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         machine.itemId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         machine.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || machine.category === selectedCategory;
    
    return matchesSearch && matchesCategory && machine.quantity > 0;
  });

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

  const getExtrasTotal = () => {
    return extras.reduce((total, extra) => total + (extra.amount || 0), 0);
  };

  const getTotalAmount = () => {
    return getSubtotal() + getExtrasTotal();
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
        setValidation(response.data.data);
        
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
        notes: '',
        processedBy: 'Admin'
      };

      console.log('Processing sale with data:', saleData);
      const response = await salesAPI.process(saleData);
      
      if (response.data.success) {
        setSuccessMessage(`Sale processed successfully! Order ID: ${response.data.data.orderSummary.orderId}`);
        
        // Reset form
        setCart([]);
        setExtras([]);
        setCustomerInfo({ name: '', email: '', phone: '', nic: '' });
        setValidation(null);
        
        // Refresh machines to get updated stock
        await fetchMachines();
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(''), 5000);
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Selection */}
        <div className="lg:col-span-2">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6 mb-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Available Machines</h3>
            
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search machines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
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

            {/* Items Grid */}
            {!loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMachines.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <p className="text-slate-600">No machines found matching your criteria.</p>
                  </div>
                ) : (
                  filteredMachines.map((machine) => (
                    <div key={machine._id} className="border border-slate-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200 bg-white/50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-2xl">🔧</div>
                        <div className="text-right">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            machine.quantity > 10 ? 'bg-green-100 text-green-600' :
                            machine.quantity > 5 ? 'bg-yellow-100 text-yellow-600' :
                            'bg-red-100 text-red-600'
                          }`}>
                            Stock: {machine.quantity}
                          </span>
                        </div>
                      </div>
                      <h4 className="font-semibold text-slate-800 mb-1">{machine.name}</h4>
                      <p className="text-slate-600 text-xs mb-1">ID: {machine.itemId}</p>
                      <p className="text-slate-600 text-sm mb-2">{machine.category}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-slate-800">Rs. {machine.price.toFixed(2)}</span>
                        <button
                          onClick={() => addToCart(machine)}
                          disabled={machine.quantity === 0}
                          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Cart and Customer Info */}
        <div className="lg:col-span-1">
          {/* Cart */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6 mb-6">
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
                
                {/* Subtotal */}
                <div className="border-t border-slate-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Subtotal:</span>
                    <span>Rs. {getSubtotal().toFixed(2)}</span>
                  </div>
                  {getExtrasTotal() > 0 && (
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Extras:</span>
                      <span>Rs. {getExtrasTotal().toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-lg font-bold text-slate-800">
                    <span>Total:</span>
                    <span>Rs. {getTotalAmount().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Extra Charges */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-800">Extra Charges</h3>
              <button
                onClick={addExtra}
                className="text-sm bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600"
              >
                <PlusIcon className="w-4 h-4 inline mr-1" />
                Add
              </button>
            </div>
            
            {extras.length === 0 ? (
              <p className="text-slate-500 text-center py-4 text-sm">No extra charges</p>
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
                      className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white/50"
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

          {/* Customer Information */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6 mb-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Customer Information</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Customer Name *"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
                required
              />
              <input
                type="tel"
                placeholder="Phone *"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
                required
              />
              <input
                type="email"
                placeholder="Email (optional)"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
              />
              <input
                type="text"
                placeholder="NIC (optional)"
                value={customerInfo.nic}
                onChange={(e) => setCustomerInfo({...customerInfo, nic: e.target.value})}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
              />
            </div>
          </div>

          {/* Process Sale Button */}
          <button
            onClick={handleSale}
            disabled={cart.length === 0 || processing}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold text-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <CreditCardIcon className="w-6 h-6 mr-2" />
                Process Sale
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellItem;
