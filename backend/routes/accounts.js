const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getAccounts, linkAccount, getAccountDetail, getStatement } = require('../controllers/accountController');

router.get('/', protect, getAccounts);
router.post('/link', protect, linkAccount);
router.get('/:id/statement', protect, getStatement);
router.get('/:id', protect, getAccountDetail);

module.exports = router;
