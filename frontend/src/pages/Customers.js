import React, { useState, useEffect } from 'react';
import { 
  UsersIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon,
  IdentificationIcon,
  UserPlusIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { customerAPI, handleApiError } from '../services/apiService';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    nic: '',
    address: ''
  });

  // Load customers from backend
  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await customerAPI.getAll();
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        setCustomers(response.data.data || []);
      } else {
        setError('Failed to load customers');
        setCustomers([]);
      }
    } catch (err) {
      console.error('Error loading customers:', err);
      const errorInfo = handleApiError(err);
      setError(errorInfo.message || 'Failed to load customers');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = Array.isArray(customers) ? customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm) ||
    customer.nic?.includes(searchTerm)
  ) : [];

  const handleAddCustomer = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      nic: '',
      address: ''
    });
    setEditingCustomer(null);
    setShowAddModal(true);
  };

  const handleEditCustomer = (customer) => {
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      nic: customer.nic,
      address: customer.address || ''
    });
    setEditingCustomer(customer._id);
    setShowAddModal(true);
  };

  const handleDeleteCustomer = async (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      try {
        await customerAPI.delete(customerId);
        setCustomers(customers.filter(customer => customer._id !== customerId));
      } catch (err) {
        console.error('Error deleting customer:', err);
        alert(handleApiError(err));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      if (editingCustomer) {
        const updatedCustomer = await customerAPI.update(editingCustomer, formData);
        setCustomers(customers.map(customer => 
          customer._id === editingCustomer ? updatedCustomer : customer
        ));
      } else {
        const newCustomer = await customerAPI.create(formData);
        setCustomers([...customers, newCustomer]);
      }
      setShowAddModal(false);
      setEditingCustomer(null);
    } catch (err) {
      console.error('Error saving customer:', err);
      setError(handleApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const stats = [
    {
      title: 'Total Customers',
      value: Array.isArray(customers) ? customers.length.toString() : '0',
      icon: UsersIcon,
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Total Orders',
      value: Array.isArray(customers) ? customers.reduce((sum, customer) => sum + (customer.totalOrders || 0), 0).toString() : '0',
      icon: UserPlusIcon,
      gradient: 'from-green-500 to-green-600'
    },
    {
      title: 'Total Revenue',
      value: Array.isArray(customers) ? formatCurrency(customers.reduce((sum, customer) => sum + (customer.totalSpent || 0), 0)) : formatCurrency(0),
      icon: CurrencyDollarIcon,
      gradient: 'from-purple-500 to-purple-600'
    }
  ];

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center">
              <UsersIcon className="w-8 h-8 mr-3 text-blue-600" />
              Customer Management
            </h1>
            <p className="text-slate-600 mt-2">Manage your customer relationships and track orders</p>
          </div>
          <button
            onClick={handleAddCustomer}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customers by name, email, phone, or NIC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">All Customers</h2>
          <p className="text-slate-600 text-sm mt-1">{filteredCustomers.length} customers found</p>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-slate-600">Loading customers...</span>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-12">
            <UsersIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No customers found</p>
            <button
              onClick={handleAddCustomer}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Add Your First Customer
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact Info</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">NIC</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Orders & Spending</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status & Activity</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-slate-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-slate-900">{customer.name}</div>
                        <div className="text-sm text-slate-500">{customer.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <PhoneIcon className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-900">{customer.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <IdentificationIcon className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-900">{customer.nic}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {customer.totalOrders} orders
                        </span>
                        <p className="text-sm font-medium text-slate-900">
                          {formatCurrency(customer.totalSpent || 0)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          customer.customerStatus === 'VIP Customer' 
                            ? 'bg-purple-100 text-purple-800' 
                            : customer.customerStatus === 'Regular Customer'
                            ? 'bg-blue-100 text-blue-800'
                            : customer.customerStatus === 'Occasional Customer'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {customer.customerStatus || 'New Customer'}
                        </span>
                        {customer.lastOrderDate && (
                          <p className="text-xs text-slate-500">
                            Last order: {new Date(customer.lastOrderDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditCustomer(customer)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          title="Edit Customer"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(customer._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                          title="Delete Customer"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
              >
                <XMarkIcon className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center space-x-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <span className="flex items-center space-x-2">
                    <UsersIcon className="w-4 h-4" />
                    <span>Customer Name</span>
                  </span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter customer full name"
                  disabled={submitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <span className="flex items-center space-x-2">
                    <EnvelopeIcon className="w-4 h-4" />
                    <span>Email Address</span>
                  </span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address (optional)"
                  disabled={submitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <span className="flex items-center space-x-2">
                    <PhoneIcon className="w-4 h-4" />
                    <span>Phone Number</span>
                  </span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter phone number (e.g., +94 77 123 4567)"
                  disabled={submitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <span className="flex items-center space-x-2">
                    <IdentificationIcon className="w-4 h-4" />
                    <span>National Identity Card (NIC)</span>
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.nic}
                  onChange={(e) => setFormData({...formData, nic: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter NIC number (optional - e.g., 123456789V or 199812345678)"
                  disabled={submitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <span className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Address</span>
                  </span>
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter customer address (optional)"
                  rows="3"
                  disabled={submitting}
                />
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>{editingCustomer ? 'Update' : 'Add'} Customer</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;