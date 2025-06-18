const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Create new order
router.post('/', orderController.createOrder);

// Get order by ID
router.get('/:id', orderController.getOrderById);

// Get orders by user ID
router.get('/user/:userId', orderController.getOrdersByUserId);

module.exports = router;