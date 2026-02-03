import { useCallback, useState, useMemo } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  useColorScheme,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography, H3 } from '@/components/ui';
import { LoadingState, ErrorState, EmptyState } from '@/components/states';
import { getParticipantStatusIcon } from '@/components/event';
import {
  useParticipantsList,
  useParticipantsSummary,
  useEventDetails,
  type ParticipantListItem,
  type ParticipantStatus,
} from '@/lib/api';
import { config } from '@/lib/config';

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
          ? 'bg-charcoal dark:bg-white'
          : 'bg-secondary-100 dark:bg-secondary-800'
      }`}
    >
      <Typography
        variant="bodySmall"
        className={isActive ? 'text-white dark:text-charcoal font-semibold' : 'text-secondary-700 dark:text-secondary-300'}
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
  const subtitle = participant.eventGroup?.label || participant.eventRoute?.name || null;

  return (
    <View className="flex-row items-center min-h-[64px] py-2 px-4 border-b border-secondary-100 dark:border-secondary-800">
      <View className="w-10 h-10 rounded-full bg-secondary-200 dark:bg-secondary-700 items-center justify-center mr-3">
        <Typography className="text-sm font-medium text-charcoal dark:text-white">
          {participant.displayName.charAt(0).toUpperCase()}
        </Typography>
      </View>
      <View className="flex-1">
        <Typography className="text-sm font-medium text-charcoal dark:text-white">
          {participant.displayName}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="muted" className="text-xs">
            {subtitle}
          </Typography>
        )}
      </View>
      <View className="shrink-0">
        {participant.roleInEvent !== 'PARTICIPANT' ? (
          <View className="bg-charcoal/10 dark:bg-white/10 px-3 py-1 rounded-full">
            <Typography variant="caption" className="text-charcoal dark:text-white text-xs font-bold uppercase">
              {roleLabel === 'Organisateur' ? 'Lead' : roleLabel}
            </Typography>
          </View>
        ) : (
          <Typography variant="caption" color="muted" className="text-xs font-medium">
            {statusIcon}
          </Typography>
        )}
      </View>
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
  const [searchQuery, setSearchQuery] = useState('');

  const { data: eventData } = useEventDetails(eventId ?? '');
  const { data: summary } = useParticipantsSummary(eventId ?? '');

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

  const filteredItems = useMemo(() => {
    const items = data?.items ?? [];
    if (!searchQuery.trim()) return items;
    const q = searchQuery.trim().toLowerCase();
    return items.filter((p) => p.displayName.toLowerCase().includes(q));
  }, [data?.items, searchQuery]);

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

  const handleInviteMore = useCallback(() => {
    if (eventData?.event?.eventCode) {
      const joinUrl = `${config.webUrl}/join/${eventData.event.eventCode}`;
      import('react-native').then(({ Share }) => {
        Share.share({
          message: `Rejoins "${eventData.event.title}" ! ${joinUrl}`,
          url: joinUrl,
        }).catch(() => {});
      });
    }
  }, [eventData]);

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

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#fff' : '#0B1220';
  const count = data?.totalCount ?? 0;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1 bg-backgroundLight dark:bg-backgroundDark">
        {/* Header - design participants_list_view */}
        <View
          className="bg-backgroundLight/80 dark:bg-backgroundDark/80 border-b border-secondary-200 dark:border-secondary-800"
          style={{ paddingTop: insets.top + 8 }}
        >
          <View className="flex-row items-center justify-between px-4 py-4">
            <View className="flex-row items-center gap-2">
              <Pressable onPress={() => router.back()} className="p-1 rounded-full" accessibilityLabel="Retour">
                <MaterialIcons name="arrow-back-ios" size={22} color={iconColor} />
              </Pressable>
              <Typography className="text-xl font-bold tracking-tight text-charcoal dark:text-white">
                Participants
              </Typography>
            </View>
            <Pressable className="p-2 rounded-full" accessibilityLabel="Partager">
              <MaterialIcons name="share" size={24} color={iconColor} />
            </Pressable>
          </View>
        </View>

        {/* Search Bar - design */}
        <View className="px-4 py-4">
          <View className="flex-row items-center rounded-xl h-12 bg-white dark:bg-secondary-800 border-0 shadow-sm px-4">
            <MaterialIcons name="search" size={24} color="#5c7c8a" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search runners..."
              placeholderTextColor="#5c7c8a"
              className="flex-1 ml-2 text-charcoal dark:text-white text-base min-w-0"
            />
          </View>
        </View>

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
          <View className="px-4 py-3 bg-white dark:bg-charcoal/10 border-b border-borderGrey dark:border-secondary-800">
            <H3 className="mb-2 text-charcoal dark:text-white">Par groupe d'allure</H3>
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
            className="flex-1 bg-backgroundLight dark:bg-backgroundDark"
            data={searchQuery.trim() ? filteredItems : (data?.items ?? [])}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor="#16a34a"
              />
            }
            onEndReached={searchQuery.trim() ? undefined : handleLoadMore}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
              searchQuery.trim() && filteredItems.length === 0 ? (
                <View className="py-8 items-center">
                  <Typography color="muted">Aucun résultat pour cette recherche</Typography>
                </View>
              ) : null
            }
            ListFooterComponent={
              isFetchingNextPage ? (
                <View className="py-4">
                  <ActivityIndicator size="small" color="#16a34a" />
                </View>
              ) : null
            }
          />
        )}

        {/* Fixed Invite more - design participants_list_view */}
        <View
          className="absolute left-0 right-0 bottom-0 p-6 bg-backgroundLight/90 dark:bg-backgroundDark/90 border-t border-transparent"
          style={{ paddingBottom: insets.bottom + 24 }}
        >
          <Pressable
            onPress={handleInviteMore}
            className="w-full h-14 rounded-xl bg-charcoal dark:bg-white items-center justify-center flex-row gap-2 shadow-lg active:opacity-95"
            accessibilityRole="button"
            accessibilityLabel="Invite more"
          >
            <MaterialIcons name="person-add" size={24} color={colorScheme === 'dark' ? '#0B1220' : '#fff'} />
            <Typography className="text-white dark:text-charcoal font-bold text-lg">Invite more</Typography>
          </Pressable>
        </View>
      </View>
    </>
  );
}
