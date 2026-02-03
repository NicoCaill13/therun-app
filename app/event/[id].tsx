import { useCallback, useState } from 'react';
import { View, Share, Pressable, RefreshControl, useColorScheme, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollContainer, Typography, H1, H3, Button } from '@/components/ui';
import { LoadingState, ErrorState } from '@/components/states';
import { PaceGroupSelector, EventStatusBadge, getParticipantStatusIcon, getParticipationStatusText } from '@/components/event';
import { EventMapView, RouteInfoCard } from '@/components/map';
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
  const [showQR, setShowQR] = useState(false);
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
    <View className="bg-white dark:bg-charcoal/10 border border-secondary-200 dark:border-secondary-800 rounded-xl p-4 mb-6">
      <Typography variant="caption" color="muted" className="mb-1 uppercase tracking-widest">
        Invite Code
      </Typography>
      <View className="flex-row items-center justify-between">
        <Typography variant="h3" className="font-mono tracking-widest text-charcoal dark:text-white">
          {eventCode}
        </Typography>
        <Pressable
          onPress={handleShare}
          className="flex-row items-center gap-2 bg-secondary-100 dark:bg-secondary-800 px-4 py-2 rounded-lg"
        >
          <MaterialIcons name="content-copy" size={18} color="#64748b" />
          <Typography variant="label" className="text-secondary-600 dark:text-secondary-300">
            Copy
          </Typography>
        </Pressable>
      </View>
      {showQR && (
        <View className="items-center mt-4 pt-4 border-t border-secondary-200 dark:border-secondary-700">
          <QRCode value={joinUrl} size={160} color="#000000" backgroundColor="#FFFFFF" />
          <Typography variant="caption" color="muted" className="mt-2 text-center">
            Code de partage – Scannez pour rejoindre
          </Typography>
        </View>
      )}
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
// Organiser Actions (Edit, Broadcast, Duplicate)
// ============================================================================

interface OrganiserActionsProps {
  eventId: string;
  eventStatus: EventStatus;
  isOrganiser: boolean;
}

