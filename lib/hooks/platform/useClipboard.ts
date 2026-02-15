import { Platform } from 'react-native';
import { useCallback } from 'react';

export function useClipboard() {
  const copy = useCallback(async (text: string): Promise<boolean> => {
    try {
      if (Platform.OS === 'web') {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          await navigator.clipboard.writeText(text);
          return true;
        }
        return false;
      }

      // Native: use expo-clipboard if available, fallback to RN Clipboard
      const ExpoClipboard = require('expo-clipboard');
      await ExpoClipboard.setStringAsync(text);
      return true;
    } catch {
      return false;
    }
  }, []);

  return { copy };
}
