import apiClient from '../apiClient';
export const paymentService = {
  makePayment: (data) => apiClient.post('/payments/pay', data),
  getPaymentHistory: () => apiClient.get('/payments/history'),
};
