import { useCallback, useState } from 'react';
import { View, FlatList, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Container, Typography, H1, Button } from '@/components/ui';
import { LoadingState, ErrorState, EmptyState } from '@/components/states';
import { EventStatusBadge } from '@/components/event';
import { useMyEventsInfinite, flattenInfiniteEvents, type MeEventItem, type EventScope } from '@/lib/api';
import { formatEventDate } from '@/lib/utils';
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
// Events Empty State Component
// ============================================================================

interface EventsEmptyStateProps {
  scope: EventScope;
}

function EventsEmptyState({ scope }: EventsEmptyStateProps) {
  const router = useRouter();
  const isFuture = scope === 'future';

  return (
    <EmptyState
      icon={isFuture ? '🏃' : '📚'}
      title={isFuture ? 'Aucune sortie a venir' : 'Aucun historique'}
      description={
        isFuture
          ? 'Vous n\'avez pas de sortie planifiee. Creez votre premiere sortie pour commencer !'
          : 'Vous n\'avez pas encore participe a une sortie.'
      }
      actionLabel={isFuture ? 'Creer une sortie' : undefined}
      onAction={isFuture ? () => router.push('/event/create') : undefined}
    />
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
        <EventStatusBadge status={event.status} size="sm" />
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
    return <EventsEmptyState scope="future" />;
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
        variant="compact"
      />
    );
  }

  // Show empty state if no events
  if (events.length === 0) {
    return (
      <Container padding="lg" className="flex-1">
        <H1 className="mb-4">Mes sorties</H1>
        <Tabs activeScope={activeScope} onScopeChange={handleScopeChange} />
        <EventsEmptyState scope={activeScope} />
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

