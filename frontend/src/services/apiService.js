import axios from 'axios';

// Determine the API base URL based on environment
const getBaseURL = () => {
  // Priority 1: Use environment variable if available
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // Priority 2: Check if running on localhost (development)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }

  // Priority 3: Fallback to production URL
  return 'https://pasan-enterprises.me/api';
};

// Create axios instance with base configuration
const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor: attach token if exists
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized, log out user
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('isLoggedIn');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ----- API Endpoints -----

// Machine API
export const machineAPI = {
  getAll: (params = {}) => api.get('/machines', { params }),
  getById: (id) => api.get(`/machines/${id}`),
  create: (data) => api.post('/machines', data),
  update: (id, data) => api.put(`/machines/${id}`, data),
  delete: (id) => api.delete(`/machines/${id}`),
  getCategories: () => api.get('/machines/categories'),
};

// Customer API
export const customerAPI = {
  getAll: (params = {}) => api.get('/customers', { params }),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
  getStats: () => api.get('/customers/stats'),
};

// Sales API
export const salesAPI = {
  process: (data) => api.post('/sales', data),
  validate: (data) => api.post('/sales/validate', data),
  getStats: () => api.get('/sales/stats'),
};

// Past Orders API
export const pastOrdersAPI = {
  getAll: (params = {}) => api.get('/past-orders', { params }),
  getById: (id) => api.get(`/past-orders/${id}`),
  getByOrderId: (orderId) => api.get(`/past-orders/order/${orderId}`),
  updateStatus: (id, data) => api.patch(`/past-orders/${id}/status`, data),
  getStats: () => api.get('/past-orders/stats'),
  getByDateRange: (params) => api.get('/past-orders/range', { params }),
  getMachineSalesStats: (machineId) => api.get(`/past-orders/machine-stats/${machineId}`),
  cancel: (id) => api.delete(`/past-orders/${id}`),
  returnItem: (orderId, data) => api.put(`/past-orders/return-item/${orderId}`, data),
  update: (orderId, data) => api.put(`/past-orders/${orderId}`, data),
};

// User API
export const userAPI = {
  login: (data) => api.post('/users/login', data),
  getCurrentUser: () => api.get('/users/me'),
  getAll: (params = {}) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// Dashboard API
export const dashboardAPI = {
  getMonthlyRevenue: () => api.get('/dashboard/monthly-revenue'),
  getTotalOrders: () => api.get('/dashboard/total-orders'),
  getLowStock: () => api.get('/dashboard/low-stock'),
  getTotalItems: () => api.get('/dashboard/total-items'),
  getMonthlyGraph: () => api.get('/dashboard/monthly-graph'),
};

// ----- Error Handler Utility -----
export const handleApiError = (error) => {
  if (error.response) {
    return {
      message: error.response.data?.message || 'An error occurred',
      errors: error.response.data?.errors || [],
      status: error.response.status,
      data: error.response.data
    };
  } else if (error.request) {
    return {
      message: 'Network error - please check your connection',
      errors: [],
      status: null,
      data: null
    };
  } else {
    return {
      message: error.message || 'An unexpected error occurred',
      errors: [],
      status: null,
      data: null
    };
  }
};

export default api;
