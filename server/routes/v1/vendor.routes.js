const express = require('express');
const vendorController = require('../../controllers/vendor.controller');
const authMiddleware = require('../../middleware/auth');
const authorize = require('../../middleware/authorize');

const router = express.Router();

// Vendor registration and profile management
router.post('/register', authMiddleware, authorize('customer'), vendorController.registerVendor);
router.get('/profile', authMiddleware, authorize('vendor'), vendorController.getVendorProfile);
router.put('/profile', authMiddleware, authorize('vendor'), vendorController.updateVendorProfile);

// Admin vendor management
router.get('/pending', authMiddleware, authorize('admin'), vendorController.getPendingVendors);
router.post('/:id/approve', authMiddleware, authorize('admin'), vendorController.approveVendor);
router.post('/:id/reject', authMiddleware, authorize('admin'), vendorController.rejectVendor);

module.exports = router;