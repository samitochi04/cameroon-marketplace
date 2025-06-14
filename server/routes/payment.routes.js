const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

router.post('/initialize', paymentController.initializePayment);
router.post('/verify', paymentController.verifyPayment);

module.exports = router;
