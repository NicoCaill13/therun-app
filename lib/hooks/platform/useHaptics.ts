import { Platform } from 'react-native';
import { useCallback } from 'react';

type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

export function useHaptics() {
  const trigger = useCallback(async (style: HapticStyle = 'light') => {
    if (Platform.OS === 'web') return;

    try {
      const Haptics = require('expo-haptics');
      const impactMap: Record<string, unknown> = {
        light: Haptics.ImpactFeedbackStyle.Light,
        medium: Haptics.ImpactFeedbackStyle.Medium,
        heavy: Haptics.ImpactFeedbackStyle.Heavy,
      };
      const notificationMap: Record<string, unknown> = {
        success: Haptics.NotificationFeedbackType.Success,
        warning: Haptics.NotificationFeedbackType.Warning,
        error: Haptics.NotificationFeedbackType.Error,
      };

      if (impactMap[style]) {
        await Haptics.impactAsync(impactMap[style]);
      } else if (notificationMap[style]) {
        await Haptics.notificationAsync(notificationMap[style]);
      }
    } catch {
      // Haptics not available - no-op
    }
  }, []);

  return { trigger };
}
