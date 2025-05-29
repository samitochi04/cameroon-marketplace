const Notification = require('../models/notification.model');
const userService = require('./user.service');
const emailService = require('./email.service');

class NotificationService {
  async createNotification(data) {
    try {
      const notification = new Notification({
        user_id: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data,
        created_at: new Date().toISOString(),
      });

      return await notification.save();
    } catch (error) {
      console.error('Notification service - Create notification error:', error);
      throw error;
    }
  }

  async getUserNotifications(userId) {
    try {
      return await Notification.findByUserId(userId);
    } catch (error) {
      console.error('Notification service - Get user notifications error:', error);
      throw error;
    }
  }

  async getUnreadNotifications(userId) {
    try {
      return await Notification.findUnreadByUserId(userId);
    } catch (error) {
      console.error('Notification service - Get unread notifications error:', error);
      throw error;
    }
  }

  async markAsRead(id, userId) {
    try {
      const notification = await Notification.findById(id);
      
      if (!notification) {
        throw new Error('Notification not found');
      }

      if (notification.userId !== userId) {
        throw new Error('Unauthorized: Notification does not belong to this user');
      }

      return await notification.markAsRead();
    } catch (error) {
      console.error('Notification service - Mark as read error:', error);
      throw error;
    }
  }

  async markAllAsRead(userId) {
    try {
      const notifications = await Notification.findUnreadByUserId(userId);
      const updatePromises = notifications.map(notification => notification.markAsRead());
      
      return await Promise.all(updatePromises);
    } catch (error) {
      console.error('Notification service - Mark all as read error:', error);
      throw error;
    }
  }

  // Order notifications
  async notifyOrderCreation(order, orderItems) {
    try {
      // Notify customer
      const user = await userService.getUserById(order.userId);
      
      await this.createNotification({
        userId: order.userId,
        type: 'order_created',
        title: 'Order Placed Successfully',
        message: `Your order #${order.id.slice(0, 8)} has been placed successfully.`,
        data: { orderId: order.id },
      });

      // Send email to customer
      await emailService.sendOrderConfirmationEmail(user.email, order, orderItems);

      // Group items by vendor and send notifications to each vendor
      const itemsByVendor = {};
      for (const item of orderItems) {
        if (!itemsByVendor[item.vendorId]) {
          itemsByVendor[item.vendorId] = [];
        }
        itemsByVendor[item.vendorId].push(item);
      }

      // Notify each vendor
      for (const vendorId in itemsByVendor) {
        await this.createNotification({
          userId: vendorId,
          type: 'new_order_items',
          title: 'New Order Received',
          message: `You have received new order items for order #${order.id.slice(0, 8)}.`,
          data: { 
            orderId: order.id,
            items: itemsByVendor[vendorId].length
          },
        });

        // Send email to vendor
        const vendor = await userService.getUserById(vendorId);
        await emailService.sendVendorOrderNotificationEmail(vendor.email, order, itemsByVendor[vendorId]);
      }

    } catch (error) {
      console.error('Notification service - Order creation notification error:', error);
      // Don't throw to avoid breaking the order flow, just log the error
    }
  }

  async notifyOrderStatusUpdate(order) {
    try {
      // Notify customer
      await this.createNotification({
        userId: order.userId,
        type: 'order_status_updated',
        title: 'Order Status Updated',
        message: `Your order #${order.id.slice(0, 8)} status has been updated to ${order.status}.`,
        data: { orderId: order.id, status: order.status },
      });

      // Send email to customer
      const user = await userService.getUserById(order.userId);
      await emailService.sendOrderStatusUpdateEmail(user.email, order);

    } catch (error) {
      console.error('Notification service - Order status update notification error:', error);
      // Don't throw to avoid breaking the order flow, just log the error
    }
  }

  async notifyOrderItemStatusUpdate(orderItem) {
    try {
      // Get order to notify the customer
      const { data: order } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderItem.orderId)
        .single();

      // Get product info
      const { data: product } = await supabase
        .from('products')
        .select('name')
        .eq('id', orderItem.productId)
        .single();

      const productName = product ? product.name : 'Product';

      // Notify customer
      await this.createNotification({
        userId: order.user_id,
        type: 'order_item_status_updated',
        title: 'Order Item Status Updated',
        message: `The status for ${productName} in your order #${order.id.slice(0, 8)} has been updated to ${orderItem.status}.`,
        data: { 
          orderId: order.id,
          orderItemId: orderItem.id,
          status: orderItem.status 
        },
      });

      // Send email to customer
      const user = await userService.getUserById(order.user_id);
      await emailService.sendOrderItemStatusUpdateEmail(user.email, orderItem, product);

    } catch (error) {
      console.error('Notification service - Order item status update notification error:', error);
      // Don't throw to avoid breaking the order flow, just log the error
    }
  }

  // Inventory notifications
  async notifyLowInventory(product, vendor) {
    try {
      // Notify vendor
      await this.createNotification({
        userId: vendor.id,
        type: 'inventory_alert',
        title: 'Low Inventory Alert',
        message: `The product ${product.name} is running low on stock. Current quantity: ${product.stockQuantity}.`,
        data: { productId: product.id },
      });

      // Send email to vendor
      await emailService.sendLowInventoryAlertEmail(vendor.email, product);

    } catch (error) {
      console.error('Notification service - Low inventory notification error:', error);
      // Don't throw, just log the error
    }
  }

  // Additional notification methods as needed
}

module.exports = new NotificationService();