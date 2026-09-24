const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { getBills, addBill, payBill, getBillHistory } = require('../controllers/billController');

router.get('/history', protect, getBillHistory);
router.get('/', protect, getBills);
router.post('/', protect, addBill);
router.post('/:id/pay', protect, [
  body('pin').trim().matches(/^\d{4}$/).withMessage('PIN must be exactly 4 digits'),
], validate, payBill);

module.exports = router;
