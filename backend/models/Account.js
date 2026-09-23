const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accountNumber: { type: String, unique: true, required: true },
  type: { type: String, enum: ['savings', 'current', 'salary'], default: 'savings' },
  ifsc: { type: String, default: 'VLTX0001234' },
  bankName: { type: String, default: 'VaultX Bank' },
  balance: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive', 'frozen'], default: 'active' },
  isPrimary: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Account', accountSchema);
