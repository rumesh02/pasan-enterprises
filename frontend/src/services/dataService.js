// Enhanced data service for comprehensive customer and order information
import { customerAPI, pastOrdersAPI } from './apiService';

/**
 * Enhanced Customer and Order Data Service
 * Provides comprehensive data fetching from both Customer and PastOrders collections
 */
export class DataService {
  
  /**
   * Fetch comprehensive customer data with order statistics
   */
  static async getCustomersWithOrderData() {
    try {
      const [customersResponse, ordersResponse] = await Promise.all([
        customerAPI.getAll(),
        pastOrdersAPI.getAll()
      ]);

      if (!customersResponse.data.success || !ordersResponse.data.success) {
        throw new Error('Failed to fetch customer or order data');
      }

      const customers = customersResponse.data.data || [];
      const orders = ordersResponse.data.data || [];

      // Enhance customer data with recent order information
      const enhancedCustomers = customers.map(customer => {
        // Find orders for this customer
        const customerOrders = orders.filter(order => 
          order.customerId._id === customer._id ||
          order.customerInfo.phone === customer.phone
        );

        // Calculate additional statistics
        const recentOrders = customerOrders
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        const averageOrderValue = customer.totalOrders > 0 
          ? customer.totalSpent / customer.totalOrders 
          : 0;

        return {
          ...customer,
          recentOrders,
          averageOrderValue,
          daysSinceLastOrder: customer.lastOrderDate 
            ? Math.floor((new Date() - new Date(customer.lastOrderDate)) / (1000 * 60 * 60 * 24))
            : null,
          orderFrequency: customer.totalOrders > 0 
            ? this.calculateOrderFrequency(customerOrders)
            : 'No orders'
        };
      });

      return {
        success: true,
        data: enhancedCustomers,
        count: enhancedCustomers.length
      };

    } catch (error) {
      console.error('Error fetching comprehensive customer data:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Fetch comprehensive order data with customer information
   */
  static async getOrdersWithCustomerData() {
    try {
      const ordersResponse = await pastOrdersAPI.getAll();

      if (!ordersResponse.data.success) {
        throw new Error('Failed to fetch orders data');
      }

      const orders = ordersResponse.data.data || [];

      // Enhance orders with additional customer context and calculations
      const enhancedOrders = orders.map(order => {
        const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
        const profitMargin = this.calculateProfitMargin(order.items);
        
        return {
          ...order,
          itemsCount,
          profitMargin,
          orderAge: Math.floor((new Date() - new Date(order.createdAt)) / (1000 * 60 * 60 * 24)),
          customerSnapshot: {
            ...order.customerInfo,
            // Add current customer data if available
            currentStatus: order.customerId?.customerStatus || 'Unknown'
          }
        };
      });

      return {
        success: true,
        data: enhancedOrders,
        count: enhancedOrders.length
      };

    } catch (error) {
      console.error('Error fetching comprehensive order data:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Get customer details with complete order history
   */
  static async getCustomerDetails(customerId) {
    try {
      const [customerResponse, ordersResponse] = await Promise.all([
        customerAPI.getById(customerId),
        pastOrdersAPI.getAll({ customerId })
      ]);

      if (!customerResponse.data.success) {
        throw new Error('Failed to fetch customer details');
      }

      const customer = customerResponse.data.data;
      const orders = ordersResponse.data?.data || [];

      // Calculate detailed statistics
      const monthlySpending = this.calculateMonthlySpending(orders);
      const favoriteCategories = this.calculateFavoriteCategories(orders);
      const orderTimeline = this.generateOrderTimeline(orders);

      return {
        success: true,
        data: {
          ...customer,
          orderHistory: orders,
          analytics: {
            monthlySpending,
            favoriteCategories,
            orderTimeline,
            averageOrderValue: customer.totalOrders > 0 ? customer.totalSpent / customer.totalOrders : 0,
            orderFrequency: this.calculateOrderFrequency(orders)
          }
        }
      };

    } catch (error) {
      console.error('Error fetching customer details:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Get dashboard statistics from both collections
   */
  static async getDashboardStats() {
    try {
      const [customersResponse, ordersResponse] = await Promise.all([
        customerAPI.getAll(),
        pastOrdersAPI.getAll()
      ]);

      const customers = customersResponse.data?.data || [];
      const orders = ordersResponse.data?.data || [];

      const today = new Date();
      const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Calculate comprehensive statistics
      const stats = {
        customers: {
          total: customers.length,
          new: customers.filter(c => new Date(c.createdAt) >= thisMonth).length,
          vip: customers.filter(c => c.customerStatus === 'VIP Customer').length,
          active: customers.filter(c => c.totalOrders > 0).length
        },
        orders: {
          total: orders.length,
          thisWeek: orders.filter(o => new Date(o.createdAt) >= thisWeek).length,
          thisMonth: orders.filter(o => new Date(o.createdAt) >= thisMonth).length,
          completed: orders.filter(o => o.orderStatus === 'Completed').length,
          processing: orders.filter(o => o.orderStatus === 'Processing').length
        },
        revenue: {
          total: orders.reduce((sum, order) => sum + (order.total || 0), 0),
          thisMonth: orders
            .filter(o => new Date(o.createdAt) >= thisMonth)
            .reduce((sum, order) => sum + (order.total || 0), 0),
          average: orders.length > 0 
            ? orders.reduce((sum, order) => sum + (order.total || 0), 0) / orders.length 
            : 0
        },
        topCustomers: customers
          .sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))
          .slice(0, 5),
        recentOrders: orders
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 10)
      };

      return {
        success: true,
        data: stats
      };

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  // Helper methods for calculations

  static calculateOrderFrequency(orders) {
    if (orders.length < 2) return 'Insufficient data';
    
    const sortedOrders = orders.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const firstOrder = new Date(sortedOrders[0].createdAt);
    const lastOrder = new Date(sortedOrders[sortedOrders.length - 1].createdAt);
    const daysBetween = (lastOrder - firstOrder) / (1000 * 60 * 60 * 24);
    
    if (daysBetween === 0) return 'Same day';
    
    const avgDays = daysBetween / (orders.length - 1);
    
    if (avgDays < 7) return 'Multiple times per week';
    if (avgDays < 30) return 'Weekly';
    if (avgDays < 90) return 'Monthly';
    return 'Quarterly or less';
  }

  static calculateProfitMargin(items) {
    // Simplified profit calculation - in real app, you'd have cost data
    const totalRevenue = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    const estimatedCost = totalRevenue * 0.6; // Assume 40% margin
    return ((totalRevenue - estimatedCost) / totalRevenue) * 100;
  }

  static calculateMonthlySpending(orders) {
    const monthlyData = {};
    
    orders.forEach(order => {
      const month = new Date(order.createdAt).toISOString().slice(0, 7); // YYYY-MM
      monthlyData[month] = (monthlyData[month] || 0) + (order.total || 0);
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, total]) => ({ month, total }));
  }

  static calculateFavoriteCategories(orders) {
    const categoryCount = {};
    
    orders.forEach(order => {
      order.items.forEach(item => {
        const category = item.category || 'Uncategorized';
        categoryCount[category] = (categoryCount[category] || 0) + item.quantity;
      });
    });

    return Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));
  }

  static generateOrderTimeline(orders) {
    return orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(order => ({
        orderId: order.orderId,
        date: order.createdAt,
        total: order.total,
        status: order.orderStatus,
        itemCount: order.items.length
      }));
  }
}

// Export individual functions for backwards compatibility
export const {
  getCustomersWithOrderData,
  getOrdersWithCustomerData,
  getCustomerDetails,
  getDashboardStats
} = DataService;