import apiClient from '../apiClient';
export const billService = {
  getBills: () => apiClient.get('/bills'),
  addBill: (data) => apiClient.post('/bills', data),
  payBill: (id, pin) => apiClient.post(`/bills/${id}/pay`, typeof pin === 'object' && pin !== null ? pin : { pin }),
  getBillHistory: () => apiClient.get('/bills/history'),
};
