import apiClient from '../apiClient';
export const insuranceService = {
  getPolicies: () => apiClient.get('/insurance'),
  getPolicyDetail: (id) => apiClient.get(`/insurance/${id}`),
  applyPolicy: (data) => apiClient.post('/insurance/apply', data),
};
