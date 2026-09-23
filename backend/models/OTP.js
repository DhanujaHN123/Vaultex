const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  mobile: { type: String, required: true },
  otpHash: { type: String, required: true },
  purpose: { type: String, enum: ['register', 'forgot_pin', 'verify'], required: true },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
}, { timestamps: true });

module.exports = mongoose.model('OTP', otpSchema);
