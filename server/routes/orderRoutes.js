const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateUser } = require('../middleware/auth');

// Create new order - requires authentication only (removed requireCustomer for now)
router.post('/', authenticateUser, orderController.createOrder);

// Get order by ID - requires authentication  
router.get('/:id', authenticateUser, orderController.getOrderById);

// Get orders by user ID - requires authentication (changed route)
router.get('/my-orders', authenticateUser, orderController.getOrdersByUserId);

module.exports = router;