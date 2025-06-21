const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticateUser, requireCustomer } = require('../middleware/auth');

// All payment routes require authentication
router.use(authenticateUser);

router.post('/initialize', requireCustomer, paymentController.initializePayment);
router.post('/verify', requireCustomer, paymentController.verifyPayment);
router.get('/status/:reference', paymentController.getPaymentStatus);

module.exports = router;
