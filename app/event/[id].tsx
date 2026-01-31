import { useCallback, useState } from 'react';
import { View, Share, Pressable, RefreshControl, useColorScheme, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { ScrollContainer, Typography, H1, H3, Button } from '@/components/ui';
import { LoadingState, ErrorState } from '@/components/states';
import { PaceGroupSelector, EventStatusBadge, getParticipantStatusIcon, getParticipationStatusText } from '@/components/event';
import { EventMapPlaceholder, RouteInfoCard } from '@/components/map';
import {
  useEventDetails,
  useUpsertParticipation,
  useEventRoutes,
  useCompleteEvent,
  type EventParticipant,
  type EventStatus,
  type ParticipantStatus,
} from '@/lib/api';
import { formatEventDate, formatCompletedDate } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { config } from '@/lib/config';

// ============================================================================
// Info Section
// ============================================================================

interface InfoSectionProps {
  icon: string;
  title: string;
  value: string;
  subtitle?: string;
}

function InfoSection({ icon, title, value, subtitle }: InfoSectionProps) {
  return (
    <View className="flex-row items-start mb-4">
      <Typography className="text-xl mr-3">{icon}</Typography>
      <View className="flex-1">
        <Typography variant="caption" color="muted">{title}</Typography>
        <Typography className="mt-0.5">{value}</Typography>
        {subtitle && (
          <Typography variant="bodySmall" color="muted" className="mt-0.5">
            {subtitle}
          </Typography>
        )}
      </View>
    </View>
  );
}

// ============================================================================
// Participant Item
// ============================================================================

interface ParticipantItemProps {
  participant: EventParticipant;
}

function ParticipantItem({ participant }: ParticipantItemProps) {
  const displayName = participant.displayName || participant.email || 'Anonyme';
  const statusIcon = getParticipantStatusIcon(participant.status);

  return (
    <View className="flex-row items-center py-2 border-b border-secondary-100 dark:border-secondary-700">
      <View className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 items-center justify-center mr-3">
        <Typography>{displayName.charAt(0).toUpperCase()}</Typography>
      </View>
      <View className="flex-1">
        <Typography>{displayName}</Typography>
      </View>
      <Typography>{statusIcon}</Typography>
    </View>
  );
}

// ============================================================================
// Share Code Section with QR Code
// ============================================================================

interface ShareCodeSectionProps {
  eventCode: string;
  eventTitle: string;
}

function ShareCodeSection({ eventCode, eventTitle }: ShareCodeSectionProps) {
  const colorScheme = useColorScheme();
  const [showQR, setShowQR] = useState(false);

  // Build the join URL (universal link)
  const joinUrl = `${config.webUrl}/join/${eventCode}`;

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `Rejoins-moi pour "${eventTitle}" ! ${joinUrl}`,
        url: joinUrl,
      });
    } catch {
      // User cancelled share
    }
  }, [eventTitle, joinUrl]);

  const toggleQR = useCallback(() => {
    setShowQR((prev) => !prev);
  }, []);

  return (
    <View className="bg-primary-50 dark:bg-primary-900/30 rounded-xl p-4 mb-6">
      <Typography variant="label" className="mb-3">Code de partage</Typography>

      {/* Code display */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="bg-white dark:bg-secondary-800 px-4 py-2 rounded-lg">
          <Typography variant="h3" className="font-mono tracking-widest">
            {eventCode}
          </Typography>
        </View>

        <View className="flex-row gap-2">
          <Button variant="outline" size="sm" onPress={toggleQR}>
            {showQR ? 'Masquer QR' : 'QR Code'}
          </Button>
          <Button variant="primary" size="sm" onPress={handleShare}>
            Partager
          </Button>
        </View>
      </View>

      {/* QR Code display */}
      {showQR && (
        <View className="items-center bg-white rounded-xl p-4 mb-4">
          <QRCode
            value={joinUrl}
            size={200}
            color="#000000"
            backgroundColor="#FFFFFF"
            logo={undefined}
            logoSize={40}
            logoBackgroundColor="transparent"
          />
          <Typography variant="caption" color="muted" className="mt-3 text-center">
            Scannez ce QR code pour rejoindre
          </Typography>
        </View>
      )}

      <Typography variant="caption" color="muted">
        Les participants peuvent rejoindre avec ce code ou scanner le QR code
      </Typography>
    </View>
  );
}

// ============================================================================
// Participation Actions Component
// ============================================================================

interface ParticipationActionsProps {
  eventId: string;
  currentStatus: ParticipantStatus | null;
  isOrganiser: boolean;
  eventStatus: EventStatus;
}

