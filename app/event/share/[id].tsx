import { View, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEvent } from '@/lib/api/events';
import { useShare, useClipboard } from '@/lib/hooks/platform';
import { WEB_URL } from '@/lib/config/env';
import { Header, Typography, Badge, Button, Skeleton } from '@/components/ui';

// ============================================================================
// Share Event QR (maquette: share_event_qr)
// ============================================================================

export default function ShareEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading } = useEvent(id);
  const share = useShare();
  const { copy } = useClipboard();

  if (isLoading || !data) {
    return (
      <View className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center">
        <Skeleton width={200} height={200} borderRadius={12} />
      </View>
    );
  }

  const { event } = data;
  const shareUrl = `${WEB_URL}/welcome/${event.eventCode}`;

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <View className={Platform.OS === 'web' ? 'max-w-md mx-auto w-full flex-1' : 'flex-1'}>
        <Header title="Share Event" />

        <View className="flex-1 items-center px-4 pt-6">
          {/* Status badge */}
          <Badge
            variant="green"
            label="LIVE EVENT"
            icon={<View className="w-2 h-2 rounded-full bg-green-500" />}
            className="mb-4"
          />

          <Typography variant="h1" className="text-center mb-1">
            Invite the Pack
          </Typography>
          <Typography variant="body" color="secondary" className="text-center mb-8">
            Scan to join {event.title}
          </Typography>

          {/* QR Code placeholder */}
          <View className="w-72 h-72 bg-brand-orange-bg rounded-2xl items-center justify-center mb-6">
            <View className="w-48 h-48 bg-white rounded-xl items-center justify-center shadow-lg">
              <MaterialIcons name="qr-code-2" size={120} color="#0a181e" />
              <Typography variant="caption" color="secondary" className="mt-2">
                {event.title}
              </Typography>
            </View>
          </View>

          {/* Manual code */}
          <Typography variant="label" color="secondary" className="mb-2">
            MANUAL ENTRY CODE
          </Typography>
          <View className="bg-white dark:bg-gray-900 rounded-xl px-6 py-3 border border-gray-100 dark:border-gray-800">
            <Typography variant="h2" className="font-mono tracking-[0.3em]">
              {event.eventCode}
            </Typography>
          </View>
        </View>

        {/* Bottom buttons */}
        <View className="px-4 pb-8 gap-3">
          <Button
            onPress={() => share(shareUrl, `Join ${event.title} on THE RUN`)}
            leftIcon={<MaterialIcons name="ios-share" size={18} color="#ffffff" className="mr-2" />}
          >
            Share Event
          </Button>
          <Button variant="secondary" onPress={() => copy(shareUrl)}>
            Copy link
          </Button>
        </View>
      </View>
    </View>
  );
}
