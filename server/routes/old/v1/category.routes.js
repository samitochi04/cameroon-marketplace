const express = require('express');
const categoryController = require('../../controllers/category.controller');
const authMiddleware = require('../../middleware/old/auth');
const authorize = require('../../middleware/authorize');

const router = express.Router();

// Public category routes
router.get('/', categoryController.getAllCategories);
router.get('/top-level', categoryController.getTopLevelCategories);
router.get('/:id', categoryController.getCategory);
router.get('/:id/subcategories', categoryController.getSubcategories);

// Admin category management routes
router.post('/', authMiddleware, authorize('admin'), categoryController.createCategory);
router.put('/:id', authMiddleware, authorize('admin'), categoryController.updateCategory);

module.exports = router;