function OrganiserActions({ eventId, eventStatus, isOrganiser }: OrganiserActionsProps) {
  const router = useRouter();

  if (!isOrganiser) {
    return null;
  }

  const isActive = eventStatus === 'SCHEDULED' || eventStatus === 'ONGOING';
  const isCompleted = eventStatus === 'COMPLETED';

  return (
    <View className="mb-6">
      <Typography variant="label" className="mb-3">Actions organisateur</Typography>
      <View className="flex-row flex-wrap gap-2">
        {/* Edit - only for active events */}
        {isActive && (
          <Button
            variant="outline"
            size="sm"
            onPress={() => router.push(`/event/edit/${eventId}`)}
          >
            Modifier
          </Button>
        )}

        {/* Broadcast - only for active events */}
        {isActive && (
          <Button
            variant="outline"
            size="sm"
            onPress={() => router.push(`/event/broadcast/${eventId}`)}
          >
            Envoyer un message
          </Button>
        )}

        {/* Duplicate - only for completed events */}
        {isCompleted && (
          <Button
            variant="outline"
            size="sm"
            onPress={() => router.push(`/event/duplicate/${eventId}`)}
          >
            Dupliquer
          </Button>
        )}
      </View>
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
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#fff' : '#0a181e';
  const joinUrl = `${config.webUrl}/join/${event.eventCode}`;
  const showShareBar = isOrganiser && (event.status === 'SCHEDULED' || event.status === 'ONGOING');

  const handleShareLink = useCallback(async () => {
    try {
      await Share.share({
        message: `Rejoins-moi pour "${event.title}" ! ${joinUrl}`,
        url: joinUrl,
      });
    } catch {
      // User cancelled
    }
  }, [event.title, joinUrl]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1 bg-backgroundLight dark:bg-backgroundDark" style={{ paddingBottom: showShareBar ? insets.bottom + 80 : 0 }}>
        {/* TopAppBar (design) */}
        <View
          className="flex-row items-center justify-between bg-backgroundLight/80 dark:bg-backgroundDark/80 px-4 py-4 border-b border-secondary-100 dark:border-secondary-800"
          style={{ paddingTop: insets.top + 8 }}
        >
          <View className="flex-row items-center gap-2">
            <Pressable onPress={() => router.back()} className="p-1 rounded-full" accessibilityLabel="Retour">
              <MaterialIcons name="arrow-back-ios" size={22} color={iconColor} />
            </Pressable>
            <Typography className="text-lg font-bold tracking-tight text-charcoal dark:text-white">
              Event Details
            </Typography>
          </View>
          <View className="flex-row gap-1">
            <Pressable onPress={handleShareLink} className="p-2 rounded-full" accessibilityLabel="Partager">
              <MaterialIcons name="share" size={24} color={iconColor} />
            </Pressable>
            <Pressable className="p-2 rounded-full" accessibilityLabel="Plus">
              <MaterialIcons name="more-horiz" size={24} color={iconColor} />
            </Pressable>
          </View>
        </View>

        <ScrollContainer
          hasSafeArea={false}
          safeAreaEdges={[]}
          padding="none"
          contentClassName="px-4 pb-6"
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#16a34a" />
          }
        >
          {/* Hero placeholder + chip + title + date/location (design) */}
          <View className="pt-4 pb-2">
            <View className="aspect-square max-h-64 w-full rounded-xl bg-secondary-200 dark:bg-secondary-800 overflow-hidden mb-4 items-center justify-center">
              <MaterialIcons name="directions-run" size={64} color="#94a3b8" />
            </View>
            <View className="flex-row items-center justify-between mb-2">
              <View className="h-7 rounded-full bg-brandOrangeBg px-3 items-center justify-center">
                <Typography className="text-brandOrange text-xs font-bold uppercase tracking-wider">
                  {event.status === 'SCHEDULED' ? 'Planifie' : event.status === 'ONGOING' ? 'En cours' : event.status === 'COMPLETED' ? 'Termine' : 'Annule'}
                </Typography>
              </View>
              <Typography variant="caption" color="muted" className="text-xs">
                {organiser.displayName || organiser.email || 'Anonyme'}
              </Typography>
            </View>
            <H1 className="text-3xl font-bold leading-tight tracking-tight text-charcoal dark:text-white mb-2">
              {event.title}
            </H1>
            <View className="flex-row items-center gap-2 mb-1">
              <MaterialIcons name="calendar-today" size={18} color="#64748b" />
              <Typography variant="bodySmall" color="muted">{formattedDate}</Typography>
            </View>
            {(event.locationName || event.locationAddress) && (
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="location-on" size={18} color="#64748b" />
                <Typography variant="bodySmall" color="muted">
                  {event.locationName || event.locationAddress}
                </Typography>
              </View>
            )}
          </View>

          {/* Map section (design) - MapView + Polyline when route available (spec 3.2.b) */}
          {(event.locationName || event.locationLat) && (
            <View className="mb-4 relative">
              <EventMapView
                locationName={event.locationName}
                locationAddress={event.locationAddress}
                latitude={event.locationLat}
                longitude={event.locationLng}
                route={routes?.[0] ?? null}
                routeName={routes?.[0]?.name ?? null}
              />
              {routes?.[0]?.name && (
                <View className="absolute top-3 left-3 z-10 bg-charcoal/80 px-3 py-1 rounded-full">
                  <Typography className="text-white text-xs font-semibold">{routes[0].name}</Typography>
                </View>
              )}
            </View>
          )}

          {/* Description (design) */}
          {event.description && (
            <View className="mb-4">
              <Typography variant="label" className="text-secondary-400 dark:text-secondary-500 uppercase tracking-widest mb-2">
                Description
              </Typography>
              <Typography className="text-secondary-700 dark:text-secondary-300 leading-relaxed">
                {event.description}
              </Typography>
            </View>
          )}

          {/* Invite Code card (design) - organiser only when active */}
          {showShareBar && (
            <ShareCodeSection eventCode={event.eventCode} eventTitle={event.title} />
          )}

          {/* Participants link card (design) */}
          {goingParticipants.length > 0 && (
            <Pressable
              onPress={() => router.push(`/event/participants/${event.id}`)}
              className="flex-row items-center justify-between p-4 bg-white dark:bg-charcoal/10 rounded-xl border border-secondary-100 dark:border-secondary-800 mb-4"
            >
              <View className="flex-row items-center gap-3">
                <View className="flex-row -space-x-2">
                  {goingParticipants.slice(0, 3).map((p) => (
                    <View
                      key={p.id}
                      className="w-8 h-8 rounded-full border-2 border-white dark:border-secondary-900 bg-secondary-200 dark:bg-secondary-700 items-center justify-center"
                    >
                      <Typography variant="caption">{(p.displayName || p.email || '?').charAt(0).toUpperCase()}</Typography>
                    </View>
                  ))}
                  {goingParticipants.length > 3 && (
                    <View className="w-8 h-8 rounded-full border-2 border-white dark:border-secondary-900 bg-secondary-200 items-center justify-center">
                      <Typography variant="caption" className="text-xs font-bold">+{goingParticipants.length - 3}</Typography>
                    </View>
                  )}
                </View>
                <Typography variant="label" className="text-charcoal dark:text-secondary-200">
                  View {goingParticipants.length} participant{goingParticipants.length > 1 ? 's' : ''}
                </Typography>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#94a3b8" />
            </Pressable>
          )}

          {/* Read-only / Cancelled */}
          {event.status === 'COMPLETED' && (
            <View className="bg-secondary-100 dark:bg-secondary-800 rounded-lg p-3 mb-6 flex-row items-center">
              <Typography className="mr-2">🔒</Typography>
              <View className="flex-1">
                <Typography variant="bodySmall" color="muted">Cette sortie est terminee – Mode lecture seule</Typography>
                {event.completedAt && (
                  <Typography variant="caption" color="muted">Cloturee le {formatCompletedDate(event.completedAt)}</Typography>
                )}
              </View>
            </View>
          )}
          {event.status === 'CANCELLED' && (
            <View className="bg-red-100 dark:bg-red-900/30 rounded-lg p-3 mb-6 flex-row items-center">
              <Typography className="mr-2">❌</Typography>
              <Typography variant="bodySmall" className="text-red-700 dark:text-red-400">Cette sortie a ete annulee</Typography>
            </View>
          )}

          <OrganiserActions eventId={event.id} eventStatus={event.status} isOrganiser={isOrganiser} />
          <CompleteEventButton eventId={event.id} eventStatus={event.status} isOrganiser={isOrganiser} />

          {/* Participants list (first 5) + link */}
          {goingParticipants.length > 0 && (
            <View className="mb-6">
              <H3 className="mb-3">Participants ({goingParticipants.length})</H3>
              {goingParticipants.slice(0, 5).map((p) => (
                <ParticipantItem key={p.id} participant={p} />
              ))}
            </View>
          )}

          {event.status === 'SCHEDULED' && (
            <ParticipationActions
              eventId={event.id}
              currentStatus={currentUserStatus}
              isOrganiser={isOrganiser}
              eventStatus={event.status}
            />
          )}

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

        {/* Bottom bar: Show QR, Copy Link (design) - organiser only when active */}
        {showShareBar && (
          <View
            className="absolute left-0 right-0 bottom-0 bg-white/95 dark:bg-backgroundDark/95 border-t border-secondary-100 dark:border-secondary-800 p-4 flex-row gap-3"
            style={{ paddingBottom: insets.bottom + 16 }}
          >
            <Pressable
              onPress={() => router.push(`/event/share/${event.id}`)}
              className="flex-1 h-14 rounded-xl bg-charcoal dark:bg-white items-center justify-center flex-row gap-2"
            >
              <MaterialIcons name="qr-code-2" size={22} color={colorScheme === 'dark' ? '#0B1220' : '#fff'} />
              <Typography className="text-white dark:text-charcoal font-bold">Show QR</Typography>
            </Pressable>
            <Pressable
              onPress={handleShareLink}
              className="flex-1 h-14 rounded-xl border-2 border-charcoal dark:border-white items-center justify-center flex-row gap-2"
            >
              <MaterialIcons name="link" size={22} color={iconColor} />
              <Typography className="text-charcoal dark:text-white font-bold">Copy Link</Typography>
            </Pressable>
          </View>
        )}
      </View>
    </>
  );
}

