const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: { type: String, unique: true, required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  senderAccount: { type: String },
  receiverAccount: { type: String },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['credit', 'debit', 'transfer', 'bill_payment', 'upi_payment'], required: true },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'success' },
  description: { type: String },
  note: { type: String },
  category: { type: String, enum: ['transfer', 'bills', 'shopping', 'food', 'transport', 'investment', 'loan', 'other'], default: 'transfer' },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