function ParticipationActions({
  eventId,
  currentStatus,
  isOrganiser,
  eventStatus,
}: ParticipationActionsProps) {
  const { mutate: upsertParticipation, isPending } = useUpsertParticipation();

  const handleParticipate = useCallback((status: 'GOING' | 'MAYBE' | 'DECLINED') => {
    upsertParticipation(
      { eventId, input: { status } },
      {
        onError: (error) => {
          Alert.alert('Erreur', error.message || 'Impossible de mettre a jour votre participation');
        },
      }
    );
  }, [eventId, upsertParticipation]);

  // Don't show actions for organiser or completed/cancelled events
  if (isOrganiser || eventStatus === 'COMPLETED' || eventStatus === 'CANCELLED') {
    return null;
  }

  const isGoing = currentStatus === 'GOING';
  const isMaybe = currentStatus === 'MAYBE';

  return (
    <View className="mt-4 space-y-3">
      {/* Main CTA */}
      {!isGoing && (
        <Button
          variant="primary"
          size="lg"
          isFullWidth
          isLoading={isPending}
          onPress={() => handleParticipate('GOING')}
        >
          Participer
        </Button>
      )}

      {/* Already going - show leave option */}
      {isGoing && (
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Button
              variant="outline"
              size="lg"
              isFullWidth
              isLoading={isPending}
              onPress={() => handleParticipate('MAYBE')}
            >
              Peut-etre
            </Button>
          </View>
          <View className="flex-1">
            <Button
              variant="outline"
              size="lg"
              isFullWidth
              isLoading={isPending}
              onPress={() => handleParticipate('DECLINED')}
            >
              Ne plus participer
            </Button>
          </View>
        </View>
      )}

      {/* Maybe - show confirm or decline */}
      {isMaybe && (
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Button
              variant="primary"
              size="lg"
              isFullWidth
              isLoading={isPending}
              onPress={() => handleParticipate('GOING')}
            >
              Confirmer
            </Button>
          </View>
          <View className="flex-1">
            <Button
              variant="outline"
              size="lg"
              isFullWidth
              isLoading={isPending}
              onPress={() => handleParticipate('DECLINED')}
            >
              Decliner
            </Button>
          </View>
        </View>
      )}

      {/* Participation status indicator */}
      {currentStatus && (
        <View className="items-center py-2">
          <Typography variant="bodySmall" color="muted">
            {getParticipationStatusText(currentStatus)}
          </Typography>
        </View>
      )}
    </View>
  );
}


// ============================================================================
// Complete Event Button (Phase 4.1)
// ============================================================================

interface CompleteEventButtonProps {
  eventId: string;
  eventStatus: EventStatus;
  isOrganiser: boolean;
}

function CompleteEventButton({ eventId, eventStatus, isOrganiser }: CompleteEventButtonProps) {
  const { mutate: completeEvent, isPending } = useCompleteEvent();

  // Only show for organiser when event is SCHEDULED or ONGOING
  if (!isOrganiser || (eventStatus !== 'SCHEDULED' && eventStatus !== 'ONGOING')) {
    return null;
  }

  const handleComplete = useCallback(() => {
    Alert.alert(
      'Cloturer la sortie',
      'Etes-vous sur de vouloir cloturer cette sortie ? Cette action est irreversible et la sortie passera en mode lecture seule.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Cloturer',
          style: 'destructive',
          onPress: () => {
            completeEvent(
              { eventId },
              {
                onError: (error) => {
                  Alert.alert('Erreur', error.message || 'Impossible de cloturer la sortie');
                },
                onSuccess: () => {
                  Alert.alert('Succes', 'La sortie a ete cloturee avec succes');
                },
              }
            );
          },
        },
      ]
    );
  }, [eventId, completeEvent]);

  return (
    <View className="mb-6">
      <Button
        variant="outline"
        size="lg"
        isFullWidth
        isLoading={isPending}
        onPress={handleComplete}
      >
        Cloturer la sortie
      </Button>
      <Typography variant="caption" color="muted" className="text-center mt-2">
        Une fois cloturee, la sortie passera en mode lecture seule
      </Typography>
    </View>
  );
}

