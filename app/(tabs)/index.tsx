import { useCallback, useState } from 'react';
import { View, FlatList, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Container, Typography, H1, H3, Button } from '@/components/ui';
import { useMyEventsInfinite, flattenInfiniteEvents, type MeEventItem, type EventScope } from '@/lib/api';
import { useAuth } from '@/lib/auth';

// ============================================================================
// Tab Component (Phase 4.2)
// ============================================================================

interface TabProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

function Tab({ label, isActive, onPress }: TabProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 py-3 px-4 rounded-lg ${
        isActive
          ? 'bg-primary-500 dark:bg-primary-600'
          : 'bg-secondary-100 dark:bg-secondary-800'
      }`}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
    >
      <Typography
        variant="label"
        className={`text-center ${
          isActive
            ? 'text-white'
            : 'text-secondary-600 dark:text-secondary-400'
        }`}
      >
        {label}
      </Typography>
    </Pressable>
  );
}

interface TabsProps {
  activeScope: EventScope;
  onScopeChange: (scope: EventScope) => void;
}

function Tabs({ activeScope, onScopeChange }: TabsProps) {
  return (
    <View className="flex-row gap-2 mb-4">
      <Tab
        label="A venir"
        isActive={activeScope === 'future'}
        onPress={() => onScopeChange('future')}
      />
      <Tab
        label="Passees"
        isActive={activeScope === 'past'}
        onPress={() => onScopeChange('past')}
      />
    </View>
  );
}

// ============================================================================
// Empty State Component
// ============================================================================

interface EmptyStateProps {
  scope: EventScope;
}

function EmptyState({ scope }: EmptyStateProps) {
  const router = useRouter();

  const isFuture = scope === 'future';

  return (
    <Container isCenter padding="lg" className="flex-1">
      <View className="items-center max-w-xs">
        <View className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 items-center justify-center mb-6">
          <Typography className="text-4xl">{isFuture ? '🏃' : '📚'}</Typography>
        </View>

        <H3 className="text-center mb-2">
          {isFuture ? 'Aucune sortie a venir' : 'Aucun historique'}
        </H3>

        <Typography color="muted" className="text-center mb-8">
          {isFuture
            ? 'Vous n\'avez pas de sortie planifiee. Creez votre premiere sortie pour commencer !'
            : 'Vous n\'avez pas encore participe a une sortie.'}
        </Typography>

        {isFuture && (
          <Button
            variant="primary"
            size="lg"
            isFullWidth
            onPress={() => router.push('/event/create')}
            accessibilityLabel="Creer une sortie"
          >
            Creer une sortie
          </Button>
        )}
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
// Load More Footer Component (Phase 4.2)
// ============================================================================

interface LoadMoreFooterProps {
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
}

function LoadMoreFooter({ isFetchingNextPage, hasNextPage }: LoadMoreFooterProps) {
  if (!hasNextPage) return null;

  return (
    <View className="py-4 items-center">
      {isFetchingNextPage ? (
        <ActivityIndicator size="small" color="#16a34a" />
      ) : (
        <Typography color="muted" variant="bodySmall">Scroll pour charger plus</Typography>
      )}
    </View>
  );
}

// ============================================================================
// Main Dashboard Screen (Phase 4.2 - Home v2 Feed)
// ============================================================================

export default function DashboardScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [activeScope, setActiveScope] = useState<EventScope>('future');

  const {
    data,
    isLoading,
    error,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMyEventsInfinite(activeScope, {
    enabled: isAuthenticated,
    pageSize: 10,
  });

  // Flatten pages into single array
  const events = flattenInfiniteEvents(data);

  const handleEventPress = useCallback((eventId: string) => {
    router.push(`/event/${eventId}`);
  }, [router]);

  const handleScopeChange = useCallback((scope: EventScope) => {
    setActiveScope(scope);
  }, []);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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
    return <EmptyState scope="future" />;
  }

  // Show loading state only for initial load
  if (isLoading && !data) {
    return <LoadingState />;
  }

  // Show error state
  if (error && !data) {
    return (
      <ErrorState
        message={error.message || 'Une erreur est survenue'}
        onRetry={refetch}
      />
    );
  }

  // Show empty state if no events
  if (events.length === 0) {
    return (
      <Container padding="lg" className="flex-1">
        <H1 className="mb-4">Mes sorties</H1>
        <Tabs activeScope={activeScope} onScopeChange={handleScopeChange} />
        <EmptyState scope={activeScope} />
      </Container>
    );
  }

  // Show events list with tabs
  return (
    <Container padding="none" className="flex-1">
      <FlatList
        data={events}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isFetchingNextPage}
            onRefresh={refetch}
            tintColor="#16a34a"
          />
        }
        ListHeaderComponent={
          <View>
            <H1 className="mb-4">Mes sorties</H1>
            <Tabs activeScope={activeScope} onScopeChange={handleScopeChange} />
          </View>
        }
        ListFooterComponent={
          <LoadMoreFooter
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage ?? false}
          />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <Pressable
        onPress={() => router.push('/event/create')}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-primary-500 items-center justify-center shadow-lg active:bg-primary-600"
        accessibilityRole="button"
        accessibilityLabel="Creer une nouvelle sortie"
      >
        <Typography className="text-white text-2xl font-bold">+</Typography>
      </Pressable>
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
