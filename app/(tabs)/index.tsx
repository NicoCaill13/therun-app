import { useCallback } from 'react';
import { View, FlatList, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Container, Typography, H1, H3, Button } from '@/components/ui';
import { useMyEvents, type MeEventItem } from '@/lib/api';
import { useAuth } from '@/lib/auth';

// ============================================================================
// Empty State Component
// ============================================================================

function EmptyState() {
  const router = useRouter();

  return (
    <Container isCenter padding="lg" className="flex-1">
      <View className="items-center max-w-xs">
        <View className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 items-center justify-center mb-6">
          <Typography className="text-4xl">🏃</Typography>
        </View>

        <H3 className="text-center mb-2">Aucune sortie</H3>

        <Typography color="muted" className="text-center mb-8">
          Vous n'avez pas encore de sortie planifiee. Creez votre premiere sortie pour commencer !
        </Typography>

        <Button
          variant="primary"
          size="lg"
          isFullWidth
          onPress={() => router.push('/event/create')}
          accessibilityLabel="Creer une sortie"
        >
          Creer une sortie
        </Button>
      </View>
    </Container>
  );
}

// ============================================================================
// Event Card Component
// ============================================================================

interface EventCardProps {
  event: MeEventItem;
  onPress: () => void;
}

function EventCard({ event, onPress }: EventCardProps) {
  const formattedDate = formatEventDate(event.startDateTime);
  const statusBadge = getStatusBadge(event.status);

  return (
    <Pressable
      onPress={onPress}
      className="bg-white dark:bg-secondary-800 rounded-xl p-4 mb-3 border border-secondary-100 dark:border-secondary-700 active:opacity-80"
      accessibilityRole="button"
      accessibilityLabel={`Sortie ${event.title}, ${formattedDate}`}
    >
      <View className="flex-row items-start justify-between mb-2">
        <Typography variant="h4" className="flex-1 mr-2" numberOfLines={2}>
          {event.title}
        </Typography>
        {statusBadge && (
          <View className={`px-2 py-1 rounded-full ${statusBadge.bgClass}`}>
            <Typography variant="caption" className={statusBadge.textClass}>
              {statusBadge.label}
            </Typography>
          </View>
        )}
      </View>

      <View className="flex-row items-center mb-2">
        <Typography color="muted" className="mr-1">📅</Typography>
        <Typography color="muted" variant="bodySmall">{formattedDate}</Typography>
      </View>

      {event.locationName && (
        <View className="flex-row items-center mb-2">
          <Typography color="muted" className="mr-1">📍</Typography>
          <Typography color="muted" variant="bodySmall" numberOfLines={1}>
            {event.locationName}
          </Typography>
        </View>
      )}

      <View className="flex-row items-center">
        <Typography color="muted" className="mr-1">👥</Typography>
        <Typography color="muted" variant="bodySmall">
          {event.goingCount} participant{event.goingCount > 1 ? 's' : ''}
        </Typography>
      </View>
    </Pressable>
  );
}

// ============================================================================
// Loading State Component
// ============================================================================

function LoadingState() {
  return (
    <Container isCenter padding="lg">
      <ActivityIndicator size="large" color="#16a34a" />
      <Typography color="muted" className="mt-4">Chargement...</Typography>
    </Container>
  );
}

// ============================================================================
// Error State Component
// ============================================================================

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <Container isCenter padding="lg">
      <Typography color="error" className="text-center mb-4">{message}</Typography>
      <Button variant="outline" onPress={onRetry}>Reessayer</Button>
    </Container>
  );
}

// ============================================================================
// Main Dashboard Screen
// ============================================================================

export default function DashboardScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const {
    data,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useMyEvents(
    { scope: 'future' },
    { enabled: isAuthenticated }
  );

  const handleEventPress = useCallback((eventId: string) => {
    router.push(`/event/${eventId}`);
  }, [router]);

  const renderItem = useCallback(({ item }: { item: MeEventItem }) => (
    <EventCard
      event={item}
      onPress={() => handleEventPress(item.id)}
    />
  ), [handleEventPress]);

  const keyExtractor = useCallback((item: MeEventItem) => item.id, []);

  // Show loading while auth is being determined
  if (isAuthLoading) {
    return <LoadingState />;
  }

  // Show empty state with CTA if not authenticated
  if (!isAuthenticated) {
    return <EmptyState />;
  }

  // Show loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Show error state
  if (error) {
    return (
      <ErrorState
        message={error.message || 'Une erreur est survenue'}
        onRetry={refetch}
      />
    );
  }

  // Show empty state if no events
  if (!data?.items?.length) {
    return <EmptyState />;
  }

  // Show events list
  return (
    <Container padding="none" className="flex-1">
      <FlatList
        data={data.items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#16a34a"
          />
        }
        ListHeaderComponent={
          <H1 className="mb-4">Mes sorties</H1>
        }
        showsVerticalScrollIndicator={false}
      />
    </Container>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function formatEventDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow = date.toDateString() === new Date(now.getTime() + 86400000).toDateString();

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  };

  const time = date.toLocaleTimeString('fr-FR', timeOptions);

  if (isToday) {
    return `Aujourd'hui a ${time}`;
  }

  if (isTomorrow) {
    return `Demain a ${time}`;
  }

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  };

  const formattedDate = date.toLocaleDateString('fr-FR', dateOptions);
  return `${formattedDate} a ${time}`;
}

interface StatusBadge {
  label: string;
  bgClass: string;
  textClass: string;
}

function getStatusBadge(status: MeEventItem['status']): StatusBadge | null {
  switch (status) {
    case 'ONGOING':
      return {
        label: 'En cours',
        bgClass: 'bg-green-100 dark:bg-green-900/30',
        textClass: 'text-green-700 dark:text-green-400',
      };
    case 'COMPLETED':
      return {
        label: 'Termine',
        bgClass: 'bg-secondary-100 dark:bg-secondary-700',
        textClass: 'text-secondary-600 dark:text-secondary-400',
      };
    case 'CANCELLED':
      return {
        label: 'Annule',
        bgClass: 'bg-red-100 dark:bg-red-900/30',
        textClass: 'text-red-700 dark:text-red-400',
      };
    default:
      return null;
  }
}