// ============================================================================
// Main Event Detail Screen
// ============================================================================

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const {
    data,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useEventDetails(id ?? '');

  // Fetch event routes
  const { data: routes } = useEventRoutes(id ?? '', {
    enabled: !!id && !!data,
  });

  // Check if current user is the organiser
  const isOrganiser = user?.id === data?.organiser.id;

  // Get current user's participation status
  const currentUserStatus = data?.currentUserParticipation?.status ?? null;

  // Format date
  const formattedDate = data?.event.startDateTime
    ? formatEventDate(data.event.startDateTime)
    : '';

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Chargement...' }} />
        <LoadingState />
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <Stack.Screen options={{ title: 'Erreur' }} />
        <ErrorState
          message={error?.message || 'Impossible de charger les details'}
          onRetry={refetch}
        />
      </>
    );
  }

  const { event, organiser, participants } = data;
  const goingParticipants = participants.filter((p) => p.status === 'GOING');

  return (
    <>
      <Stack.Screen
        options={{
          title: event.title,
          headerBackTitle: 'Retour',
        }}
      />

      <ScrollContainer
        hasSafeArea
        safeAreaEdges={['bottom']}
        padding="lg"
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#16a34a"
          />
        }
      >
        {/* Header */}
        <View className="flex-row items-start justify-between mb-4">
          <H1 className="flex-1 mr-4">{event.title}</H1>
          <EventStatusBadge status={event.status} />
        </View>

        {/* Organiser */}
        <Typography color="muted" className="mb-4">
          Organise par {organiser.displayName || organiser.email || 'Anonyme'}
        </Typography>

        {/* Read-only mode indicator (Phase 4.1) */}
        {event.status === 'COMPLETED' && (
          <View className="bg-secondary-100 dark:bg-secondary-800 rounded-lg p-3 mb-6 flex-row items-center">
            <Typography className="mr-2">🔒</Typography>
            <View className="flex-1">
              <Typography variant="bodySmall" color="muted">
                Cette sortie est terminee - Mode lecture seule
              </Typography>
              {event.completedAt && (
                <Typography variant="caption" color="muted">
                  Cloturee le {formatCompletedDate(event.completedAt)}
                </Typography>
              )}
            </View>
          </View>
        )}

        {/* Cancelled indicator */}
        {event.status === 'CANCELLED' && (
          <View className="bg-red-100 dark:bg-red-900/30 rounded-lg p-3 mb-6 flex-row items-center">
            <Typography className="mr-2">❌</Typography>
            <Typography variant="bodySmall" className="text-red-700 dark:text-red-400">
              Cette sortie a ete annulee
            </Typography>
          </View>
        )}

        {/* Share Code (only for organiser when event is active) */}
        {isOrganiser && (event.status === 'SCHEDULED' || event.status === 'ONGOING') && (
          <ShareCodeSection eventCode={event.eventCode} eventTitle={event.title} />
        )}

        {/* Complete Event Button (Phase 4.1 - organiser only) */}
        <CompleteEventButton
          eventId={event.id}
          eventStatus={event.status}
          isOrganiser={isOrganiser}
        />

        {/* Event Info */}
        <View className="mb-6">
          <InfoSection
            icon="📅"
            title="Date et heure"
            value={formattedDate}
          />

          {event.locationName && (
            <InfoSection
              icon="📍"
              title="Lieu"
              value={event.locationName}
              subtitle={event.locationAddress ?? undefined}
            />
          )}

          <InfoSection
            icon="👥"
            title="Participants"
            value={`${goingParticipants.length} participant${goingParticipants.length > 1 ? 's' : ''}`}
          />
        </View>

        {/* Map / Location */}
        {(event.locationName || event.locationLat) && (
          <EventMapPlaceholder
            locationName={event.locationName}
            locationAddress={event.locationAddress}
            latitude={event.locationLat}
            longitude={event.locationLng}
            showRoute={routes && routes.length > 0}
            routeName={routes?.[0]?.name}
          />
        )}

        {/* Routes / GPX Tracks */}
        {routes && routes.length > 0 && (
          <RouteInfoCard routes={routes} />
        )}

        {/* Description */}
        {event.description && (
          <View className="mb-6">
            <H3 className="mb-2">Description</H3>
            <Typography color="muted">{event.description}</Typography>
          </View>
        )}

        {/* Participants List */}
        {goingParticipants.length > 0 && (
          <View className="mb-6">
            <H3 className="mb-3">Participants ({goingParticipants.length})</H3>
            {goingParticipants.slice(0, 5).map((participant) => (
              <ParticipantItem key={participant.id} participant={participant} />
            ))}
            <Pressable
              className="py-3"
              onPress={() => router.push(`/event/participants/${event.id}`)}
            >
              <Typography color="primary" className="text-center">
                {goingParticipants.length > 5
                  ? `Voir tous les participants (${goingParticipants.length})`
                  : 'Voir la liste complete'}
              </Typography>
            </Pressable>
          </View>
        )}

        {/* Participation Actions (Optimistic UI) */}
        {event.status === 'SCHEDULED' && (
          <ParticipationActions
            eventId={event.id}
            currentStatus={currentUserStatus}
            isOrganiser={isOrganiser}
            eventStatus={event.status}
          />
        )}

        {/* Pace Group Selection (for participants) */}
        {(currentUserStatus === 'GOING' || currentUserStatus === 'MAYBE') && (
          <View className="mt-6">
            <H3 className="mb-3">Vos preferences</H3>
            <PaceGroupSelector
              eventId={event.id}
              currentGroupId={data.currentUserParticipation?.selectedPaceGroupId ?? null}
              disabled={event.status !== 'SCHEDULED'}
            />
          </View>
        )}
      </ScrollContainer>
    </>
  );
}

