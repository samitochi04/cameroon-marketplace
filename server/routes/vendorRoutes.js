const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { authenticateUser, requireVendor } = require('../middleware/auth');

// All vendor routes require authentication and vendor role
router.use(authenticateUser);
router.use(requireVendor);

// Update order item status (triggers payout if status changes to processing)
router.put('/order-items/:itemId/status', vendorController.updateOrderItemStatus);

// Get vendor earnings
router.get('/earnings', vendorController.getVendorEarnings);

module.exports = router;