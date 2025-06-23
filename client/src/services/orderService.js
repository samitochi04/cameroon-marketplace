import { api } from '@/services/api';

export const orderService = {
  /**
   * Create a new order from the current cart
   * 
   * @param {Object} orderData - Order data including addresses, shipping method, etc.
   * @returns {Promise<Object>} - Created order data
   */
  async createOrder(orderData) {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },
  
  /**
   * Get order details by ID
   * 
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} - Order details
   */
  async getOrderById(orderId) {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },
  
  /**
   * Update order payment status after successful payment
   * 
   * @param {string} orderId - Order ID
   * @param {Object} paymentData - Payment data including transaction ID
   * @returns {Promise<Object>} - Updated order data
   */
  async updateOrderPayment(orderId, paymentData) {
    try {
      const response = await api.post(`/orders/${orderId}/payment`, paymentData);
      return response.data;
    } catch (error) {
      console.error('Error updating order payment:', error);
      throw error;
    }
  },
  
  /**
   * Cancel an order
   * 
   * @param {string} orderId - Order ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<Object>} - Updated order data
   */
  async cancelOrder(orderId, reason) {
    try {
      const response = await api.post(`/orders/${orderId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  },
  
  /**
   * Get user orders history
   * 
   * @param {Object} params - Query parameters like pagination
   * @returns {Promise<Object[]>} - List of orders
   */
  async getUserOrders(params = {}) {
    try {
      const response = await api.get('/orders', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  },
  
  /**
   * Calculate order shipping cost based on shipping method and address
   * 
   * @param {Object} data - Cart data and shipping method
   * @returns {Promise<Object>} - Shipping costs and delivery estimates
   */
  async calculateShipping(data) {
    try {
      const response = await api.post('/orders/calculate-shipping', data);
      return response.data;
    } catch (error) {
      console.error('Error calculating shipping:', error);
      throw error;
    }
  },
  
  /**
   * Validate order data before creating the order
   * 
   * @param {Object} orderData - Order data to validate
   * @returns {Promise<Object>} - Validation result
   */
  async validateOrder(orderData) {
    try {
      const response = await api.post('/orders/validate', orderData);
      return response.data;
    } catch (error) {
      console.error('Error validating order:', error);
      throw error;
    }
  },
  
  /**
   * Track order status and shipment
   * 
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} - Tracking information
   */
  async trackOrder(orderId) {
    try {
      const response = await api.get(`/orders/${orderId}/tracking`);
      return response.data;
    } catch (error) {
      console.error('Error tracking order:', error);
      throw error;
    }
  },
  
  /**
   * Process order completion and trigger necessary side effects
   * 
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} - Completed order data
   */
  async completeOrder(orderId) {
    try {
      const response = await api.post(`/orders/${orderId}/complete`);
      return response.data;
    } catch (error) {
      console.error('Error completing order:', error);
      throw error;
    }
  }
};
