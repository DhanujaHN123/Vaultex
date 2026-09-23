const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const generateTransactionId = () => `VX${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;

// POST /api/payments/pay
const makePayment = async (req, res) => {
  try {
    const { receiverUPI, receiverMobile, amount, note } = req.body;
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) return errorResponse(res, 'Invalid amount.', 400);

    let mobile = receiverMobile;
    if (receiverUPI && !mobile) {
      mobile = receiverUPI.split('@')[0];
    }
    if (!mobile) return errorResponse(res, 'Provide receiver UPI ID or mobile number.', 400);

    const sender = await User.findById(req.user._id);
    const receiver = await User.findOne({ mobile, isVerified: true });
    if (!receiver) return errorResponse(res, 'Receiver not found. Verify the UPI ID or mobile.', 404);
    if (sender._id.toString() === receiver._id.toString()) return errorResponse(res, 'Cannot pay yourself.', 400);
    if (sender.balance < parsedAmount) return errorResponse(res, 'Insufficient balance.', 400);

    const senderAccount = await Account.findOne({ userId: sender._id, isPrimary: true });
    const receiverAccount = await Account.findOne({ userId: receiver._id, isPrimary: true });

    sender.balance -= parsedAmount;
    await sender.save();
    if (senderAccount) { senderAccount.balance -= parsedAmount; await senderAccount.save(); }

    receiver.balance += parsedAmount;
    await receiver.save();
    if (receiverAccount) { receiverAccount.balance += parsedAmount; await receiverAccount.save(); }

    const txId = generateTransactionId();
    const tx = await Transaction.create({
      transactionId: txId,
      senderId: sender._id,
      receiverId: receiver._id,
      senderAccount: senderAccount?.accountNumber,
      receiverAccount: receiverAccount?.accountNumber,
      amount: parsedAmount,
      type: 'upi_payment',
      status: 'success',
      description: note || `UPI Payment to ${receiver.mobile}@vaultx`,
      note,
      category: 'transfer',
    });

    return successResponse(res, { transactionId: txId, amount: parsedAmount, receiver: { name: receiver.name, mobile: receiver.mobile }, senderBalance: sender.balance }, 'Payment successful!');
  } catch (error) {
    console.error('MakePayment error:', error);
    return errorResponse(res, 'Payment failed. Please try again.', 500);
  }
};

// GET /api/payments/history
const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;
    const transactions = await Transaction.find({
      senderId: userId,
      type: 'upi_payment',
    }).populate('receiverId', 'name mobile').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
    const total = await Transaction.countDocuments({ senderId: userId, type: 'upi_payment' });
    return successResponse(res, { transactions, total }, 'Payment history fetched.');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch payment history.', 500);
  }
};

module.exports = { makePayment, getPaymentHistory };
