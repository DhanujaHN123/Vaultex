const { successResponse, errorResponse } = require('../utils/apiResponse');

const FAQS = [
  { category: 'Account & Profile', items: [
    { q: 'How do I update my profile information?', a: 'Go to Profile screen and tap "Edit Profile" to update your name, email, and address.' },
    { q: 'How do I change my PIN?', a: 'Go to Profile > Security > Change PIN. You will need to verify via OTP first.' },
    { q: 'Can I have multiple accounts on VaultX?', a: 'Yes! You can link multiple accounts. Go to My Accounts > Link Another Account.' },
  ]},
  { category: 'Payments & Transfers', items: [
    { q: 'What is the maximum amount I can send?', a: 'You can send up to ₹1,00,000 per transaction. Daily limits may apply.' },
    { q: 'How long does a transfer take?', a: 'VaultX transfers are instant — funds are credited immediately.' },
    { q: 'What is a UPI ID?', a: 'Your VaultX UPI ID is your registered mobile number followed by @vaultx (e.g., 9876543210@vaultx).' },
  ]},
  { category: 'Security', items: [
    { q: 'Is my data secure with VaultX?', a: 'Yes. We use bank-grade 256-bit AES encryption and secure JWT authentication.' },
    { q: 'What should I do if I forget my PIN?', a: 'Tap "Forgot PIN" on the login screen. We will send an OTP to your registered mobile to reset your PIN.' },
    { q: 'How do I report suspicious activity?', a: 'Contact our support team immediately via the Help & Support section.' },
  ]},
  { category: 'Bills', items: [
    { q: 'Which bill categories are supported?', a: 'Electricity, Mobile, Internet, DTH, Water, and Rent.' },
    { q: 'Will I get a receipt for bill payment?', a: 'Yes. Every bill payment creates a transaction record viewable in History.' },
    { q: 'Can I schedule bill payments?', a: 'Bill scheduling is coming soon. Stay tuned for updates.' },
  ]},
  { category: 'Cards', items: [
    { q: 'How do I freeze my VaultX debit card?', a: 'Go to Cards screen and tap "Freeze Card". Tap again to unfreeze.' },
    { q: 'What do I do if my card is lost?', a: 'Block your card immediately from the Cards screen. Then contact our support team.' },
    { q: 'How do I change my card PIN?', a: 'Go to Cards > Change Card PIN. Enter your current PIN and set a new one.' },
  ]},
  { category: 'Loans', items: [
    { q: 'What types of loans does VaultX offer?', a: 'Personal, Education, Home, and Vehicle loans with competitive interest rates.' },
    { q: 'How long does loan approval take?', a: 'Loan applications are reviewed within 24-48 hours.' },
    { q: 'How is EMI calculated?', a: 'EMI = P × r × (1+r)^n / ((1+r)^n - 1), where P is principal, r is monthly rate, and n is tenure in months.' },
  ]},
];

const getFAQs = async (req, res) => {
  try {
    const { search } = req.query;
    if (search) {
      const searchLower = search.toLowerCase();
      const filtered = FAQS.map(cat => ({
        ...cat,
        items: cat.items.filter(item => item.q.toLowerCase().includes(searchLower) || item.a.toLowerCase().includes(searchLower)),
      })).filter(cat => cat.items.length > 0);
      return successResponse(res, filtered, 'FAQs fetched.');
    }
    return successResponse(res, FAQS, 'FAQs fetched.');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch FAQs.', 500);
  }
};

const createSupportRequest = async (req, res) => {
  try {
    const { issueType, description } = req.body;
    const ticketNumber = `VX-TICKET-${Date.now()}`;
    console.log(`📩 Support Request [${ticketNumber}]: ${issueType} - ${description} (User: ${req.user?.mobile || 'anonymous'})`);
    return successResponse(res, { ticketNumber, message: 'We will respond within 24 hours.' }, 'Support request submitted.');
  } catch (error) {
    return errorResponse(res, 'Failed to submit support request.', 500);
  }
};

module.exports = { getFAQs, createSupportRequest };
