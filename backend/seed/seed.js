require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Card = require('../models/Card');
const Bill = require('../models/Bill');
const Insurance = require('../models/Insurance');
const Investment = require('../models/Investment');
const Loan = require('../models/Loan');

const DEMO_PIN = '1234';
const generateTxId = () => `VX${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding...');

    // Clear existing demo data
    await User.deleteMany({ mobile: { $in: ['9876543210', '9876543211', '9999999999'] } });
    console.log('🗑️  Cleared existing demo data');

    const pinHash = await bcrypt.hash(DEMO_PIN, 12);

    const users = [
      { name: 'Aarav Sharma', mobile: '9876543210', balance: 45750.50, accountNumber: 'VX1234567890' },
      { name: 'Priya Patel', mobile: '9876543211', balance: 28320.00, accountNumber: 'VX0987654321' },
      { name: 'Demo User', mobile: '9999999999', balance: 100000.00, accountNumber: 'VX1111222233' },
    ];

    for (const userData of users) {
      const user = await User.create({ ...userData, pin: pinHash, isVerified: true });

      // Primary Account
      const account = await Account.create({
        userId: user._id,
        accountNumber: user.accountNumber,
        type: 'savings',
        balance: user.balance,
        isPrimary: true,
        status: 'active',
      });

      // Debit Card
      const last4 = Math.floor(1000 + Math.random() * 9000).toString();
      await Card.create({
        userId: user._id,
        accountId: account._id,
        cardNumber: `****-****-****-${last4}`,
        last4,
        holderName: user.name.toUpperCase(),
        expiryMonth: '12',
        expiryYear: '27',
        type: 'debit',
        network: 'rupay',
        status: 'active',
        isFrozen: false,
      });

      // Bills
      const billCategories = [
        { category: 'electricity', provider: 'BESCOM', consumerNumber: `BESC${Math.floor(100000 + Math.random() * 900000)}`, amount: 1250, dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), status: 'pending' },
        { category: 'mobile', provider: 'Airtel', consumerNumber: user.mobile, amount: 599, dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), status: 'overdue' },
        { category: 'internet', provider: 'ACT Fibernet', consumerNumber: `ACT${Math.floor(10000 + Math.random() * 90000)}`, amount: 999, dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), status: 'pending' },
      ];
      for (const bill of billCategories) {
        await Bill.create({ userId: user._id, ...bill });
      }

      // Insurance Policies
      const policyNum1 = `VX-INS-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      await Insurance.create({
        userId: user._id, type: 'health', provider: 'Star Health Insurance',
        policyNumber: policyNum1, premium: 12500, sumAssured: 500000,
        startDate: new Date('2024-01-01'), renewalDate: new Date('2025-01-01'), status: 'active', members: [user.name, 'Spouse'],
      });
      const policyNum2 = `VX-INS-${Date.now() + 1}-${Math.floor(1000 + Math.random() * 9000)}`;
      await Insurance.create({
        userId: user._id, type: 'life', provider: 'LIC of India',
        policyNumber: policyNum2, premium: 25000, sumAssured: 5000000,
        startDate: new Date('2023-06-01'), renewalDate: new Date('2025-06-01'), status: 'active', members: [user.name],
      });

      // Investments
      await Investment.create({ userId: user._id, type: 'mutual_fund', name: 'Axis Bluechip Fund', investedAmount: 15000, currentValue: 17250, units: 150, returns: 15, status: 'active' });
      await Investment.create({ userId: user._id, type: 'fd', name: 'VaultX Fixed Deposit', investedAmount: 50000, currentValue: 53500, units: 1, returns: 7, status: 'active', maturityDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) });
      await Investment.create({ userId: user._id, type: 'digital_gold', name: 'Digital Gold', investedAmount: 5000, currentValue: 5400, units: 1.2, returns: 8, status: 'active' });

      // Loans
      await Loan.create({
        userId: user._id, type: 'personal', amount: 200000, sanctionedAmount: 200000,
        interestRate: 10.5, tenure: 24, emi: 9287, status: 'active',
        disbursedAt: new Date('2024-01-15'), nextEmiDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), paidEmis: 3,
      });

      console.log(`✅ Created demo user: ${user.name} (${user.mobile}) | PIN: ${DEMO_PIN}`);
    }

    // Demo transactions between user 1 and 2
    const user1 = await User.findOne({ mobile: '9876543210' });
    const user2 = await User.findOne({ mobile: '9876543211' });
    const user3 = await User.findOne({ mobile: '9999999999' });

    const txSamples = [
      { senderId: user1._id, receiverId: user2._id, senderAccount: 'VX1234567890', receiverAccount: 'VX0987654321', amount: 5000, type: 'debit', description: 'Sent to Priya Patel', category: 'transfer' },
      { senderId: user2._id, receiverId: user1._id, senderAccount: 'VX0987654321', receiverAccount: 'VX1234567890', amount: 2000, type: 'credit', description: 'Received from Priya Patel', category: 'transfer' },
      { senderId: user1._id, receiverId: null, senderAccount: 'VX1234567890', amount: 1250, type: 'bill_payment', description: 'Electricity Bill - BESCOM', category: 'bills' },
      { senderId: user3._id, receiverId: user1._id, senderAccount: 'VX1111222233', receiverAccount: 'VX1234567890', amount: 10000, type: 'credit', description: 'Transfer from Demo User', category: 'transfer' },
      { senderId: user1._id, receiverId: null, senderAccount: 'VX1234567890', amount: 599, type: 'bill_payment', description: 'Mobile Recharge - Airtel', category: 'bills' },
      { senderId: user2._id, receiverId: user3._id, senderAccount: 'VX0987654321', receiverAccount: 'VX1111222233', amount: 3000, type: 'upi_payment', description: 'UPI Payment to 9999999999@vaultx', category: 'transfer' },
    ];

    for (const tx of txSamples) {
      await Transaction.create({
        transactionId: generateTxId(),
        status: 'success',
        ...tx,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
      });
    }

    console.log('\n🎉 Seeding completed successfully!');
    console.log('\nDemo Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('User 1: 9876543210 | PIN: 1234 | Balance: ₹45,750.50');
    console.log('User 2: 9876543211 | PIN: 1234 | Balance: ₹28,320.00');
    console.log('User 3: 9999999999 | PIN: 1234 | Balance: ₹1,00,000.00');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedData();
