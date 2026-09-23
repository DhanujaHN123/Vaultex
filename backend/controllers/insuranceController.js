const Insurance = require('../models/Insurance');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const getPolicies = async (req, res) => {
  try {
    const policies = await Insurance.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return successResponse(res, policies, 'Policies fetched.');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch policies.', 500);
  }
};

const getPolicyDetail = async (req, res) => {
  try {
    const policy = await Insurance.findOne({ _id: req.params.id, userId: req.user._id });
    if (!policy) return errorResponse(res, 'Policy not found.', 404);
    return successResponse(res, policy, 'Policy details fetched.');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch policy details.', 500);
  }
};

const applyPolicy = async (req, res) => {
  try {
    const { type, provider, premium, sumAssured, startDate, renewalDate, members } = req.body;
    const policyNumber = `VX-INS-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const policy = await Insurance.create({
      userId: req.user._id, type, provider, policyNumber, premium, sumAssured,
      startDate: startDate || new Date(),
      renewalDate: renewalDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      members: members || [],
    });
    return successResponse(res, policy, 'Policy application submitted successfully.', 201);
  } catch (error) {
    console.error('ApplyPolicy error:', error);
    return errorResponse(res, 'Failed to apply for policy.', 500);
  }
};

module.exports = { getPolicies, getPolicyDetail, applyPolicy };
