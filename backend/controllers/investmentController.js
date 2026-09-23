const Investment = require('../models/Investment');
const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const getPortfolio = async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.user._id, status: { $ne: 'withdrawn' } }).sort({ createdAt: -1 });
    const totalInvested = investments.reduce((s, i) => s + i.investedAmount, 0);
    const totalCurrent = investments.reduce((s, i) => s + i.currentValue, 0);
    const totalReturns = totalCurrent - totalInvested;
    const returnsPercent = totalInvested > 0 ? ((totalReturns / totalInvested) * 100).toFixed(2) : 0;
    return successResponse(res, { investments, summary: { totalInvested, totalCurrent, totalReturns, returnsPercent } }, 'Portfolio fetched.');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch portfolio.', 500);
  }
};

const getInvestmentDetail = async (req, res) => {
  try {
    const investment = await Investment.findOne({ _id: req.params.id, userId: req.user._id });
    if (!investment) return errorResponse(res, 'Investment not found.', 404);
    return successResponse(res, investment, 'Investment details fetched.');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch investment details.', 500);
  }
};

const invest = async (req, res) => {
  try {
    const { type, name, amount } = req.body;
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) return errorResponse(res, 'Invalid amount.', 400);

    const user = await User.findById(req.user._id);
    if (user.balance < parsedAmount) return errorResponse(res, 'Insufficient balance.', 400);

    user.balance -= parsedAmount;
    await user.save();
    const account = await Account.findOne({ userId: user._id, isPrimary: true });
    if (account) { account.balance -= parsedAmount; await account.save(); }

    const returnsRate = { mutual_fund: 12, stocks: 15, fd: 7, digital_gold: 8 }[type] || 10;
    const investment = await Investment.create({
      userId: user._id, type, name, investedAmount: parsedAmount,
      currentValue: parsedAmount, units: parsedAmount, returns: returnsRate,
      status: 'active',
    });

    await Transaction.create({
      transactionId: `VX${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`,
      senderId: user._id,
      senderAccount: account?.accountNumber,
      amount: parsedAmount,
      type: 'debit',
      status: 'success',
      description: `Investment in ${name}`,
      category: 'investment',
    });

    return successResponse(res, { investment, newBalance: user.balance }, 'Investment created successfully.', 201);
  } catch (error) {
    console.error('Invest error:', error);
    return errorResponse(res, 'Investment failed.', 500);
  }
};

module.exports = { getPortfolio, getInvestmentDetail, invest };
