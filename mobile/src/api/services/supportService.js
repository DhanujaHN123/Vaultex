import apiClient from '../apiClient';
export const supportService = {
  getFAQs: (search) => apiClient.get('/support/faqs', { params: search ? { search } : {} }),
  createSupportRequest: (data) => apiClient.post('/support/request', data),
};
