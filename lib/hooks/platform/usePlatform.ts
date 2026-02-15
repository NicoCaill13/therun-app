import { Platform } from 'react-native';

interface PlatformInfo {
  isWeb: boolean;
  isNative: boolean;
  isIOS: boolean;
  isAndroid: boolean;
}

const platformInfo: PlatformInfo = {
  isWeb: Platform.OS === 'web',
  isNative: Platform.OS !== 'web',
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
};

export function usePlatform(): PlatformInfo {
  return platformInfo;
}
