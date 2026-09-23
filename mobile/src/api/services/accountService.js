import apiClient from '../apiClient';
export const accountService = {
  getAccounts: () => apiClient.get('/accounts'),
  linkAccount: (mobile) => apiClient.post('/accounts/link', { mobile }),
  getAccountDetail: (id) => apiClient.get(`/accounts/${id}`),
  getStatement: (id, params) => apiClient.get(`/accounts/${id}/statement`, { params }),
};
