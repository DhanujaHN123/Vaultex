import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  TOKEN: 'vaultx_token',
  USER: 'vaultx_user',
  SAVED_ACCOUNTS: 'vaultx_saved_accounts',
};

const useStore = create((set, get) => ({
  user: null,
  token: null,
  account: null,
  transactions: [],
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setAccount: (account) => set({ account }),
  setAuthenticated: (val) => set({ isAuthenticated: val }),
  setLoading: (val) => set({ isLoading: val }),
  setTransactions: (transactions) => set({ transactions }),

  login: async (token, user, account) => {
    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    // Save to saved accounts list
    const saved = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_ACCOUNTS);
    const savedList = saved ? JSON.parse(saved) : [];
    const exists = savedList.findIndex(a => a.mobile === user.mobile);
    const accountEntry = { name: user.name, mobile: user.mobile, accountNumber: user.accountNumber };
    if (exists >= 0) savedList[exists] = accountEntry;
    else savedList.push(accountEntry);
    await AsyncStorage.setItem(STORAGE_KEYS.SAVED_ACCOUNTS, JSON.stringify(savedList));
    set({ token, user, account, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    set({ token: null, user: null, account: null, isAuthenticated: false, isLoading: false });
  },

  loadAuthState: async () => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      const userStr = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({ token, user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (e) {
      set({ isLoading: false });
    }
  },

  getSavedAccounts: async () => {
    const saved = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_ACCOUNTS);
    return saved ? JSON.parse(saved) : [];
  },

  updateBalance: (newBalance) => {
    const user = get().user;
    if (user) {
      const updated = { ...user, balance: newBalance };
      set({ user: updated });
      AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
    }
  },
}));

export default useStore;
