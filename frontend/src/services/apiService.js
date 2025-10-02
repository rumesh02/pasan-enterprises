import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://16.16.24.8:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = sessionStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized access
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('isLoggedIn');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Machine API
export const machineAPI = {
  // Get all machines with optional filters
  getAll: (params = {}) => api.get('/machines', { params }),
  
  // Get single machine by ID
  getById: (id) => api.get(`/machines/${id}`),
  
  // Create new machine
  create: (data) => api.post('/machines', data),
  
  // Update machine
  update: (id, data) => api.put(`/machines/${id}`, data),
  
  // Delete machine
  delete: (id) => api.delete(`/machines/${id}`),
  
  // Get machine categories
  getCategories: () => api.get('/machines/categories'),
};

// Customer API
export const customerAPI = {
  // Get all customers with optional filters
  getAll: (params = {}) => api.get('/customers', { params }),
  
  // Get single customer by ID
  getById: (id) => api.get(`/customers/${id}`),
  
  // Create new customer
  create: (data) => api.post('/customers', data),
  
  // Update customer
  update: (id, data) => api.put(`/customers/${id}`, data),
  
  // Delete customer
  delete: (id) => api.delete(`/customers/${id}`),
  
  // Get customer statistics
  getStats: () => api.get('/customers/stats'),
};

// Sales API
export const salesAPI = {
  // Process a sale
  process: (data) => api.post('/sales', data),
  
  // Validate sale data
  validate: (data) => api.post('/sales/validate', data),
  
  // Get sales statistics
  getStats: () => api.get('/sales/stats'),
};

// Past Orders API
export const pastOrdersAPI = {
  // Get all past orders with optional filters
  getAll: (params = {}) => api.get('/past-orders', { params }),
  
  // Get single order by ID
  getById: (id) => api.get(`/past-orders/${id}`),
  
  // Get order by order ID
  getByOrderId: (orderId) => api.get(`/past-orders/order/${orderId}`),
  
  // Update order status
  updateStatus: (id, data) => api.patch(`/past-orders/${id}/status`, data),
  
  // Get order statistics
  getStats: () => api.get('/past-orders/stats'),
  
  // Get orders by date range
  getByDateRange: (params) => api.get('/past-orders/range', { params }),
  
  // Cancel order
  cancel: (id) => api.delete(`/past-orders/${id}`),
};

// User API
export const userAPI = {
  // Login user
  login: (data) => api.post('/users/login', data),
  
  // Get current user profile
  getCurrentUser: () => api.get('/users/me'),
  
  // Get all users
  getAll: (params = {}) => api.get('/users', { params }),
  
  // Get single user by ID
  getById: (id) => api.get(`/users/${id}`),
  
  // Create new user
  create: (data) => api.post('/users', data),
  
  // Update user
  update: (id, data) => api.put(`/users/${id}`, data),
  
  // Delete user
  delete: (id) => api.delete(`/users/${id}`),
};

// Error handler utility
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.message || 'An error occurred';
    const errors = error.response.data?.errors || [];
    
    return {
      message,
      errors,
      status: error.response.status,
      data: error.response.data
    };
  } else if (error.request) {
    // Request made but no response received
    return {
      message: 'Network error - please check your connection',
      errors: [],
      status: null,
      data: null
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      errors: [],
      status: null,
      data: null
    };
  }
};

export default api;