const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getBills, addBill, payBill, getBillHistory } = require('../controllers/billController');

router.get('/history', protect, getBillHistory);
router.get('/', protect, getBills);
router.post('/', protect, addBill);
router.post('/:id/pay', protect, payBill);

module.exports = router;
