const orderService = require('../services/order.service');

// Customer order endpoints
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, shippingAddress, billingAddress, paymentMethod, totalAmount } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No items provided for the order',
      });
    }

    const order = await orderService.createOrder({
      userId,
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      totalAmount,
    });

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message,
    });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await orderService.getOrderById(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check if the order belongs to the user (unless admin)
    if (req.user.role !== 'admin' && order.order.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this order',
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Get order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get order',
      error: error.message,
    });
  }
};

exports.getCustomerOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const orders = await orderService.getOrdersByUserId(userId);

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error('Get customer orders error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get orders',
      error: error.message,
    });
  }
};

// Vendor order endpoints
exports.getVendorOrderItems = async (req, res) => {
  try {
    const vendorId = req.user.id;
    
    const orderItems = await orderService.getVendorOrderItems(vendorId);

    return res.status(200).json({
      success: true,
      data: orderItems,
    });
  } catch (error) {
    console.error('Get vendor order items error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get order items',
      error: error.message,
    });
  }
};

exports.updateOrderItemStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const vendorId = req.user.id;
    
    const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const orderItem = await orderService.updateOrderItemStatus(id, status, vendorId);

    return res.status(200).json({
      success: true,
      message: `Order item status updated to ${status}`,
      data: orderItem,
    });
  } catch (error) {
    console.error('Update order item status error:', error);
    
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to update order item status',
      error: error.message,
    });
  }
};

// Admin order endpoints
exports.getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;
    
    const orders = status ? 
      await orderService.getOrdersByStatus(status) : 
      await orderService.getAllOrders();

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get orders',
      error: error.message,
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['processing', 'completed', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const order = await orderService.updateOrderStatus(id, status);

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order,
    });
  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message,
    });
  }
};