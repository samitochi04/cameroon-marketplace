const express = require('express');
const productController = require('../../controllers/product.controller');
const authMiddleware = require('../../middleware/auth');
const authorize = require('../../middleware/authorize');

const router = express.Router();

// Public product routes
router.get('/search', productController.searchProducts);
router.get('/category/:categoryId', productController.getProductsByCategory);
router.get('/:id', productController.getProduct);
router.get('/slug/:slug', productController.getProductBySlug);

// Vendor product management routes
router.post('/', authMiddleware, authorize('vendor'), productController.createProduct);
router.put('/:id', authMiddleware, authorize('vendor'), productController.updateProduct);
router.get('/vendor/products', authMiddleware, authorize('vendor'), productController.getVendorProducts);
router.post('/:id/publish', authMiddleware, authorize('vendor'), productController.publishProduct);
router.post('/:id/archive', authMiddleware, authorize('vendor'), productController.archiveProduct);

module.exports = router;