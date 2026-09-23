const User = require('../models/User');
const Account = require('../models/Account');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// GET /api/users/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return errorResponse(res, 'User not found.', 404);
    const account = await Account.findOne({ userId: user._id, isPrimary: true });
    return successResponse(res, { user: user.toJSON(), account }, 'Profile fetched.');
  } catch (error) {
    console.error('GetProfile error:', error);
    return errorResponse(res, 'Failed to fetch profile.', 500);
  }
};

// PUT /api/users/profile
const updateProfile = async (req, res) => {
  try {
    const { name, email, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { ...(name && { name }), ...(email && { email }), ...(address && { address }) },
      { new: true, runValidators: true }
    );
    return successResponse(res, { user: user.toJSON() }, 'Profile updated successfully.');
  } catch (error) {
    console.error('UpdateProfile error:', error);
    return errorResponse(res, 'Failed to update profile.', 500);
  }
};

module.exports = { getProfile, updateProfile };
