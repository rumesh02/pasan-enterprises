import React, { useState } from 'react';
import { 
  PlusIcon, 
  PhotoIcon, 
  CurrencyDollarIcon, 
  ClipboardDocumentListIcon 
} from '@heroicons/react/24/outline';

const AddInventory = () => {
  const [formData, setFormData] = useState({
    itemId: '',
    name: '',
    category: '',
    description: '',
    quantity: '',
    price: '',
    supplier: '',
    location: '',
    minStockLevel: '',
    image: null
  });

  const [previewImage, setPreviewImage] = useState(null);

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
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.itemId || !formData.name || !formData.category || !formData.quantity || !formData.price) {
      alert('Please fill in all required fields.');
      return;
    }

    // Here you would typically send the data to your backend
    console.log('Form submitted:', formData);
    alert('Item added to inventory successfully!');
    
    // Reset form
    setFormData({
      itemId: '',
      name: '',
      category: '',
      description: '',
      quantity: '',
      price: '',
      supplier: '',
      location: '',
      minStockLevel: '',
      image: null
    });
    setPreviewImage(null);
  };

  const generateItemId = () => {
    const prefix = formData.category ? formData.category.substring(0, 2).toUpperCase() : 'IT';
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
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
                  placeholder="e.g., Hydraulic Pump HP-2000"
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

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Supplier
                </label>
                <input
                  type="text"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleInputChange}
                  placeholder="e.g., ABC Suppliers Ltd"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Detailed description of the item..."
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Minimum Stock Level
                </label>
                <input
                  type="number"
                  name="minStockLevel"
                  value={formData.minStockLevel}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Storage Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Warehouse A, Shelf 3"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
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
                  price: '',
                  supplier: '',
                  location: '',
                  minStockLevel: '',
                  image: null
                });
                setPreviewImage(null);
              }}
              className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Clear Form
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:scale-105 transition-all duration-200 flex items-center"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add to Inventory
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInventory;
