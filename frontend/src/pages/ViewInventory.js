import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon 
} from '@heroicons/react/24/outline';

const ViewInventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Sample inventory data
  const inventoryItems = [
    {
      id: 'HP-2000',
      name: 'Hydraulic Pump HP-2000',
      category: 'Pumps',
      quantity: 15,
      price: 2500.00,
      status: 'In Stock',
      lastUpdated: '2025-09-10'
    },
    {
      id: 'IM-500',
      name: 'Industrial Motor IM-500',
      category: 'Motors',
      quantity: 8,
      price: 1800.00,
      status: 'Low Stock',
      lastUpdated: '2025-09-12'
    },
    {
      id: 'SP-100',
      name: 'Steel Pipes SP-100',
      category: 'Pipes',
      quantity: 45,
      price: 120.00,
      status: 'In Stock',
      lastUpdated: '2025-09-11'
    },
    {
      id: 'BS-250',
      name: 'Bearing Set BS-250',
      category: 'Bearings',
      quantity: 3,
      price: 450.00,
      status: 'Critical',
      lastUpdated: '2025-09-09'
    },
    {
      id: 'VL-750',
      name: 'Hydraulic Valve VL-750',
      category: 'Valves',
      quantity: 22,
      price: 680.00,
      status: 'In Stock',
      lastUpdated: '2025-09-13'
    }
  ];

  const categories = ['all', 'Pumps', 'Motors', 'Pipes', 'Bearings', 'Valves'];

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Stock': return 'bg-green-100 text-green-800';
      case 'Low Stock': return 'bg-orange-100 text-orange-800';
      case 'Critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
          View Inventory
        </h1>
        <p className="text-slate-600 mt-2">Manage and monitor your machinery inventory</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by item name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="pl-10 pr-8 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800">Item ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800">Quantity</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800">Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800">Last Updated</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">{item.id}</td>
                  <td className="px-6 py-4 text-sm text-slate-800">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.category}</td>
                  <td className="px-6 py-4 text-sm text-slate-800 font-medium">{item.quantity}</td>
                  <td className="px-6 py-4 text-sm text-slate-800">Rs. {item.price.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.lastUpdated}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg">No items found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewInventory;
