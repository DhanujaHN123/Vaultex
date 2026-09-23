const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getFAQs, createSupportRequest } = require('../controllers/supportController');

router.get('/faqs', getFAQs);
router.post('/request', protect, createSupportRequest);

module.exports = router;
