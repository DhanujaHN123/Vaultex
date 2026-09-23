const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const User = require('../models/User');
const Account = require('../models/Account');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { generateOTP, storeOTP, verifyOTP: verifyOTPService } = require('../services/otpService');
const generateAccountNumber = require('../utils/generateAccountNumber');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, mobile } = req.body;
    const existing = await User.findOne({ mobile, isVerified: true });
    if (existing) {
      return errorResponse(res, 'Mobile number already registered.', 409);
    }
    // Remove any unverified registration
    await User.deleteOne({ mobile, isVerified: false });

    const accountNumber = generateAccountNumber();
    const user = await User.create({ name, mobile, accountNumber, balance: 10000, isVerified: false });

    const otp = generateOTP();
    await storeOTP(mobile, otp, 'register');

    return successResponse(res, { userId: user._id, devOTP: process.env.NODE_ENV === 'development' ? otp : undefined }, 'OTP sent successfully.', 201);
  } catch (error) {
    console.error('Register error:', error);
    return errorResponse(res, 'Registration failed. Please try again.', 500);
  }
};

// POST /api/auth/send-otp
const sendOTP = async (req, res) => {
  try {
    const { mobile, purpose } = req.body;
    const otp = generateOTP();
    await storeOTP(mobile, otp, purpose || 'verify');
    return successResponse(res, { devOTP: process.env.NODE_ENV === 'development' ? otp : undefined }, 'OTP sent successfully.');
  } catch (error) {
    console.error('SendOTP error:', error);
    return errorResponse(res, 'Failed to send OTP.', 500);
  }
};

// POST /api/auth/verify-otp
const verifyOTP = async (req, res) => {
  try {
    const { mobile, otp, purpose } = req.body;
    const result = await verifyOTPService(mobile, otp, purpose);
    if (!result.valid) {
      return errorResponse(res, result.message, 400);
    }
    if (purpose === 'register') {
      await User.findOneAndUpdate({ mobile }, { isVerified: true });
    }
    const user = await User.findOne({ mobile });
    return successResponse(res, { userId: user?._id, mobile }, 'OTP verified successfully.');
  } catch (error) {
    console.error('VerifyOTP error:', error);
    return errorResponse(res, 'OTP verification failed.', 500);
  }
};

// POST /api/auth/set-pin
const setPin = async (req, res) => {
  try {
    const { mobile, pin, confirmPin } = req.body;
    if (pin !== confirmPin) {
      return errorResponse(res, 'PINs do not match.', 400);
    }
    if (!/^\d{4}$/.test(pin)) {
      return errorResponse(res, 'PIN must be exactly 4 digits.', 400);
    }
    const user = await User.findOne({ mobile, isVerified: true });
    if (!user) {
      return errorResponse(res, 'Account not found or not verified.', 404);
    }
    const pinHash = await bcrypt.hash(pin, 12);
    user.pin = pinHash;
    await user.save();

    // Create primary account if not exists
    let account = await Account.findOne({ userId: user._id, isPrimary: true });
    if (!account) {
      account = await Account.create({
        userId: user._id,
        accountNumber: user.accountNumber,
        type: 'savings',
        balance: user.balance,
        isPrimary: true,
        status: 'active',
      });
    }

    const token = generateToken(user._id);
    return successResponse(res, { token, user: user.toJSON() }, 'PIN set successfully. Welcome to VaultX!');
  } catch (error) {
    console.error('SetPin error:', error);
    return errorResponse(res, 'Failed to set PIN.', 500);
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { mobile, pin } = req.body;
    const user = await User.findOne({ mobile, isVerified: true }).select('+pin');
    if (!user) {
      return errorResponse(res, 'Account not found. Please register first.', 404);
    }
    if (!user.pin) {
      return errorResponse(res, 'PIN not set. Please complete registration.', 400);
    }
    const isMatch = await bcrypt.compare(pin, user.pin);
    if (!isMatch) {
      return errorResponse(res, 'Invalid PIN. Please try again.', 401);
    }
    const token = generateToken(user._id);
    const account = await Account.findOne({ userId: user._id, isPrimary: true });
    // Sync balance
    if (account) {
      user.balance = account.balance;
      await user.save();
    }
    return successResponse(res, { token, user: user.toJSON(), account }, 'Login successful.');
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 'Login failed. Please try again.', 500);
  }
};

// POST /api/auth/forgot-pin
const forgotPin = async (req, res) => {
  try {
    const { mobile } = req.body;
    const user = await User.findOne({ mobile, isVerified: true });
    if (!user) {
      return errorResponse(res, 'No verified account found with this mobile number.', 404);
    }
    const otp = generateOTP();
    await storeOTP(mobile, otp, 'forgot_pin');
    return successResponse(res, { devOTP: process.env.NODE_ENV === 'development' ? otp : undefined }, 'OTP sent to your registered mobile number.');
  } catch (error) {
    console.error('ForgotPin error:', error);
    return errorResponse(res, 'Failed to initiate PIN reset.', 500);
  }
};

// POST /api/auth/reset-pin
const resetPin = async (req, res) => {
  try {
    const { mobile, pin, confirmPin } = req.body;
    if (pin !== confirmPin) {
      return errorResponse(res, 'PINs do not match.', 400);
    }
    if (!/^\d{4}$/.test(pin)) {
      return errorResponse(res, 'PIN must be exactly 4 digits.', 400);
    }
    const user = await User.findOne({ mobile, isVerified: true });
    if (!user) {
      return errorResponse(res, 'Account not found.', 404);
    }
    const pinHash = await bcrypt.hash(pin, 12);
    user.pin = pinHash;
    await user.save();
    return successResponse(res, {}, 'PIN reset successfully.');
  } catch (error) {
    console.error('ResetPin error:', error);
    return errorResponse(res, 'Failed to reset PIN.', 500);
  }
};

// POST /api/auth/logout
const logout = async (req, res) => {
  try {
    return successResponse(res, {}, 'Logged out successfully.');
  } catch (error) {
    return errorResponse(res, 'Logout failed.', 500);
  }
};

// GET /api/auth/saved-accounts?mobiles=X,Y,Z
const getSavedAccounts = async (req, res) => {
  try {
    const { mobiles } = req.query;
    if (!mobiles) return successResponse(res, [], 'No saved accounts.');
    const mobileList = mobiles.split(',').map(m => m.trim()).filter(Boolean);
    const users = await User.find({ mobile: { $in: mobileList }, isVerified: true }).select('name mobile accountNumber createdAt');
    return successResponse(res, users, 'Saved accounts fetched.');
  } catch (error) {
    console.error('GetSavedAccounts error:', error);
    return errorResponse(res, 'Failed to fetch saved accounts.', 500);
  }
};

module.exports = { register, sendOTP, verifyOTP, setPin, login, forgotPin, resetPin, logout, getSavedAccounts };
