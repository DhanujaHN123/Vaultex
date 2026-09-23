const Account = require('../models/Account');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// GET /api/accounts
const getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ userId: req.user._id }).sort({ isPrimary: -1, createdAt: -1 });
    return successResponse(res, accounts, 'Accounts fetched.');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch accounts.', 500);
  }
};

// POST /api/accounts/link
const linkAccount = async (req, res) => {
  try {
    const { mobile } = req.body;
    const targetUser = await User.findOne({ mobile, isVerified: true });
    if (!targetUser) {
      return errorResponse(res, 'No verified VaultX account found with this mobile number.', 404);
    }
    if (targetUser._id.toString() === req.user._id.toString()) {
      return errorResponse(res, 'You cannot link your own account.', 400);
    }
    const account = await Account.findOne({ userId: targetUser._id, isPrimary: true });
    if (!account) {
      return errorResponse(res, 'Account not found for this user.', 404);
    }
    return successResponse(res, { account, user: { name: targetUser.name, mobile: targetUser.mobile } }, 'Account linked successfully.');
  } catch (error) {
    return errorResponse(res, 'Failed to link account.', 500);
  }
};

// GET /api/accounts/:id
const getAccountDetail = async (req, res) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, userId: req.user._id });
    if (!account) return errorResponse(res, 'Account not found.', 404);
    return successResponse(res, account, 'Account details fetched.');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch account details.', 500);
  }
};

// GET /api/accounts/:id/statement
const getStatement = async (req, res) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, userId: req.user._id });
    if (!account) return errorResponse(res, 'Account not found.', 404);
    const { startDate, endDate, page = 1, limit = 20 } = req.query;
    const query = {
      $or: [{ senderAccount: account.accountNumber }, { receiverAccount: account.accountNumber }],
    };
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Transaction.countDocuments(query);
    return successResponse(res, { transactions, total, page: Number(page), pages: Math.ceil(total / limit) }, 'Statement fetched.');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch statement.', 500);
  }
};

module.exports = { getAccounts, linkAccount, getAccountDetail, getStatement };
