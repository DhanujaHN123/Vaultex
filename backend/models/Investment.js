const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['mutual_fund', 'stocks', 'fd', 'digital_gold'], required: true },
  name: { type: String, required: true },
  investedAmount: { type: Number, required: true },
  currentValue: { type: Number, required: true },
  units: { type: Number, default: 0 },
  returns: { type: Number, default: 0 },
  startDate: { type: Date, default: Date.now },
  maturityDate: { type: Date },
  status: { type: String, enum: ['active', 'matured', 'withdrawn'], default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('Investment', investmentSchema);
