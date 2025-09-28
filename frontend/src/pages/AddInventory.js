import React, { useState } from 'react';
import { 
  PlusIcon, 
  CurrencyDollarIcon, 
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { machineService } from '../services/machineService';

const AddInventory = () => {
  const [formData, setFormData] = useState({
    itemId: '',
    name: '',
    category: '',
    description: '',
    quantity: '',
    price: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const categories = [
    'Pumps',
    'Motors',
    'Pipes',
    'Bearings',
    'Valves',
    'Filters',
    'Seals',
    'Tools',
    'Electronics',
    'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear any existing messages when user starts typing
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.itemId || !formData.name || !formData.category || !formData.description || !formData.quantity || !formData.price) {
      setMessage({
        type: 'error',
        text: 'Please fill in all required fields (Item ID, Name, Category, Description, Quantity, and Price).'
      });
      return;
    }

    // Validate numeric fields
    if (parseFloat(formData.price) < 0) {
      setMessage({
        type: 'error',
        text: 'Price cannot be negative.'
      });
      return;
    }

    if (parseInt(formData.quantity) < 0) {
      setMessage({
        type: 'error',
        text: 'Quantity cannot be negative.'
      });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Prepare data for API
      const machineData = {
        itemId: formData.itemId.trim(),
        name: formData.name.trim(),
        category: formData.category,
        description: formData.description.trim(),
        quantity: parseInt(formData.quantity),
        price: parseFloat(formData.price)
      };

      // Call API to create machine
      const response = await machineService.createMachine(machineData);

      if (response.success) {
        setMessage({
          type: 'success',
          text: 'Machine added to inventory successfully!'
        });
        
        // Reset form
        setFormData({
          itemId: '',
          name: '',
          category: '',
          description: '',
          quantity: '',
          price: ''
        });
      }
    } catch (error) {
      console.error('Error adding machine:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Failed to add machine to inventory. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateItemId = () => {
    const prefix = formData.category ? formData.category.substring(0, 2).toUpperCase() : 'PE';
    const randomNum = Math.floor(Math.random() * 900000) + 100000;
    const newId = `${prefix}-${randomNum}`;
    setFormData(prev => ({
      ...prev,
      itemId: newId
    }));
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
          Add Inventory
        </h1>
        <p className="text-slate-600 mt-2">Add new items to your machinery inventory</p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircleIcon className="w-5 h-5 mr-2" />
            ) : (
              <ExclamationCircleIcon className="w-5 h-5 mr-2" />
            )}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <ClipboardDocumentListIcon className="w-6 h-6 mr-2" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Item ID *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    name="itemId"
                    value={formData.itemId}
                    onChange={handleInputChange}
                    placeholder="e.g., HP-2000"
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
                    required
                  />
                  <button
                    type="button"
                    onClick={generateItemId}
                    className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:scale-105 transition-all duration-200"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter the machine name"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>



              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Detailed description of the machine..."
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
                  required
                />
              </div>
            </div>
          </div>

          {/* Inventory Details */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <CurrencyDollarIcon className="w-6 h-6 mr-2" />
              Inventory Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Price (Rs) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  itemId: '',
                  name: '',
                  category: '',
                  description: '',
                  quantity: '',
                  price: ''
                });
                setMessage({ type: '', text: '' });
              }}
              className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              disabled={loading}
            >
              Clear Form
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:scale-105 transition-all duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Adding...
                </>
              ) : (
                <>
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Add to Inventory
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInventory;
