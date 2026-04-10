import { Platform } from 'react-native';

import * as SecureStore from 'expo-secure-store';

export const ACCESS_TOKEN_STORAGE_KEY = 'therun.accessToken';

/** In-memory session for web (Expo SecureStore web stub); survives until refresh. */
let webAccessToken: string | null = null;

export async function persistAccessToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    webAccessToken = token;
    return;
  }
  await SecureStore.setItemAsync(ACCESS_TOKEN_STORAGE_KEY, token);
}

export async function getAccessToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return webAccessToken;
  }
  return SecureStore.getItemAsync(ACCESS_TOKEN_STORAGE_KEY);
}

export async function clearAccessToken(): Promise<void> {
  if (Platform.OS === 'web') {
    webAccessToken = null;
    return;
  }
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_STORAGE_KEY);
}
