import apiClient from '../apiClient';
export const transactionService = {
  getTransactions: (params) => apiClient.get('/transactions', { params }),
  sendMoney: (receiverMobile, amount, note, pin) => apiClient.post('/transactions/send', { receiverMobile, amount, note, pin }),
  getTransactionDetail: (id) => apiClient.get(`/transactions/${id}`),
};
