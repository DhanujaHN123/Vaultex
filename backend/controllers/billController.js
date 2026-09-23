const Bill = require('../models/Bill');
const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const generateTransactionId = () => `VX${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;

const getBills = async (req, res) => {
  try {
    const bills = await Bill.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return successResponse(res, bills, 'Bills fetched.');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch bills.', 500);
  }
};

const addBill = async (req, res) => {
  try {
    const { category, provider, consumerNumber, amount, dueDate } = req.body;
    const bill = await Bill.create({ userId: req.user._id, category, provider, consumerNumber, amount, dueDate, status: 'pending' });
    return successResponse(res, bill, 'Bill added successfully.', 201);
  } catch (error) {
    return errorResponse(res, 'Failed to add bill.', 500);
  }
};

const payBill = async (req, res) => {
  try {
    const bill = await Bill.findOne({ _id: req.params.id, userId: req.user._id });
    if (!bill) return errorResponse(res, 'Bill not found.', 404);
    if (bill.status === 'paid') return errorResponse(res, 'Bill already paid.', 400);

    const user = await User.findById(req.user._id);
    if (user.balance < bill.amount) return errorResponse(res, 'Insufficient balance.', 400);

    user.balance -= bill.amount;
    await user.save();
    const account = await Account.findOne({ userId: user._id, isPrimary: true });
    if (account) { account.balance -= bill.amount; await account.save(); }

    const tx = await Transaction.create({
      transactionId: generateTransactionId(),
      senderId: user._id,
      senderAccount: account?.accountNumber,
      amount: bill.amount,
      type: 'bill_payment',
      status: 'success',
      description: `${bill.category} bill - ${bill.provider}`,
      category: 'bills',
    });

    bill.status = 'paid';
    bill.paidAt = new Date();
    bill.transactionId = tx._id;
    await bill.save();

    return successResponse(res, { bill, transaction: tx, newBalance: user.balance }, 'Bill paid successfully!');
  } catch (error) {
    console.error('PayBill error:', error);
    return errorResponse(res, 'Bill payment failed.', 500);
  }
};

const getBillHistory = async (req, res) => {
  try {
    const bills = await Bill.find({ userId: req.user._id, status: 'paid' }).sort({ paidAt: -1 });
    return successResponse(res, bills, 'Bill history fetched.');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch bill history.', 500);
  }
};

module.exports = { getBills, addBill, payBill, getBillHistory };
