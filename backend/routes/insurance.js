const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getPolicies, getPolicyDetail, applyPolicy } = require('../controllers/insuranceController');

router.get('/', protect, getPolicies);
router.post('/apply', protect, applyPolicy);
router.get('/:id', protect, getPolicyDetail);

module.exports = router;
