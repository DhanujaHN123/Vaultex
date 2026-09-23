const bcrypt = require('bcryptjs');
const Card = require('../models/Card');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const getCards = async (req, res) => {
  try {
    const cards = await Card.find({ userId: req.user._id });
    return successResponse(res, cards, 'Cards fetched.');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch cards.', 500);
  }
};

const freezeCard = async (req, res) => {
  try {
    const card = await Card.findOne({ _id: req.params.id, userId: req.user._id });
    if (!card) return errorResponse(res, 'Card not found.', 404);
    if (card.status === 'blocked') return errorResponse(res, 'Cannot freeze a blocked card.', 400);
    card.isFrozen = !card.isFrozen;
    await card.save();
    return successResponse(res, card, `Card ${card.isFrozen ? 'frozen' : 'unfrozen'} successfully.`);
  } catch (error) {
    return errorResponse(res, 'Failed to update card status.', 500);
  }
};

const changeCardPin = async (req, res) => {
  try {
    const { currentPin, newPin } = req.body;
    if (!newPin || !/^\d{4}$/.test(newPin)) return errorResponse(res, 'New PIN must be 4 digits.', 400);
    const card = await Card.findOne({ _id: req.params.id, userId: req.user._id }).select('+cardPinHash');
    if (!card) return errorResponse(res, 'Card not found.', 404);
    if (card.cardPinHash) {
      const isMatch = await bcrypt.compare(currentPin, card.cardPinHash);
      if (!isMatch) return errorResponse(res, 'Current PIN is incorrect.', 401);
    }
    card.cardPinHash = await bcrypt.hash(newPin, 12);
    await card.save();
    return successResponse(res, {}, 'Card PIN changed successfully.');
  } catch (error) {
    return errorResponse(res, 'Failed to change card PIN.', 500);
  }
};

const blockCard = async (req, res) => {
  try {
    const card = await Card.findOne({ _id: req.params.id, userId: req.user._id });
    if (!card) return errorResponse(res, 'Card not found.', 404);
    card.status = 'blocked';
    card.isFrozen = false;
    await card.save();
    return successResponse(res, card, 'Card blocked permanently. Contact support to get a new card.');
  } catch (error) {
    return errorResponse(res, 'Failed to block card.', 500);
  }
};

module.exports = { getCards, freezeCard, changeCardPin, blockCard };
