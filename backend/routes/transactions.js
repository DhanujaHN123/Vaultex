const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { getTransactions, sendMoney, getTransactionDetail } = require('../controllers/transactionController');

router.get('/', protect, getTransactions);
router.post('/send', protect, [
  body('receiverMobile').trim().matches(/^\d{10}$/).withMessage('Enter a valid 10-digit receiver mobile number'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
  body('pin').trim().matches(/^\d{4}$/).withMessage('PIN must be exactly 4 digits'),
], validate, sendMoney);
router.get('/:id', protect, getTransactionDetail);

module.exports = router;
