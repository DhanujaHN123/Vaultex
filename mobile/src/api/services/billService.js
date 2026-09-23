import apiClient from '../apiClient';
export const billService = {
  getBills: () => apiClient.get('/bills'),
  addBill: (data) => apiClient.post('/bills', data),
  payBill: (id) => apiClient.post(`/bills/${id}/pay`),
  getBillHistory: () => apiClient.get('/bills/history'),
};
