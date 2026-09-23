import apiClient from '../apiClient';
export const cardService = {
  getCards: () => apiClient.get('/cards'),
  freezeCard: (id) => apiClient.post(`/cards/${id}/freeze`),
  changeCardPin: (id, currentPin, newPin) => apiClient.post(`/cards/${id}/change-pin`, { currentPin, newPin }),
  blockCard: (id) => apiClient.post(`/cards/${id}/block`),
};
