import { View, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { usePlatform } from '@/lib/hooks/platform';
import { Typography, Button, PressableCard } from '@/components/ui';

// ============================================================================
// Join Event Options (maquette: join_event_options)
// ============================================================================

export default function JoinOptionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isWeb } = usePlatform();
  const paddingTop = Platform.OS === 'web' ? 16 : insets.top;

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <View className={Platform.OS === 'web' ? 'max-w-md mx-auto w-full flex-1' : 'flex-1'}>
        {/* Header */}
        <View
          className="flex-row items-center justify-between px-4 pb-2"
          style={{ paddingTop: paddingTop + 8 }}
        >
          <Pressable
            className="w-10 h-10 items-center justify-center"
            onPress={() => router.back()}
          >
            <MaterialIcons name="close" size={24} color="#0a181e" />
          </Pressable>
          <Typography variant="h4" className="font-sans-bold">
            THE RUN
          </Typography>
          <View className="w-10" />
        </View>

        <View className="flex-1 px-4 pt-4">
          <Typography variant="h1" className="font-sans-extrabold italic mb-1">
            JOIN
          </Typography>
          <Typography variant="h1" className="font-sans-extrabold italic mb-2">
            EVENT
          </Typography>
          <Typography variant="body" color="secondary" className="mb-8">
            Choose how you'd like to enter the race session.
          </Typography>

          {/* Scan QR - only on native */}
          {!isWeb && (
            <PressableCard
              padding="lg"
              className="mb-4 h-44 justify-end"
              onPress={() => router.push('/scan')}
            >
              <View className="absolute top-4 right-4 w-10 h-10 bg-charcoal rounded-xl items-center justify-center">
                <MaterialIcons name="photo-camera" size={20} color="#ffffff" />
              </View>
              <Typography variant="h3" className="font-sans-bold">
                Scan QR
              </Typography>
              <Typography variant="bodySmall" color="secondary">
                Fastest entry using your device camera.
              </Typography>
            </PressableCard>
          )}

          {/* Enter Code */}
          <PressableCard
            padding="lg"
            className="mb-4 h-44 justify-end"
            onPress={() => router.push('/join/code')}
          >
            <View className="absolute top-4 right-4 w-10 h-10 bg-charcoal rounded-xl items-center justify-center">
              <MaterialIcons name="keyboard" size={20} color="#ffffff" />
            </View>
            <Typography variant="h3" className="font-sans-bold">
              Enter Code
            </Typography>
            <Typography variant="bodySmall" color="secondary">
              Manually type the 6-digit event pin.
            </Typography>
          </PressableCard>
        </View>

        <View className="px-4 pb-8">
          <Button variant="primary">Need help joining?</Button>
          <Typography variant="caption" color="muted" className="text-center mt-3">
            AUTHORIZED ACCESS ONLY - THE RUN PREMIUM CLUB
          </Typography>
        </View>
      </View>
    </View>
  );
}
