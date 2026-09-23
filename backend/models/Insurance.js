const mongoose = require('mongoose');

const insuranceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['health', 'life', 'vehicle', 'home'], required: true },
  provider: { type: String, required: true },
  policyNumber: { type: String, unique: true, required: true },
  premium: { type: Number, required: true },
  sumAssured: { type: Number, required: true },
  startDate: { type: Date, required: true },
  renewalDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'expired', 'pending'], default: 'active' },
  members: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Insurance', insuranceSchema);
