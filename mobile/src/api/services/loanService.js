import apiClient from '../apiClient';
export const loanService = {
  getLoanOffers: () => apiClient.get('/loans/offers'),
  calculateEMI: (principal, rate, tenure) => apiClient.post('/loans/calculate-emi', { principal, rate, tenure }),
  applyLoan: (data) => apiClient.post('/loans/apply', data),
  getLoanStatus: () => apiClient.get('/loans/status'),
};
