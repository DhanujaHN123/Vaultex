const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['personal', 'education', 'home', 'vehicle'], required: true },
  amount: { type: Number, required: true },
  sanctionedAmount: { type: Number },
  interestRate: { type: Number, required: true },
  tenure: { type: Number, required: true },
  emi: { type: Number },
  status: { type: String, enum: ['applied', 'approved', 'active', 'closed', 'rejected'], default: 'applied' },
  disbursedAt: { type: Date },
  nextEmiDate: { type: Date },
  paidEmis: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Loan', loanSchema);
