const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
  cardNumber: { type: String, required: true },
  last4: { type: String, required: true },
  holderName: { type: String, required: true },
  expiryMonth: { type: String, required: true },
  expiryYear: { type: String, required: true },
  cardPinHash: { type: String },
  type: { type: String, enum: ['debit', 'credit'], default: 'debit' },
  network: { type: String, enum: ['visa', 'mastercard', 'rupay'], default: 'rupay' },
  status: { type: String, enum: ['active', 'blocked', 'expired'], default: 'active' },
  isFrozen: { type: Boolean, default: false },
  limit: { type: Number, default: 100000 },
}, { timestamps: true });

cardSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.cardPinHash;
  return obj;
};

module.exports = mongoose.model('Card', cardSchema);
