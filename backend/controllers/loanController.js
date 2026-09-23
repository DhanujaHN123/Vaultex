const Loan = require('../models/Loan');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const LOAN_OFFERS = [
  { type: 'personal', name: 'Personal Loan', maxAmount: 500000, interestRate: 10.5, maxTenure: 60, description: 'Quick personal loan for your needs' },
  { type: 'education', name: 'Education Loan', maxAmount: 2000000, interestRate: 8.0, maxTenure: 84, description: 'Invest in your future' },
  { type: 'home', name: 'Home Loan', maxAmount: 5000000, interestRate: 6.5, maxTenure: 240, description: 'Your dream home awaits' },
  { type: 'vehicle', name: 'Vehicle Loan', maxAmount: 1000000, interestRate: 7.5, maxTenure: 84, description: 'Drive your dream vehicle' },
];

const calculateEMIAmount = (principal, annualRate, tenureMonths) => {
  const r = annualRate / 12 / 100;
  if (r === 0) return principal / tenureMonths;
  const emi = (principal * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1);
  return Math.round(emi * 100) / 100;
};

const getLoanOffers = async (req, res) => {
  try {
    const userLoans = await Loan.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return successResponse(res, { offers: LOAN_OFFERS, myLoans: userLoans }, 'Loan offers fetched.');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch loan offers.', 500);
  }
};

const calculateEMI = async (req, res) => {
  try {
    const { principal, rate, tenure } = req.body;
    const p = parseFloat(principal);
    const r = parseFloat(rate);
    const t = parseInt(tenure);
    if (!p || !r || !t || p <= 0 || r <= 0 || t <= 0) {
      return errorResponse(res, 'Provide valid principal, rate, and tenure.', 400);
    }
    const emi = calculateEMIAmount(p, r, t);
    const totalAmount = emi * t;
    const totalInterest = totalAmount - p;
    return successResponse(res, { emi, totalAmount: Math.round(totalAmount * 100) / 100, totalInterest: Math.round(totalInterest * 100) / 100, principal: p, rate: r, tenure: t }, 'EMI calculated.');
  } catch (error) {
    return errorResponse(res, 'EMI calculation failed.', 500);
  }
};

const applyLoan = async (req, res) => {
  try {
    const { type, amount, tenure } = req.body;
    const offer = LOAN_OFFERS.find(o => o.type === type);
    if (!offer) return errorResponse(res, 'Invalid loan type.', 400);
    const parsedAmount = parseFloat(amount);
    const parsedTenure = parseInt(tenure);
    if (parsedAmount > offer.maxAmount) return errorResponse(res, `Maximum loan amount for ${type} loan is ₹${offer.maxAmount.toLocaleString('en-IN')}.`, 400);

    const emi = calculateEMIAmount(parsedAmount, offer.interestRate, parsedTenure);
    const nextEmiDate = new Date();
    nextEmiDate.setMonth(nextEmiDate.getMonth() + 1);

    const loan = await Loan.create({
      userId: req.user._id, type, amount: parsedAmount, interestRate: offer.interestRate,
      tenure: parsedTenure, emi, status: 'applied', nextEmiDate,
    });
    return successResponse(res, loan, 'Loan application submitted. We will review and get back to you.', 201);
  } catch (error) {
    console.error('ApplyLoan error:', error);
    return errorResponse(res, 'Loan application failed.', 500);
  }
};

const getLoanStatus = async (req, res) => {
  try {
    const loans = await Loan.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return successResponse(res, loans, 'Loan status fetched.');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch loan status.', 500);
  }
};

module.exports = { getLoanOffers, calculateEMI, applyLoan, getLoanStatus };
