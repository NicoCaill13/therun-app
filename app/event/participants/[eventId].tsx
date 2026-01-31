import { useCallback, useState } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Container, Typography, H3 } from '@/components/ui';
import { LoadingState, ErrorState, EmptyState } from '@/components/states';
import { getParticipantStatusIcon } from '@/components/event';
import {
  useParticipantsList,
  useParticipantsSummary,
  type ParticipantListItem,
  type ParticipantStatus,
} from '@/lib/api';

// ============================================================================
// Status Filter Tabs
// ============================================================================

interface FilterTabProps {
  status: ParticipantStatus | 'ALL';
  activeStatus: ParticipantStatus | 'ALL';
  label: string;
  count: number;
  onPress: (status: ParticipantStatus | 'ALL') => void;
}

function FilterTab({ status, activeStatus, label, count, onPress }: FilterTabProps) {
  const isActive = status === activeStatus;

  return (
    <Pressable
      onPress={() => onPress(status)}
      className={`px-4 py-2 mr-2 rounded-full ${
        isActive
          ? 'bg-primary-500 dark:bg-primary-600'
          : 'bg-secondary-100 dark:bg-secondary-800'
      }`}
    >
      <Typography
        variant="bodySmall"
        className={isActive ? 'text-white' : 'text-secondary-700 dark:text-secondary-300'}
      >
        {label} ({count})
      </Typography>
    </Pressable>
  );
}

// ============================================================================
// Participant Item
// ============================================================================

interface ParticipantItemProps {
  participant: ParticipantListItem;
}

function ParticipantItem({ participant }: ParticipantItemProps) {
  const roleLabel = getRoleLabel(participant.roleInEvent);
  const statusIcon = getStatusSymbol(participant.status);

  return (
    <View className="flex-row items-center py-3 px-4 border-b border-secondary-100 dark:border-secondary-800">
      {/* Avatar */}
      <View className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 items-center justify-center mr-3">
        <Typography className="text-lg">
          {participant.displayName.charAt(0).toUpperCase()}
        </Typography>
      </View>

      {/* Info */}
      <View className="flex-1">
        <View className="flex-row items-center">
          <Typography className="font-medium">{participant.displayName}</Typography>
          {participant.roleInEvent !== 'PARTICIPANT' && (
            <View className="ml-2 px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30">
              <Typography variant="caption" className="text-primary-700 dark:text-primary-400">
                {roleLabel}
              </Typography>
            </View>
          )}
        </View>

        {/* Group/Route */}
        {(participant.eventGroup || participant.eventRoute) && (
          <View className="flex-row mt-1">
            {participant.eventGroup && (
              <Typography variant="caption" color="muted" className="mr-3">
                {participant.eventGroup.label}
              </Typography>
            )}
            {participant.eventRoute && (
              <Typography variant="caption" color="muted">
                {participant.eventRoute.name}
              </Typography>
            )}
          </View>
        )}
      </View>

      {/* Status */}
      <Typography className="text-lg">{statusIcon}</Typography>
    </View>
  );
}

function getStatusSymbol(status: ParticipantStatus): string {
  switch (status) {
    case 'GOING':
      return '✓';
    case 'MAYBE':
      return '?';
    case 'DECLINED':
      return '✗';
    case 'INVITED':
    default:
      return '•';
  }
}

function getRoleLabel(role: string): string {
  switch (role) {
    case 'ORGANISER':
      return 'Organisateur';
    case 'ENCADRANT':
      return 'Encadrant';
    default:
      return '';
  }
}


// ============================================================================
// Main Screen
// ============================================================================

export default function ParticipantsListScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const [activeFilter, setActiveFilter] = useState<ParticipantStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);

  // Fetch summary for counts
  const {
    data: summary,
  } = useParticipantsSummary(eventId ?? '');

  // Fetch participants list with filter
  const {
    data,
    isLoading,
    error,
    refetch,
    isRefetching,
    isFetchingNextPage,
  } = useParticipantsList({
    eventId: eventId ?? '',
    status: activeFilter === 'ALL' ? undefined : activeFilter,
    page,
    pageSize: 20,
  });

  const handleFilterChange = useCallback((status: ParticipantStatus | 'ALL') => {
    setActiveFilter(status);
    setPage(1);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (data && page < data.totalPages && !isFetchingNextPage) {
      setPage((p) => p + 1);
    }
  }, [data, page, isFetchingNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: ParticipantListItem }) => <ParticipantItem participant={item} />,
    []
  );

  const keyExtractor = useCallback(
    (item: ParticipantListItem) => item.participantId,
    []
  );

  // Calculate total count
  const totalCount = summary
    ? summary.goingCount + summary.invitedCount + summary.maybeCount
    : 0;

  if (isLoading && !data) {
    return (
      <>
        <Stack.Screen options={{ title: 'Participants' }} />
        <LoadingState message="Chargement des participants..." />
      </>
    );
  }

  if (error && !data) {
    return (
      <>
        <Stack.Screen options={{ title: 'Erreur' }} />
        <ErrorState
          message={error.message || 'Impossible de charger les participants'}
          onRetry={refetch}
          variant="compact"
        />
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: `Participants (${data?.totalCount ?? 0})`,
          headerBackTitle: 'Retour',
        }}
      />

      <View className="flex-1 bg-white dark:bg-secondary-900">
        {/* Filter Tabs */}
        <View className="px-4 py-3 border-b border-secondary-100 dark:border-secondary-800">
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[
              { status: 'ALL' as const, label: 'Tous', count: totalCount },
              { status: 'GOING' as const, label: 'Confirmés', count: summary?.goingCount ?? 0 },
              { status: 'MAYBE' as const, label: 'Peut-être', count: summary?.maybeCount ?? 0 },
              { status: 'INVITED' as const, label: 'Invités', count: summary?.invitedCount ?? 0 },
            ]}
            keyExtractor={(item) => item.status}
            renderItem={({ item }) => (
              <FilterTab
                status={item.status}
                activeStatus={activeFilter}
                label={item.label}
                count={item.count}
                onPress={handleFilterChange}
              />
            )}
          />
        </View>

        {/* Groups Summary */}
        {summary && summary.byGroup.length > 0 && activeFilter === 'ALL' && (
          <View className="px-4 py-3 bg-secondary-50 dark:bg-secondary-800/50">
            <H3 className="mb-2">Par groupe d'allure</H3>
            <View className="flex-row flex-wrap">
              {summary.byGroup.map((group) => (
                <View
                  key={group.eventGroupId}
                  className="mr-3 mb-2 px-3 py-1 rounded-full bg-white dark:bg-secondary-700"
                >
                  <Typography variant="bodySmall">
                    {group.label}: {group.goingCount}
                  </Typography>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Participants List */}
        {data?.items.length === 0 ? (
          <EmptyState
            icon="👥"
            title="Aucun participant"
            description="Aucun participant pour le moment"
          />
        ) : (
          <FlatList
            data={data?.items ?? []}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor="#16a34a"
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View className="py-4">
                  <ActivityIndicator size="small" color="#16a34a" />
                </View>
              ) : null
            }
          />
        )}
      </View>
    </>
  );
}
