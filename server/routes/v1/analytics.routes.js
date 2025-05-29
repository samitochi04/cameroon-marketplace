const express = require('express');
const analyticsController = require('../../controllers/analytics.controller');
const authMiddleware = require('../../middleware/auth');
const authorize = require('../../middleware/authorize');

const router = express.Router();

// Admin analytics routes
router.get('/platform/summary', authMiddleware, authorize('admin'), analyticsController.getPlatformSummary);
router.get('/platform/sales', authMiddleware, authorize('admin'), analyticsController.getSalesOverTime);
router.get('/platform/top-products', authMiddleware, authorize('admin'), analyticsController.getTopSellingProducts);

// Vendor analytics routes
router.get('/vendor/summary', authMiddleware, authorize('vendor'), analyticsController.getVendorSummary);
router.get('/vendor/sales', authMiddleware, authorize('vendor'), analyticsController.getVendorSalesOverTime);
router.get('/vendor/top-products', authMiddleware, authorize('vendor'), analyticsController.getVendorTopProducts);

module.exports = router;