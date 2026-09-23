import apiClient from '../apiClient';
export const investmentService = {
  getPortfolio: () => apiClient.get('/investments'),
  getInvestmentDetail: (id) => apiClient.get(`/investments/${id}`),
  invest: (data) => apiClient.post('/investments/invest', data),
};
