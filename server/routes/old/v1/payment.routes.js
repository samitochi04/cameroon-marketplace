const express = require('express');
const paymentController = require('../../controllers/old/payment.controller');
const authMiddleware = require('../../middleware/old/auth');
const authorize = require('../../middleware/authorize');

const router = express.Router();

// Public routes
router.post('/webhook', paymentController.handleWebhook);

// Customer routes
router.post('/initialize', authMiddleware, paymentController.initiatePayment);
router.get('/verify/:reference', authMiddleware, paymentController.verifyPayment);

// Vendor routes
router.post('/vendor/register', authMiddleware, authorize('vendor'), paymentController.registerVendor);
router.get('/vendor/info', authMiddleware, authorize('vendor'), paymentController.getVendorPaymentInfo);
router.put('/vendor/settings', authMiddleware, authorize('vendor'), paymentController.updateVendorPaymentSettings);

// Admin routes
// Add admin-specific payment routes here if needed

module.exports = router;
