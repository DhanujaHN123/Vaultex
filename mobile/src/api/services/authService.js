import apiClient from '../apiClient';

export const authService = {
  register: (name, mobile) => apiClient.post('/auth/register', { name, mobile }),
  sendOTP: (mobile, purpose = 'verify') => apiClient.post('/auth/send-otp', { mobile, purpose }),
  verifyOTP: (mobile, otp, purpose) => apiClient.post('/auth/verify-otp', { mobile, otp, purpose }),
  setPin: (mobile, pin, confirmPin) => apiClient.post('/auth/set-pin', { mobile, pin, confirmPin }),
  login: (mobile, pin) => apiClient.post('/auth/login', { mobile, pin }),
  forgotPin: (mobile) => apiClient.post('/auth/forgot-pin', { mobile }),
  resetPin: (mobile, pin, confirmPin) => apiClient.post('/auth/reset-pin', { mobile, pin, confirmPin }),
  logout: () => apiClient.post('/auth/logout'),
  getSavedAccounts: (mobiles) => apiClient.get(`/auth/saved-accounts?mobiles=${mobiles.join(',')}`),
};
