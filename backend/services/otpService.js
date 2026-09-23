const bcrypt = require('bcryptjs');
const OTP = require('../models/OTP');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const storeOTP = async (mobile, otp, purpose) => {
  await OTP.deleteMany({ mobile, purpose });
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await OTP.create({ mobile, otpHash, purpose, expiresAt });
  if (process.env.NODE_ENV === 'development') {
    console.log(`\n🔑 OTP for ${mobile} [${purpose}]: ${otp}\n`);
  }
  return otp;
};

const verifyOTP = async (mobile, otp, purpose) => {
  const otpDoc = await OTP.findOne({ mobile, purpose });
  if (!otpDoc) {
    return { valid: false, message: 'OTP not found or already used. Please request a new OTP.' };
  }
  if (otpDoc.expiresAt < new Date()) {
    await OTP.deleteOne({ _id: otpDoc._id });
    return { valid: false, message: 'OTP has expired. Please request a new one.' };
  }
  const isMatch = await bcrypt.compare(otp, otpDoc.otpHash);
  if (!isMatch) {
    return { valid: false, message: 'Invalid OTP. Please try again.' };
  }
  await OTP.deleteOne({ _id: otpDoc._id });
  return { valid: true };
};

module.exports = { generateOTP, storeOTP, verifyOTP };
