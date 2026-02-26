import { create } from 'zustand';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import type { User } from '@krishiconnect/shared';

const KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
} as const;

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isHydrated: boolean;
  setAuth: (user: User | null, accessToken: string | null, refreshToken: string | null) => Promise<void>;
  setUser: (user: User | null) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

const isWeb = Platform.OS === 'web';

async function getStored(key: string): Promise<string | null> {
  try {
    if (isWeb && typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  } catch {
    if (isWeb && typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  }
}

async function setStored(key: string, value: string | null): Promise<void> {
  try {
    if (isWeb && typeof localStorage !== 'undefined') {
      if (value == null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
      return;
    }
    if (value == null) {
      await SecureStore.deleteItemAsync(key);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  } catch (_) {
    if (isWeb && typeof localStorage !== 'undefined') {
      if (value == null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    }
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isHydrated: false,

  setAuth: async (user, accessToken, refreshToken) => {
    await Promise.all([
      setStored(KEYS.ACCESS_TOKEN, accessToken),
      setStored(KEYS.REFRESH_TOKEN, refreshToken),
      setStored(KEYS.USER, user ? JSON.stringify(user) : null),
    ]);
    set({ user, accessToken, refreshToken });
  },

  setUser: async (user) => {
    if (user != null) {
      await setStored(KEYS.USER, JSON.stringify(user));
    }
    set({ user });
  },

  logout: async () => {
    await Promise.all([
      setStored(KEYS.ACCESS_TOKEN, null),
      setStored(KEYS.REFRESH_TOKEN, null),
      setStored(KEYS.USER, null),
    ]);
    set({ user: null, accessToken: null, refreshToken: null });
  },

  hydrate: async () => {
    const [accessToken, refreshToken, userRaw] = await Promise.all([
      getStored(KEYS.ACCESS_TOKEN),
      getStored(KEYS.REFRESH_TOKEN),
      getStored(KEYS.USER),
    ]);
    let user: User | null = null;
    if (userRaw) {
      try {
        user = JSON.parse(userRaw) as User;
      } catch (_) {}
    }
    set({
      accessToken,
      refreshToken,
      user,
      isHydrated: true,
    });
  },
}));
