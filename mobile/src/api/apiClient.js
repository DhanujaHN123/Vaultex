import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';

// Dynamically determine the backend host IP
const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api';
  }

  // Detect Metro bundler host IP if running via Expo Go over LAN
  const scriptURL = NativeModules.SourceCode?.scriptURL;
  if (scriptURL) {
    const address = scriptURL.split('://')[1]?.split('/')[0];
    const hostname = address?.split(':')[0];
    if (hostname && !hostname.includes('localhost') && !hostname.includes('127.0.0.1') && !hostname.includes('exp.direct') && !hostname.includes('ngrok')) {
      return `http://${hostname}:5000/api`;
    }
  }

  // Fallback to laptop's Wi-Fi LAN IP (reachable by physical phone on same network)
  return 'http://172.19.84.127:5000/api';
};

const BASE_URL = getBaseUrl();
console.log('🔗 [VaultX API URL]:', BASE_URL);

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('vaultx_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle global errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('vaultx_token');
      await AsyncStorage.removeItem('vaultx_user');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
export { BASE_URL };
