import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Auth storage keys.
 */
const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_DATA_KEY = 'user_data';

/**
 * Web storage fallback using cookies/localStorage.
 * SecureStore is not available on web.
 */
const webStorage = {
  async getItem(key: string): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, value);
  },
  async deleteItem(key: string): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },
};

/**
 * Platform-aware secure storage.
 * Uses SecureStore on native, localStorage on web.
 */
const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return webStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      return webStorage.setItem(key, value);
    }
    return SecureStore.setItemAsync(key, value);
  },
  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      return webStorage.deleteItem(key);
    }
    return SecureStore.deleteItemAsync(key);
  },
};

/**
 * Get the stored auth token.
 */
export async function getAuthToken(): Promise<string | null> {
  return storage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Store the auth token.
 */
export async function setAuthToken(token: string): Promise<void> {
  return storage.setItem(AUTH_TOKEN_KEY, token);
}

/**
 * Remove the auth token.
 */
export async function removeAuthToken(): Promise<void> {
  return storage.deleteItem(AUTH_TOKEN_KEY);
}

/**
 * Get the stored refresh token.
 */
export async function getRefreshToken(): Promise<string | null> {
  return storage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Store the refresh token.
 */
export async function setRefreshToken(token: string): Promise<void> {
  return storage.setItem(REFRESH_TOKEN_KEY, token);
}

/**
 * Remove the refresh token.
 */
export async function removeRefreshToken(): Promise<void> {
  return storage.deleteItem(REFRESH_TOKEN_KEY);
}

/**
 * User data structure for storage.
 */
export interface StoredUserData {
  id: string;
  email: string | null;
  displayName: string;
  isGuest: boolean;
}

/**
 * Get stored user data.
 */
export async function getUserData(): Promise<StoredUserData | null> {
  const data = await storage.getItem(USER_DATA_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data) as StoredUserData;
  } catch {
    return null;
  }
}

/**
 * Store user data.
 */
export async function setUserData(user: StoredUserData): Promise<void> {
  return storage.setItem(USER_DATA_KEY, JSON.stringify(user));
}

/**
 * Remove user data.
 */
export async function removeUserData(): Promise<void> {
  return storage.deleteItem(USER_DATA_KEY);
}

/**
 * Clear all auth-related storage.
 * Use on logout.
 */
export async function clearAuthStorage(): Promise<void> {
  await Promise.all([
    removeAuthToken(),
    removeRefreshToken(),
    removeUserData(),
  ]);
}

/**
 * Check if user has stored credentials.
 */
export async function hasStoredCredentials(): Promise<boolean> {
  const token = await getAuthToken();
  return token !== null;
}
