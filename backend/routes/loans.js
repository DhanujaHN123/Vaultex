const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getLoanOffers, calculateEMI, applyLoan, getLoanStatus } = require('../controllers/loanController');

router.get('/offers', protect, getLoanOffers);
router.post('/calculate-emi', calculateEMI);
router.post('/apply', protect, applyLoan);
router.get('/status', protect, getLoanStatus);

module.exports = router;
