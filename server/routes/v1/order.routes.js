const express = require('express');
const orderController = require('../../controllers/order.controller');
const authMiddleware = require('../../middleware/auth');
const authorize = require('../../middleware/authorize');

const router = express.Router();

// Customer order routes
router.post('/', authMiddleware, authorize('customer'), orderController.createOrder);
router.get('/my-orders', authMiddleware, authorize('customer'), orderController.getCustomerOrders);
router.get('/:id', authMiddleware, orderController.getOrder);

// Vendor order routes
router.get('/vendor/items', authMiddleware, authorize('vendor'), orderController.getVendorOrderItems);
router.put('/items/:id/status', authMiddleware, authorize('vendor'), orderController.updateOrderItemStatus);

// Admin order routes
router.get('/', authMiddleware, authorize('admin'), orderController.getAllOrders);
router.put('/:id/status', authMiddleware, authorize('admin'), orderController.updateOrderStatus);

module.exports = router;