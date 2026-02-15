import { View, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '@/lib/auth';
import { useMeEvents } from '@/lib/api/me';
import {
  Typography,
  H1,
  Button,
  Card,
  Skeleton,
  SkeletonCard,
  SkeletonText,
} from '@/components/ui';
import type { MeEventItem } from '@/lib/api/me';

// ============================================================================
// Home Screen - Empty State / Loading / Events Feed
// ============================================================================

export default function HomeScreen() {
  const { isAuthenticated } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const paddingTop = Platform.OS === 'web' ? 16 : insets.top;

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <View
        className={Platform.OS === 'web' ? 'max-w-md mx-auto w-full flex-1' : 'flex-1'}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pb-2" style={{ paddingTop: paddingTop + 8 }}>
          <Pressable
            className="w-10 h-10 rounded-full bg-charcoal items-center justify-center"
            accessibilityLabel="Menu"
          >
            <MaterialIcons name="directions-run" size={20} color="#ffffff" />
          </Pressable>
          <Typography variant="h4" className="font-sans-bold tracking-tight">
            THE RUN
          </Typography>
          <Pressable
            className="w-10 h-10 rounded-full items-center justify-center"
            accessibilityLabel="Settings"
            onPress={() => router.push('/(tabs)/profile')}
          >
            <MaterialIcons name="settings" size={22} color="#0a181e" />
          </Pressable>
        </View>

        {isAuthenticated ? <AuthenticatedHome /> : <EmptyStateHome />}
      </View>
    </View>
  );
}

// ============================================================================
// Authenticated Home - Events Feed or Empty State
// ============================================================================

function AuthenticatedHome() {
  const { data, isLoading, isError } = useMeEvents('future');
  const router = useRouter();

  if (isLoading) return <HomeLoadingState />;
  if (isError || !data) return <EmptyStateHome />;
  if (data.items.length === 0) return <EmptyStateHome />;

  return (
    <View className="flex-1 px-4 pt-4">
      <View className="flex-row items-center justify-between mb-4">
        <Typography variant="h3">Upcoming</Typography>
        <Pressable onPress={() => router.push('/event/create')}>
          <MaterialIcons name="add-circle" size={28} color="#FF5A1F" />
        </Pressable>
      </View>
      {data.items.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </View>
  );
}

// ============================================================================
// Event Card
// ============================================================================

function EventCard({ event }: { event: MeEventItem }) {
  const router = useRouter();

  const dateStr = new Date(event.startDateTime).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Pressable
      className="mb-3"
      onPress={() => router.push(`/event/${event.id}`)}
      accessibilityRole="button"
    >
      <Card padding="md">
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Typography variant="h4" className="mb-1">
              {event.title}
            </Typography>
            <View className="flex-row items-center gap-1 mb-1">
              <MaterialIcons name="calendar-today" size={14} color="#6b7280" />
              <Typography variant="bodySmall" color="secondary">
                {dateStr}
              </Typography>
            </View>
            {event.locationName && (
              <View className="flex-row items-center gap-1">
                <MaterialIcons name="location-on" size={14} color="#6b7280" />
                <Typography variant="bodySmall" color="secondary">
                  {event.locationName}
                </Typography>
              </View>
            )}
          </View>
          <View className="bg-brand-orange-bg rounded-full px-2 py-1">
            <Typography variant="caption" className="text-brand-orange font-sans-semibold">
              {event.goingCount} going
            </Typography>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

// ============================================================================
// Empty State (maquette: home_hub_empty_state)
// ============================================================================

function EmptyStateHome() {
  const router = useRouter();

  return (
    <View className="flex-1 px-4 pt-6 items-center">
      {/* Illustration placeholder */}
      <View className="w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-2xl items-center justify-center mb-2">
        <MaterialIcons name="map" size={64} color="#d1d5db" />
        <View className="absolute bottom-3 left-4 w-16 h-1 bg-brand-orange rounded-full" />
      </View>

      <H1 className="text-center mt-4 mb-2">Create your next run</H1>
      <Typography variant="body" color="secondary" className="text-center mb-8">
        Start a group run and invite others in seconds.
      </Typography>

      <Button
        onPress={() => router.push('/event/create')}
        leftIcon={<MaterialIcons name="add-circle" size={20} color="#ffffff" className="mr-2" />}
      >
        Create an event
      </Button>

      <Pressable className="mt-4 mb-8" onPress={() => router.push('/join')}>
        <Typography variant="body" color="orange" className="underline underline-offset-4 font-sans-medium">
          Join with a code
        </Typography>
      </Pressable>

      {/* How it works section */}
      <Card padding="lg" className="w-full">
        <Typography variant="label" color="secondary" className="mb-4">
          HOW IT WORKS
        </Typography>
        <HowItWorksItem
          icon="edit-note"
          title="Create"
          description="Set your route and time."
        />
        <HowItWorksItem
          icon="qr-code-2"
          title="Share Code"
          description="Invite your crew via link."
        />
        <HowItWorksItem
          icon="bolt"
          title="Run"
          description="Track and compete live."
        />
      </Card>
    </View>
  );
}

function HowItWorksItem({
  icon,
  title,
  description,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
}) {
  return (
    <View className="flex-row items-center gap-3 mb-4 last:mb-0">
      <View className="w-10 h-10 rounded-full bg-brand-orange-bg items-center justify-center">
        <MaterialIcons name={icon} size={20} color="#FF5A1F" />
      </View>
      <View>
        <Typography variant="h4">{title}</Typography>
        <Typography variant="bodySmall" color="secondary">
          {description}
        </Typography>
      </View>
    </View>
  );
}

// ============================================================================
// Loading State (maquette: home_hub_loading_state)
// ============================================================================

function HomeLoadingState() {
  return (
    <View className="flex-1 px-4 pt-4 gap-4">
      <Skeleton width="70%" height={28} borderRadius={6} />
      <Skeleton width="50%" height={16} borderRadius={4} />
      <Skeleton width="100%" height={80} borderRadius={12} />
      <Skeleton width="40%" height={16} borderRadius={4} className="mt-4" />
      <SkeletonCard />
      <SkeletonCard />
    </View>
  );
}
