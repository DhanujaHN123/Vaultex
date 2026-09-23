export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '₹0.00';
  return '₹' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ', ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};

export const maskAccountNumber = (number) => {
  if (!number) return '';
  return number.slice(0, 2) + '****' + number.slice(-4);
};

export const maskCardNumber = (last4) => {
  return `****-****-****-${last4 || '0000'}`;
};

export const formatMobile = (mobile) => {
  if (!mobile) return '';
  return `+91 ${mobile.slice(0, 5)} ${mobile.slice(5)}`;
};

export const getTransactionSign = (tx, currentUserId) => {
  if (tx.type === 'credit') return '+';
  if (tx.type === 'debit' || tx.type === 'bill_payment' || tx.type === 'upi_payment') return '-';
  if (tx.senderId?._id === currentUserId || tx.senderId === currentUserId) return '-';
  return '+';
};

export const getTransactionColor = (tx, currentUserId, colors) => {
  const sign = getTransactionSign(tx, currentUserId);
  return sign === '+' ? colors.success : colors.error;
};

export const getCategoryIcon = (category) => {
  const icons = {
    transfer: '💸', bills: '🧾', shopping: '🛍️', food: '🍔',
    transport: '🚗', investment: '📈', loan: '🏦', other: '📋',
    electricity: '⚡', mobile: '📱', internet: '🌐', dth: '📺',
    water: '💧', rent: '🏠',
  };
  return icons[category] || '💳';
};

export const getLoanStatusColor = (status, colors) => {
  const map = { applied: colors.warning, approved: colors.primary, active: colors.success, closed: colors.grayText, rejected: colors.error };
  return map[status] || colors.grayText;
};
