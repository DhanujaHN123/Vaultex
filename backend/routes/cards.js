const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getCards, freezeCard, changeCardPin, blockCard } = require('../controllers/cardController');

router.get('/', protect, getCards);
router.post('/:id/freeze', protect, freezeCard);
router.post('/:id/change-pin', protect, changeCardPin);
router.post('/:id/block', protect, blockCard);

module.exports = router;
