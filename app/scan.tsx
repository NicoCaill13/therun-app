import { View, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Header, Typography, Button } from '@/components/ui';

// ============================================================================
// QR Scanner screen
// - Native: shows camera for scanning QR codes
// - Web: redirects to code entry (camera not available)
// ============================================================================

export default function ScanScreen() {
  const router = useRouter();

  // On web, camera is not available; fallback to code entry
  if (Platform.OS === 'web') {
    return (
      <View className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center px-6 max-w-md mx-auto w-full">
        <MaterialIcons name="no-photography" size={48} color="#d1d5db" />
        <Typography variant="h3" className="text-center mt-4 mb-2">
          Camera not available
        </Typography>
        <Typography variant="body" color="secondary" className="text-center mb-6">
          QR scanning requires a mobile device. Please use the code entry instead.
        </Typography>
        <Button onPress={() => router.replace('/join/code')}>Enter code manually</Button>
      </View>
    );
  }

  // Native camera placeholder
  return (
    <View className="flex-1 bg-black">
      <Header title="Scan QR Code" className="bg-transparent" />
      <View className="flex-1 items-center justify-center">
        <View className="w-64 h-64 border-2 border-white/50 rounded-3xl items-center justify-center">
          <MaterialIcons name="qr-code-scanner" size={64} color="#ffffff" />
        </View>
        <Typography variant="body" color="white" className="mt-6 text-center px-8">
          Point your camera at a THE RUN QR code
        </Typography>
      </View>
      <View className="px-4 pb-8">
        <Button
          variant="secondary"
          onPress={() => router.replace('/join/code')}
          className="border-white"
        >
          <Typography className="text-white font-sans-bold">Enter code manually</Typography>
        </Button>
      </View>
    </View>
  );
}
