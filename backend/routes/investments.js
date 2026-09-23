const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getPortfolio, getInvestmentDetail, invest } = require('../controllers/investmentController');

router.get('/', protect, getPortfolio);
router.post('/invest', protect, invest);
router.get('/:id', protect, getInvestmentDetail);

module.exports = router;
