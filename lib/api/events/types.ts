import { z } from 'zod';

// ============================================================================
// Event Status Enum
// ============================================================================

export const EventStatusSchema = z.enum(['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED']);
export type EventStatus = z.infer<typeof EventStatusSchema>;

// ============================================================================
// Create Event
// ============================================================================

/**
 * Schema for creating a new event.
 * Matches backend CreateEventDto.
 */
export const CreateEventInputSchema = z.object({
  title: z
    .string()
    .min(1, 'Le titre est requis')
    .max(100, 'Le titre ne doit pas dépasser 100 caractères'),
  description: z
    .string()
    .max(500, 'La description ne doit pas dépasser 500 caractères')
    .optional(),
  startDateTime: z.string().datetime({ message: 'Date et heure invalides' }),
  locationName: z
    .string()
    .max(100, 'Le nom du lieu ne doit pas dépasser 100 caractères')
    .optional(),
  locationAddress: z
    .string()
    .max(200, "L'adresse ne doit pas dépasser 200 caractères")
    .optional(),
  locationLat: z.number().min(-90).max(90).optional(),
  locationLng: z.number().min(-180).max(180).optional(),
});

export type CreateEventInput = z.infer<typeof CreateEventInputSchema>;

// ============================================================================
// Event Block (core event data)
// ============================================================================

export const EventBlockSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  startDateTime: z.string().datetime(),
  locationName: z.string().nullable(),
  locationAddress: z.string().nullable(),
  locationLat: z.number().nullable(),
  locationLng: z.number().nullable(),
  status: EventStatusSchema,
  eventCode: z.string(),
  completedAt: z.string().datetime().nullable(),
  goingCountAtCompletion: z.number().nullable(),
});

export type EventBlock = z.infer<typeof EventBlockSchema>;

// ============================================================================
// Simple User (organiser)
// ============================================================================

export const SimpleUserSchema = z.object({
  id: z.string().uuid(),
  displayName: z.string().nullable(),
  email: z.string().email().nullable(),
});

export type SimpleUser = z.infer<typeof SimpleUserSchema>;

// ============================================================================
// Event Participant
// ============================================================================

export const ParticipantStatusSchema = z.enum(['INVITED', 'GOING', 'DECLINED', 'MAYBE']);
export type ParticipantStatus = z.infer<typeof ParticipantStatusSchema>;

export const EventParticipantSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid().nullable(),
  displayName: z.string().nullable(),
  email: z.string().email().nullable(),
  status: ParticipantStatusSchema,
  selectedPaceGroupId: z.string().uuid().nullable(),
});

export type EventParticipant = z.infer<typeof EventParticipantSchema>;

// ============================================================================
// Current User Participation
// ============================================================================

export const CurrentUserParticipationSchema = z.object({
  participantId: z.string().uuid(),
  status: ParticipantStatusSchema,
  selectedPaceGroupId: z.string().uuid().nullable(),
  canEdit: z.boolean(),
});

export type CurrentUserParticipation = z.infer<typeof CurrentUserParticipationSchema>;

// ============================================================================
// Event Details Response (full event with relations)
// ============================================================================

export const EventDetailsResponseSchema = z.object({
  event: EventBlockSchema,
  organiser: SimpleUserSchema,
  participants: z.array(EventParticipantSchema),
  currentUserParticipation: CurrentUserParticipationSchema.nullable(),
});

export type EventDetailsResponse = z.infer<typeof EventDetailsResponseSchema>;

// ============================================================================
// My Events List Item
// ============================================================================

export const MeEventItemSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  startDateTime: z.string().datetime(),
  status: EventStatusSchema,
  locationName: z.string().nullable(),
  locationAddress: z.string().nullable(),
  goingCount: z.number(),
});

export type MeEventItem = z.infer<typeof MeEventItemSchema>;

// ============================================================================
// My Events List Response
// ============================================================================

export const MeEventsListResponseSchema = z.object({
  items: z.array(MeEventItemSchema),
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
});

export type MeEventsListResponse = z.infer<typeof MeEventsListResponseSchema>;

// ============================================================================
// Query Params
// ============================================================================

export type EventScope = 'future' | 'past' | 'cancelled';

export interface MeEventsQueryParams {
  scope: EventScope;
  page?: number;
  pageSize?: number;
}
