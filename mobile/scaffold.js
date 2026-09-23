const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, 'src');

const dirs = [
  'api/services',
  'components',
  'navigation',
  'screens/auth',
  'screens/dashboard',
  'screens/profile',
  'screens/history',
  'screens/send',
  'screens/receive',
  'screens/pay',
  'screens/bills',
  'screens/insurance',
  'screens/cards',
  'screens/accounts',
  'screens/investments',
  'screens/loans',
  'screens/help',
  'store',
  'utils'
];

dirs.forEach(dir => {
  fs.mkdirSync(path.join(root, dir), { recursive: true });
});

const files = {
  'api/apiClient.js': `import axios from 'axios';
import useStore from '../store/useStore';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api', // Use 10.0.2.2:5000 for Android emulator
});

apiClient.interceptors.request.use(config => {
  const token = useStore.getState().token;
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      useStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
`,
  'store/useStore.js': `import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useStore = create((set, get) => ({
  user: null,
  token: null,
  account: null,
  transactions: [],
  isAuthenticated: false,
  isLoading: false,

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setAccount: (account) => set({ account }),
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setLoading: (isLoading) => set({ isLoading }),
  setTransactions: (transactions) => set({ transactions }),
  
  logout: async () => {
    set({ user: null, token: null, account: null, isAuthenticated: false });
    await AsyncStorage.removeItem('vaultx_token');
    await AsyncStorage.removeItem('vaultx_user');
  },
  
  loadAuthState: async () => {
    try {
      const token = await AsyncStorage.getItem('vaultx_token');
      const userStr = await AsyncStorage.getItem('vaultx_user');
      if (token && userStr) {
        set({ token, user: JSON.parse(userStr), isAuthenticated: true });
      }
    } catch (e) {
      console.error(e);
    }
  }
}));

export default useStore;
`
};

Object.keys(files).forEach(file => {
  fs.writeFileSync(path.join(root, file), files[file]);
});

console.log('Scaffolding complete!');
