import apiClient from '../apiClient';
export const transactionService = {
  getTransactions: (params) => apiClient.get('/transactions', { params }),
  sendMoney: (receiverMobile, amount, note) => apiClient.post('/transactions/send', { receiverMobile, amount, note }),
  getTransactionDetail: (id) => apiClient.get(`/transactions/${id}`),
};
