import { Platform, Share as RNShare } from 'react-native';
import { useCallback } from 'react';

export function useShare() {
  return useCallback(async (url: string, title: string) => {
    if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ url, title });
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      }
    } else {
      await RNShare.share({ message: url, title });
    }
  }, []);
}
