const { v4: uuidv4 } = require('uuid');
const Order = require('../models/order.model');
const OrderItem = require('../models/order-item.model');
const productService = require('./product.service');
const notificationService = require('./notification.service');

class OrderService {
  async createOrder(orderData) {
    try {
      // Create the order
      const order = new Order({
        id: uuidv4(),
        user_id: orderData.userId,
        status: 'pending',
        total_amount: orderData.totalAmount,
        shipping_address: orderData.shippingAddress,
        billing_address: orderData.billingAddress,
        payment_method: orderData.paymentMethod,
        payment_status: 'pending',
        created_at: new Date().toISOString(),
      });

      const savedOrder = await order.save();

      // Create order items
      const orderItems = [];
      for (const item of orderData.items) {
        const product = await productService.getProductById(item.productId);
        
        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        const orderItem = new OrderItem({
          id: uuidv4(),
          order_id: savedOrder.id,
          product_id: product.id,
          vendor_id: product.vendorId,
          quantity: item.quantity,
          price: product.salePrice || product.price,
          total: (product.salePrice || product.price) * item.quantity,
          status: 'pending',
          created_at: new Date().toISOString(),
        });

        const savedItem = await orderItem.save();
        orderItems.push(savedItem);

        // Update product stock
        await productService.updateStock(product.id, product.vendorId, product.stockQuantity - item.quantity);
      }

      // Notify vendors about new order items
      await notificationService.notifyNewOrderItems(orderItems);

      // Notify customer about order creation
      await notificationService.notifyOrderCreation(savedOrder, orderItems);

      return { order: savedOrder, items: orderItems };
    } catch (error) {
      console.error('Order service - Create order error:', error);
      throw error;
    }
  }

  async getOrderById(id) {
    try {
      const order = await Order.findById(id);
      if (!order) return null;

      const orderItems = await OrderItem.findByOrderId(id);
      return { order, items: orderItems };
    } catch (error) {
      console.error('Order service - Get order error:', error);
      throw error;
    }
  }

  async getOrdersByUserId(userId) {
    try {
      const orders = await Order.findByUserId(userId);
      return orders;
    } catch (error) {
      console.error('Order service - Get orders by user error:', error);
      throw error;
    }
  }

  async getVendorOrderItems(vendorId) {
    try {
      const orderItems = await OrderItem.findByVendorId(vendorId);
      return orderItems;
    } catch (error) {
      console.error('Order service - Get vendor order items error:', error);
      throw error;
    }
  }

  async updateOrderStatus(id, status) {
    try {
      const order = await Order.findById(id);
      if (!order) {
        throw new Error('Order not found');
      }

      const updatedOrder = await order.updateStatus(status);
      
      // Notify customer about order status update
      await notificationService.notifyOrderStatusUpdate(updatedOrder);
      
      return updatedOrder;
    } catch (error) {
      console.error('Order service - Update order status error:', error);
      throw error;
    }
  }

  async updateOrderItemStatus(id, status, vendorId) {
    try {
      const orderItem = await OrderItem.findById(id);
      if (!orderItem) {
        throw new Error('Order item not found');
      }

      if (orderItem.vendorId !== vendorId) {
        throw new Error('Unauthorized: Order item does not belong to this vendor');
      }

      const updatedItem = await orderItem.updateStatus(status);
      
      // Check if all items in the order have been shipped/delivered/etc.
      const allItems = await OrderItem.findByOrderId(orderItem.orderId);
      const allItemsWithStatus = allItems.every(item => item.status === status);
      
      // If all items have the same status, update the order status accordingly
      if (allItemsWithStatus) {
        const order = await Order.findById(orderItem.orderId);
        if (order) {
          await order.updateStatus(status);
          // Notify customer about order status update
          await notificationService.notifyOrderStatusUpdate(order);
        }
      }
      
      // Notify customer about order item status update
      await notificationService.notifyOrderItemStatusUpdate(updatedItem);
      
      return updatedItem;
    } catch (error) {
      console.error('Order service - Update order item status error:', error);
      throw error;
    }
  }

  // Additional methods as needed
}

module.exports = new OrderService();