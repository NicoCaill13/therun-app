import { View, Pressable, Platform, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEvent } from '@/lib/api/events';
import { useClipboard } from '@/lib/hooks/platform';
import {
  Header,
  Typography,
  Badge,
  Card,
  Button,
  BottomBar,
  Skeleton,
} from '@/components/ui';

// ============================================================================
// Event Detail Dashboard (maquette: event_detail_dashboard)
// ============================================================================

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading } = useEvent(id);
  const { copy } = useClipboard();

  if (isLoading) return <EventDetailLoading />;
  if (!data) return null;

  const { event, organiser, participants } = data;
  const dateStr = new Date(event.startDateTime).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const statusVariant = event.status === 'UPCOMING'
    ? 'orange'
    : event.status === 'COMPLETED'
      ? 'gray'
      : 'green';

  const goingCount = participants.filter((p) => p.status === 'GOING').length;

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <View className={Platform.OS === 'web' ? 'max-w-md mx-auto w-full flex-1' : 'flex-1'}>
        <Header
          title="Event Details"
          rightAction={
            <View className="flex-row gap-2">
              <Pressable
                className="w-10 h-10 items-center justify-center"
                onPress={() => router.push(`/event/share/${id}`)}
              >
                <MaterialIcons name="share" size={20} color="#0a181e" />
              </Pressable>
              <Pressable className="w-10 h-10 items-center justify-center">
                <MaterialIcons name="more-horiz" size={20} color="#0a181e" />
              </Pressable>
            </View>
          }
        />

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Hero image placeholder */}
          <View className="mx-4 h-48 rounded-2xl bg-gray-200 dark:bg-gray-700 overflow-hidden items-center justify-center">
            <MaterialIcons name="image" size={48} color="#d1d5db" />
          </View>

          <View className="px-4 pt-4">
            {/* Status + org */}
            <View className="flex-row items-center gap-2 mb-2">
              <Badge variant={statusVariant} label={event.status} />
              <Typography variant="caption" color="secondary">
                {organiser.displayName}
              </Typography>
            </View>

            {/* Title */}
            <Typography variant="h1" className="mb-2">
              {event.title}
            </Typography>

            {/* Date */}
            <View className="flex-row items-center gap-2 mb-1">
              <MaterialIcons name="calendar-today" size={16} color="#6b7280" />
              <Typography variant="body" color="secondary">
                {dateStr}
              </Typography>
            </View>

            {/* Location */}
            {event.locationName && (
              <View className="flex-row items-center gap-2 mb-4">
                <MaterialIcons name="location-on" size={16} color="#6b7280" />
                <Typography variant="body" color="secondary">
                  {event.locationName}
                </Typography>
              </View>
            )}

            {/* Map placeholder */}
            <View className="h-40 rounded-xl bg-gray-100 dark:bg-gray-800 items-center justify-center mb-4">
              <Typography variant="bodySmall" color="secondary">
                Map preview
              </Typography>
            </View>

            {/* Description */}
            {event.description && (
              <>
                <Typography variant="label" color="secondary" className="mb-2">
                  DESCRIPTION
                </Typography>
                <Typography variant="body" color="secondary" className="mb-4">
                  {event.description}
                </Typography>
              </>
            )}

            {/* Invite code */}
            <Card padding="md" className="flex-row items-center justify-between mb-4">
              <View>
                <Typography variant="caption" color="secondary">
                  INVITE CODE
                </Typography>
                <Typography variant="h3" className="font-mono tracking-widest mt-1">
                  {event.eventCode}
                </Typography>
              </View>
              <Pressable
                className="flex-row items-center gap-1 bg-gray-100 rounded-lg px-3 py-2"
                onPress={() => copy(event.eventCode)}
              >
                <MaterialIcons name="content-copy" size={16} color="#0a181e" />
                <Typography variant="bodySmall" className="font-sans-semibold">
                  Copy
                </Typography>
              </Pressable>
            </Card>

            {/* Participants link */}
            <Pressable
              className="flex-row items-center gap-2 py-3 mb-4"
              onPress={() => router.push(`/event/participants/${id}`)}
            >
              <View className="flex-row -space-x-2">
                {[0, 1, 2].map((i) => (
                  <View
                    key={i}
                    className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"
                  />
                ))}
              </View>
              {goingCount > 3 && (
                <View className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white items-center justify-center">
                  <Typography variant="caption" className="font-sans-bold">
                    +{goingCount - 3}
                  </Typography>
                </View>
              )}
              <Typography variant="body" className="font-sans-medium ml-1">
                View {goingCount} participants
              </Typography>
              <MaterialIcons name="chevron-right" size={20} color="#9ca3af" />
            </Pressable>
          </View>
        </ScrollView>

        {/* Bottom bar */}
        <BottomBar>
          <View className="flex-row gap-3">
            <Button
              variant="primary"
              size="lg"
              isFullWidth={false}
              className="flex-1"
              onPress={() => router.push(`/event/share/${id}`)}
              leftIcon={<MaterialIcons name="qr-code-2" size={18} color="#ffffff" className="mr-2" />}
            >
              Show QR
            </Button>
            <Button
              variant="secondary"
              size="lg"
              isFullWidth={false}
              className="flex-1"
              onPress={() =>
                copy(`https://runningparty.run/welcome/${event.eventCode}`)
              }
              leftIcon={<MaterialIcons name="link" size={18} color="#0a181e" className="mr-2" />}
            >
              Copy Link
            </Button>
          </View>
        </BottomBar>
      </View>
    </View>
  );
}

function EventDetailLoading() {
  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <View className={Platform.OS === 'web' ? 'max-w-md mx-auto w-full flex-1' : 'flex-1'}>
        <Header title="Event Details" />
        <View className="px-4 pt-4 gap-4">
          <Skeleton width="100%" height={192} borderRadius={16} />
          <Skeleton width="40%" height={24} borderRadius={12} />
          <Skeleton width="80%" height={32} borderRadius={6} />
          <Skeleton width="60%" height={16} borderRadius={4} />
          <Skeleton width="100%" height={160} borderRadius={12} />
        </View>
      </View>
    </View>
  );
}
