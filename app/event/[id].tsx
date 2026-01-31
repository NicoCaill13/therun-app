import { useCallback, useState } from 'react';
import { View, ActivityIndicator, Share, Pressable, RefreshControl, useColorScheme } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { ScrollContainer, Container, Typography, H1, H2, H3, Button } from '@/components/ui';
import { useEventDetails, type EventParticipant, type EventStatus } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { config } from '@/lib/config';

// ============================================================================
// Loading State
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
// Error State
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
// Status Badge
// ============================================================================

interface StatusBadgeProps {
  status: EventStatus;
}

function StatusBadge({ status }: StatusBadgeProps) {
  const config = getStatusConfig(status);

  return (
    <View className={`px-3 py-1.5 rounded-full ${config.bgClass}`}>
      <Typography variant="bodySmall" className={config.textClass}>
        {config.label}
      </Typography>
    </View>
  );
}

function getStatusConfig(status: EventStatus) {
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
      return {
        label: 'Planifie',
        bgClass: 'bg-primary-100 dark:bg-primary-900/30',
        textClass: 'text-primary-700 dark:text-primary-400',
      };
  }
}

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

function getParticipantStatusIcon(status: EventParticipant['status']): string {
  switch (status) {
    case 'GOING':
      return '✅';
    case 'MAYBE':
      return '🤔';
    case 'DECLINED':
      return '❌';
    case 'INVITED':
    default:
      return '📨';
  }
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

  // Check if current user is the organiser
  const isOrganiser = user?.id === data?.organiser.id;

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
          <StatusBadge status={event.status} />
        </View>

        {/* Organiser */}
        <Typography color="muted" className="mb-6">
          Organise par {organiser.displayName || organiser.email || 'Anonyme'}
        </Typography>

        {/* Share Code (only for organiser) */}
        {isOrganiser && event.status === 'SCHEDULED' && (
          <ShareCodeSection eventCode={event.eventCode} eventTitle={event.title} />
        )}

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
            {goingParticipants.length > 5 && (
              <Pressable className="py-3">
                <Typography color="primary" className="text-center">
                  Voir tous les participants ({goingParticipants.length})
                </Typography>
              </Pressable>
            )}
          </View>
        )}

        {/* Actions (placeholder for future phases) */}
        {event.status === 'SCHEDULED' && !isOrganiser && (
          <View className="mt-4">
            <Button
              variant="primary"
              size="lg"
              isFullWidth
              onPress={() => {
                // Will be implemented in Phase 3
              }}
            >
              Participer
            </Button>
          </View>
        )}
      </ScrollContainer>
    </>
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
    year: 'numeric',
  };

  const formattedDate = date.toLocaleDateString('fr-FR', dateOptions);
  return `${formattedDate} a ${time}`;
}
