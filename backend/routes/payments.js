const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { makePayment, getPaymentHistory } = require('../controllers/paymentController');

router.post('/pay', protect, makePayment);
router.get('/history', protect, getPaymentHistory);

module.exports = router;
