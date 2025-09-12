import React, { useState } from 'react';
import { 
  ShoppingCartIcon, 
  MagnifyingGlassIcon, 
  PlusIcon, 
  MinusIcon, 
  CreditCardIcon 
} from '@heroicons/react/24/outline';

const SellItem = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  // Sample inventory for selling
  const availableItems = [
    {
      id: 'HP-2000',
      name: 'Hydraulic Pump HP-2000',
      category: 'Pumps',
      price: 2500.00,
      stock: 15,
      image: '🔧'
    },
    {
      id: 'IM-500',
      name: 'Industrial Motor IM-500',
      category: 'Motors',
      price: 1800.00,
      stock: 8,
      image: '⚡'
    },
    {
      id: 'SP-100',
      name: 'Steel Pipes SP-100',
      category: 'Pipes',
      price: 120.00,
      stock: 45,
      image: '🔩'
    },
    {
      id: 'VL-750',
      name: 'Hydraulic Valve VL-750',
      category: 'Valves',
      price: 680.00,
      stock: 22,
      image: '⚙️'
    }
  ];

  const filteredItems = availableItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      if (existingItem.quantity < item.stock) {
        setCart(cart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        ));
      }
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, change) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + change;
        if (newQuantity <= 0) {
          return null;
        }
        return { ...item, quantity: Math.min(newQuantity, item.stock) };
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleSale = () => {
    if (cart.length === 0) {
      alert('Please add items to cart before processing sale.');
      return;
    }
    if (!customerInfo.name || !customerInfo.email) {
      alert('Please fill in customer name and email.');
      return;
    }
    
    alert(`Sale processed successfully! Total: $${getTotalAmount().toFixed(2)}`);
    setCart([]);
    setCustomerInfo({ name: '', email: '', phone: '', address: '' });
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
          Sell Item
        </h1>
        <p className="text-slate-600 mt-2">Process sales and manage customer orders</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Selection */}
        <div className="lg:col-span-2">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6 mb-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Available Items</h3>
            
            {/* Search */}
            <div className="relative mb-6">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
              />
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item) => (
                <div key={item.id} className="border border-slate-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200 bg-white/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-3xl">{item.image}</div>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                      Stock: {item.stock}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-800 mb-1">{item.name}</h4>
                  <p className="text-slate-600 text-sm mb-2">{item.category}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-slate-800">${item.price.toFixed(2)}</span>
                    <button
                      onClick={() => addToCart(item)}
                      disabled={item.stock === 0}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
                  <div key={item.id} className="border border-slate-200 rounded-lg p-3 bg-white/50">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium text-slate-800 text-sm">{item.name}</h5>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center hover:bg-slate-300"
                        >
                          <MinusIcon className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center hover:bg-slate-300"
                        >
                          <PlusIcon className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-slate-800">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
                
                <div className="border-t border-slate-200 pt-4">
                  <div className="flex justify-between items-center text-lg font-bold text-slate-800">
                    <span>Total:</span>
                    <span>${getTotalAmount().toFixed(2)}</span>
                  </div>
                </div>
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
              />
              <input
                type="email"
                placeholder="Email *"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
              />
              <textarea
                placeholder="Address"
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                rows={3}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
              />
            </div>
          </div>

          {/* Process Sale Button */}
          <button
            onClick={handleSale}
            disabled={cart.length === 0}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold text-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <CreditCardIcon className="w-6 h-6 mr-2" />
            Process Sale
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellItem;
