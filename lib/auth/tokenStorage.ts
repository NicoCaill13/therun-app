import { Platform } from 'react-native';

import * as SecureStore from 'expo-secure-store';

export const ACCESS_TOKEN_STORAGE_KEY = 'therun.accessToken';

export async function persistAccessToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }
  await SecureStore.setItemAsync(ACCESS_TOKEN_STORAGE_KEY, token);
}
