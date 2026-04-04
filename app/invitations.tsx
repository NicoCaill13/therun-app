import { View, Pressable, FlatList, RefreshControl, Alert, StyleSheet } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useCallback, useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { Container, Typography, Button } from '@/components/ui';
import { LoadingState, ErrorState, EmptyState } from '@/components/states';
import {
  useMyInvitationsInfinite,
  useRespondToInvitation,
  flattenInfiniteInvitations,
  InvitationItem,
} from '@/lib/api/invitations';
import { formatEventDate } from '@/lib/utils/date';

const INVITATIONS_LIST_CONTENT_STYLE = StyleSheet.create({
  container: { padding: 16 },
});

// ============================================================================
// Invitations Screen
// ============================================================================

export default function InvitationsScreen() {
  const router = useRouter();
  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMyInvitationsInfinite();

  const respondMutation = useRespondToInvitation();
  const [respondingId, setRespondingId] = useState<string | null>(null);

  const invitations = flattenInfiniteInvitations(data);

  // Handle respond to invitation
  const handleRespond = useCallback(
    (invitation: InvitationItem, status: 'GOING' | 'DECLINED' | 'MAYBE') => {
      setRespondingId(invitation.participantId);
      respondMutation.mutate(
        {
          eventId: invitation.eventId,
          participantId: invitation.participantId,
          data: { status },
        },
        {
          onSuccess: () => {
            setRespondingId(null);
            if (status === 'GOING') {
              router.push(`/event/${invitation.eventId}`);
            }
          },
          onError: (error) => {
            setRespondingId(null);
            Alert.alert('Erreur', error.message);
          },
        }
      );
    },
    [respondMutation, router]
  );

  // Handle view event
  const handleViewEvent = useCallback(
    (eventId: string) => {
      router.push(`/event/${eventId}`);
    },
    [router]
  );

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Render invitation item
  const renderItem = useCallback(
    ({ item }: { item: InvitationItem }) => (
      <InvitationCard
        invitation={item}
        onAccept={() => handleRespond(item, 'GOING')}
        onDecline={() => handleRespond(item, 'DECLINED')}
        onMaybe={() => handleRespond(item, 'MAYBE')}
        onViewEvent={() => handleViewEvent(item.eventId)}
        isLoading={respondingId === item.participantId}
      />
    ),
    [handleRespond, handleViewEvent, respondingId]
  );

  // Handle loading state
  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Invitations' }} />
        <LoadingState message="Chargement des invitations..." />
      </>
    );
  }

  // Handle error state
  if (error) {
    return (
      <>
        <Stack.Screen options={{ title: 'Invitations' }} />
        <ErrorState message={error.message} onRetry={refetch} />
      </>
    );
  }

  // Handle empty state
  if (invitations.length === 0) {
    return (
      <>
        <Stack.Screen options={{ title: 'Invitations' }} />
        <EmptyState
          title="Aucune invitation"
          message="Vous n'avez pas d'invitations en attente"
          icon="envelope"
        />
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: `Invitations (${invitations.length})`,
        }}
      />
      <Container padding="none">
        <FlatList
          data={invitations}
          renderItem={renderItem}
          keyExtractor={(item) => item.participantId}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={handleRefresh} />
          }
          contentContainerStyle={INVITATIONS_LIST_CONTENT_STYLE.container}
          ItemSeparatorComponent={() => <View className="h-4" />}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="py-4">
                <Typography color="muted" className="text-center">
                  Chargement...
                </Typography>
              </View>
            ) : null
          }
        />
      </Container>
    </>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function InvitationCard({
  invitation,
  onAccept,
  onDecline,
  onMaybe,
  onViewEvent,
  isLoading,
}: {
  invitation: InvitationItem;
  onAccept: () => void;
  onDecline: () => void;
  onMaybe: () => void;
  onViewEvent: () => void;
  isLoading: boolean;
}) {
  const organiserName =
    `${invitation.organiserFirstName}${invitation.organiserLastName ? ` ${invitation.organiserLastName}` : ''}`.trim();

  return (
    <Pressable
      className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-secondary-100 dark:border-secondary-700 overflow-hidden active:opacity-90"
      onPress={onViewEvent}
      disabled={isLoading}
    >
      {/* Header */}
      <View className="p-4 border-b border-secondary-100 dark:border-secondary-700">
        <View className="flex-row items-center mb-2">
          <RoleBadge role={invitation.role} />
          <Typography color="muted" className="text-sm ml-2">
            Invite par {organiserName}
          </Typography>
        </View>
        <Typography className="font-semibold text-lg">
          {invitation.eventTitle}
        </Typography>
      </View>

      {/* Details */}
      <View className="p-4">
        <View className="flex-row items-center mb-2">
          <FontAwesome name="calendar" size={14} color="#6b7280" />
          <Typography color="muted" className="ml-2 text-sm">
            {formatEventDate(invitation.startDateTime.toString())}
          </Typography>
        </View>
        {invitation.locationName && (
          <View className="flex-row items-center">
            <FontAwesome name="map-marker" size={14} color="#6b7280" />
            <Typography color="muted" className="ml-2 text-sm">
              {invitation.locationName}
            </Typography>
          </View>
        )}
      </View>

      {/* Actions */}
      <View className="flex-row p-4 pt-0 gap-2">
        <Button
          variant="primary"
          size="sm"
          onPress={onAccept}
          isLoading={isLoading}
          isDisabled={isLoading}
          className="flex-1"
        >
          Accepter
        </Button>
        <Button
          variant="outline"
          size="sm"
          onPress={onMaybe}
          isDisabled={isLoading}
          className="flex-1"
        >
          Peut-etre
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onPress={onDecline}
          isDisabled={isLoading}
          className="flex-1"
        >
          Decliner
        </Button>
      </View>
    </Pressable>
  );
}

function RoleBadge({ role }: { role: string }) {
  const colors = {
    PARTICIPANT: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    ENCADRANT: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    ORGANISER: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  };

  const labels = {
    PARTICIPANT: 'Participant',
    ENCADRANT: 'Encadrant',
    ORGANISER: 'Organisateur',
  };

  const colorClass = colors[role as keyof typeof colors] || colors.PARTICIPANT;
  const label = labels[role as keyof typeof labels] || role;

  return (
    <View className={`px-2 py-0.5 rounded-full ${colorClass}`}>
      <Typography className="text-xs font-medium">{label}</Typography>
    </View>
  );
}
