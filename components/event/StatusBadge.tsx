import { View } from 'react-native';
import { Typography } from '@/components/ui';
import type { EventStatus, ParticipantStatus } from '@/lib/api';
import type { MeEventItem } from '@/lib/api/events/types';

// ============================================================================
// Types
// ============================================================================

/**
 * Status configuration for visual display.
 */
interface StatusConfig {
  label: string;
  bgClass: string;
  textClass: string;
  icon?: string;
}

// ============================================================================
// Event Status Badge
// ============================================================================

/**
 * Props for EventStatusBadge component.
 */
interface EventStatusBadgeProps {
  /**
   * Event status value.
   */
  status: EventStatus | MeEventItem['status'];

  /**
   * Size of the badge.
   * @default "md"
   */
  size?: 'sm' | 'md';
}

/**
 * Get configuration for an event status.
 */
function getEventStatusConfig(status: EventStatus | MeEventItem['status']): StatusConfig | null {
  switch (status) {
    case 'ONGOING':
      return {
        label: 'En cours',
        bgClass: 'bg-green-100 dark:bg-green-900/30',
        textClass: 'text-green-700 dark:text-green-400',
        icon: '🏃',
      };
    case 'COMPLETED':
      return {
        label: 'Termine',
        bgClass: 'bg-secondary-100 dark:bg-secondary-700',
        textClass: 'text-secondary-600 dark:text-secondary-400',
        icon: '✅',
      };
    case 'CANCELLED':
      return {
        label: 'Annule',
        bgClass: 'bg-red-100 dark:bg-red-900/30',
        textClass: 'text-red-700 dark:text-red-400',
        icon: '❌',
      };
    case 'SCHEDULED':
      return {
        label: 'Planifie',
        bgClass: 'bg-primary-100 dark:bg-primary-900/30',
        textClass: 'text-primary-700 dark:text-primary-400',
        icon: '📅',
      };
    default:
      return null;
  }
}

/**
 * Badge component for displaying event status.
 *
 * @example
 * <EventStatusBadge status="ONGOING" />
 * <EventStatusBadge status={event.status} size="sm" />
 */
export function EventStatusBadge({ status, size = 'md' }: EventStatusBadgeProps) {
  const config = getEventStatusConfig(status);

  if (!config) return null;

  const sizeClasses = size === 'sm' ? 'px-2 py-1' : 'px-3 py-1.5';
  const textVariant = size === 'sm' ? 'caption' : 'bodySmall';

  return (
    <View className={`${sizeClasses} rounded-full ${config.bgClass}`}>
      <Typography variant={textVariant} className={config.textClass}>
        {config.label}
      </Typography>
    </View>
  );
}

// ============================================================================
// Participant Status Badge
// ============================================================================

/**
 * Props for ParticipantStatusBadge component.
 */
interface ParticipantStatusBadgeProps {
  /**
   * Participant status value.
   */
  status: ParticipantStatus;

  /**
   * Whether to show the icon only (no label).
   * @default false
   */
  iconOnly?: boolean;

  /**
   * Size of the badge.
   * @default "md"
   */
  size?: 'sm' | 'md';
}

/**
 * Get configuration for a participant status.
 */
function getParticipantStatusConfig(status: ParticipantStatus): StatusConfig {
  switch (status) {
    case 'GOING':
      return {
        label: 'Participe',
        bgClass: 'bg-green-100 dark:bg-green-900/30',
        textClass: 'text-green-700 dark:text-green-400',
        icon: '✅',
      };
    case 'MAYBE':
      return {
        label: 'Peut-etre',
        bgClass: 'bg-yellow-100 dark:bg-yellow-900/30',
        textClass: 'text-yellow-700 dark:text-yellow-400',
        icon: '🤔',
      };
    case 'DECLINED':
      return {
        label: 'Decline',
        bgClass: 'bg-red-100 dark:bg-red-900/30',
        textClass: 'text-red-700 dark:text-red-400',
        icon: '❌',
      };
    case 'INVITED':
    default:
      return {
        label: 'Invite',
        bgClass: 'bg-secondary-100 dark:bg-secondary-700',
        textClass: 'text-secondary-600 dark:text-secondary-400',
        icon: '📨',
      };
  }
}

/**
 * Get status icon for a participant.
 * Utility function for simpler use cases.
 */
export function getParticipantStatusIcon(status: ParticipantStatus): string {
  return getParticipantStatusConfig(status).icon ?? '❓';
}

/**
 * Badge component for displaying participant status.
 *
 * @example
 * <ParticipantStatusBadge status="GOING" />
 * <ParticipantStatusBadge status={participant.status} iconOnly />
 */
export function ParticipantStatusBadge({
  status,
  iconOnly = false,
  size = 'md',
}: ParticipantStatusBadgeProps) {
  const config = getParticipantStatusConfig(status);

  if (iconOnly) {
    return <Typography>{config.icon}</Typography>;
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-1' : 'px-3 py-1.5';
  const textVariant = size === 'sm' ? 'caption' : 'bodySmall';

  return (
    <View className={`${sizeClasses} rounded-full ${config.bgClass}`}>
      <Typography variant={textVariant} className={config.textClass}>
        {config.icon} {config.label}
      </Typography>
    </View>
  );
}

/**
 * Get human-readable text for a participation status.
 * Used for accessibility and status messages.
 */
export function getParticipationStatusText(status: ParticipantStatus): string {
  switch (status) {
    case 'GOING':
      return 'Vous participez a cet evenement';
    case 'MAYBE':
      return 'Vous avez indique "peut-etre"';
    case 'DECLINED':
      return 'Vous avez decline cet evenement';
    case 'INVITED':
      return 'Vous etes invite';
    default:
      return '';
  }
}
