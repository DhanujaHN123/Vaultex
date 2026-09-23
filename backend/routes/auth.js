const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const { protect } = require('../middleware/auth');
const {
  register, sendOTP, verifyOTP, setPin, login,
  forgotPin, resetPin, logout, getSavedAccounts
} = require('../controllers/authController');

router.post('/register', authLimiter, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('mobile').trim().matches(/^\d{10}$/).withMessage('Enter a valid 10-digit mobile number'),
], validate, register);

router.post('/send-otp', authLimiter, [
  body('mobile').trim().matches(/^\d{10}$/).withMessage('Enter a valid 10-digit mobile number'),
  body('purpose').optional().isIn(['register', 'forgot_pin', 'verify']).withMessage('Invalid OTP purpose'),
], validate, sendOTP);

router.post('/verify-otp', [
  body('mobile').trim().matches(/^\d{10}$/).withMessage('Enter a valid 10-digit mobile number'),
  body('otp').trim().isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('purpose').isIn(['register', 'forgot_pin', 'verify']).withMessage('Invalid purpose'),
], validate, verifyOTP);

router.post('/set-pin', [
  body('mobile').trim().matches(/^\d{10}$/).withMessage('Enter a valid 10-digit mobile number'),
  body('pin').trim().matches(/^\d{4}$/).withMessage('PIN must be exactly 4 digits'),
  body('confirmPin').trim().matches(/^\d{4}$/).withMessage('Confirm PIN must be 4 digits'),
], validate, setPin);

router.post('/login', authLimiter, [
  body('mobile').trim().matches(/^\d{10}$/).withMessage('Enter a valid 10-digit mobile number'),
  body('pin').trim().matches(/^\d{4}$/).withMessage('PIN must be exactly 4 digits'),
], validate, login);

router.post('/forgot-pin', authLimiter, [
  body('mobile').trim().matches(/^\d{10}$/).withMessage('Enter a valid 10-digit mobile number'),
], validate, forgotPin);

router.post('/reset-pin', [
  body('mobile').trim().matches(/^\d{10}$/).withMessage('Enter a valid 10-digit mobile number'),
  body('pin').trim().matches(/^\d{4}$/).withMessage('PIN must be exactly 4 digits'),
  body('confirmPin').trim().matches(/^\d{4}$/).withMessage('Confirm PIN must be 4 digits'),
], validate, resetPin);

router.post('/logout', protect, logout);
router.get('/saved-accounts', getSavedAccounts);

module.exports = router;
