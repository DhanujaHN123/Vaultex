const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const generateTransactionId = () => {
  return `VX${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
};

// GET /api/transactions
const getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, category, search, startDate, endDate } = req.query;
    const userId = req.user._id;
    // Role-aware query: sender sees only their outgoing (debit/bill/upi) records;
    // receiver sees only incoming (credit) records. Prevents both parties from
    // seeing duplicate entries for the same transfer.
    const query = {
      $or: [
        { senderId: userId, type: { $in: ['debit', 'bill_payment', 'upi_payment'] } },
        { receiverId: userId, type: 'credit' },
      ],
    };
    if (type) query.type = type;
    if (category) query.category = category;
    if (search) query.description = { $regex: search, $options: 'i' };
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    const transactions = await Transaction.find(query)
      .populate('senderId', 'name mobile accountNumber')
      .populate('receiverId', 'name mobile accountNumber')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Transaction.countDocuments(query);
    return successResponse(res, { transactions, total, page: Number(page), pages: Math.ceil(total / limit) }, 'Transactions fetched.');
  } catch (error) {
    console.error('GetTransactions error:', error);
    return errorResponse(res, 'Failed to fetch transactions.', 500);
  }
};

// POST /api/transactions/send
const sendMoney = async (req, res) => {
  try {
    const { receiverMobile, amount, note, pin } = req.body;
    const parsedAmount = parseFloat(amount);
    if (!receiverMobile || !parsedAmount || parsedAmount <= 0) {
      return errorResponse(res, 'Invalid request. Provide receiver mobile and valid amount.', 400);
    }
    if (parsedAmount > 100000) {
      return errorResponse(res, 'Amount exceeds single transaction limit of ₹1,00,000.', 400);
    }

    const sender = await User.findById(req.user._id).select('+pin');
    const receiver = await User.findOne({ mobile: receiverMobile, isVerified: true });

    // --- PIN verification (backend-enforced) ---
    // PIN must be provided and must match the sender's stored bcrypt hash.
    // This runs BEFORE any balance change or transaction record is created.
    if (!pin) {
      return errorResponse(res, 'PIN is required to authorise this transfer.', 400);
    }
    if (!sender.pin) {
      return errorResponse(res, 'Account PIN not set. Please complete account setup.', 400);
    }
    const isPinValid = await bcrypt.compare(String(pin), sender.pin);
    if (!isPinValid) {
      return errorResponse(res, 'Incorrect PIN. Transfer has been cancelled.', 401);
    }
    // --- End PIN verification ---

    if (!receiver) return errorResponse(res, 'Receiver not found. Check the mobile number.', 404);
    if (sender._id.toString() === receiver._id.toString()) {
      return errorResponse(res, 'Cannot send money to yourself.', 400);
    }
    if (sender.balance < parsedAmount) {
      return errorResponse(res, 'Insufficient balance.', 400);
    }

    const senderAccount = await Account.findOne({ userId: sender._id, isPrimary: true });
    const receiverAccount = await Account.findOne({ userId: receiver._id, isPrimary: true });

    // Deduct from sender
    sender.balance -= parsedAmount;
    await sender.save();
    if (senderAccount) {
      senderAccount.balance -= parsedAmount;
      await senderAccount.save();
    }

    // Add to receiver
    receiver.balance += parsedAmount;
    await receiver.save();
    if (receiverAccount) {
      receiverAccount.balance += parsedAmount;
      await receiverAccount.save();
    }

    const txId = generateTransactionId();
    const description = note || `Transfer to ${receiver.name}`;

    const debitTx = await Transaction.create({
      transactionId: `${txId}_D`,
      senderId: sender._id,
      receiverId: receiver._id,
      senderAccount: senderAccount?.accountNumber,
      receiverAccount: receiverAccount?.accountNumber,
      amount: parsedAmount,
      type: 'debit',
      status: 'success',
      description,
      note,
      category: 'transfer',
    });

    const creditTx = await Transaction.create({
      transactionId: `${txId}_C`,
      senderId: sender._id,
      receiverId: receiver._id,
      senderAccount: senderAccount?.accountNumber,
      receiverAccount: receiverAccount?.accountNumber,
      amount: parsedAmount,
      type: 'credit',
      status: 'success',
      description: note || `Received from ${sender.name}`,
      note,
      category: 'transfer',
    });

    return successResponse(res, {
      transactionId: txId,
      amount: parsedAmount,
      receiver: { name: receiver.name, mobile: receiver.mobile },
      senderBalance: sender.balance,
      transaction: debitTx,
    }, 'Money sent successfully!');
  } catch (error) {
    console.error('SendMoney error:', error);
    return errorResponse(res, 'Transaction failed. Please try again.', 500);
  }
};

// GET /api/transactions/:id
const getTransactionDetail = async (req, res) => {
  try {
    const userId = req.user._id;
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      $or: [{ senderId: userId }, { receiverId: userId }],
    })
      .populate('senderId', 'name mobile accountNumber')
      .populate('receiverId', 'name mobile accountNumber');
    if (!transaction) return errorResponse(res, 'Transaction not found.', 404);
    return successResponse(res, transaction, 'Transaction details fetched.');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch transaction details.', 500);
  }
};

module.exports = { getTransactions, sendMoney, getTransactionDetail };
