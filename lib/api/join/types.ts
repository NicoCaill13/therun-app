import { z } from 'zod';

// ============================================================================
// JoinEventSummary - GET /join/:eventCode
// ============================================================================

/**
 * Public event summary returned when resolving an event code.
 */
export const JoinEventSummarySchema = z.object({
  eventId: z.string(),
  title: z.string(),
  startDateTime: z.string().transform((val) => new Date(val)),
  locationName: z.string().nullable(),
  locationLat: z.number().nullable(),
  locationLng: z.number().nullable(),
  organiserId: z.string(),
  organiserFirstName: z.string(),
  organiserLastName: z.string().nullable(),
});

export type JoinEventSummary = z.infer<typeof JoinEventSummarySchema>;

// ============================================================================
// JoinParticipateResponse - POST /join/:eventCode/participate
// ============================================================================

/**
 * Response when an authenticated user joins an event.
 */
export const JoinParticipateResponseSchema = z.object({
  participantId: z.string(),
  eventId: z.string(),
  userId: z.string(),
  role: z.enum(['PARTICIPANT', 'ENCADRANT', 'ORGANISER']),
  status: z.literal('GOING'),
});

export type JoinParticipateResponse = z.infer<typeof JoinParticipateResponseSchema>;

// ============================================================================
// PublicEventByCode - GET /public/events/by-code/:eventCode
// ============================================================================

/**
 * Public organiser info.
 */
export const PublicOrganiserSchema = z.object({
  firstName: z.string(),
  lastName: z.string().nullable().optional(),
});

export type PublicOrganiser = z.infer<typeof PublicOrganiserSchema>;

/**
 * Join info for the event.
 */
export const PublicJoinInfoSchema = z.object({
  eventCode: z.string(),
  eventId: z.string(),
});

export type PublicJoinInfo = z.infer<typeof PublicJoinInfoSchema>;

/**
 * Event status enum.
 */
export const EventStatusSchema = z.enum(['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED']);
export type EventStatus = z.infer<typeof EventStatusSchema>;

/**
 * Public event details returned by code lookup.
 */
export const PublicEventByCodeSchema = z.object({
  id: z.string(),
  eventCode: z.string(),
  title: z.string(),
  startDateTime: z.string(),
  status: EventStatusSchema,
  locationName: z.string().nullable().optional(),
  locationAddress: z.string().nullable().optional(),
  organiser: PublicOrganiserSchema,
  join: PublicJoinInfoSchema,
});

export type PublicEventByCode = z.infer<typeof PublicEventByCodeSchema>;

// ============================================================================
// GuestJoin - POST /public/events/:eventId/guest-join
// ============================================================================

/**
 * Input for guest join.
 */
export const GuestJoinInputSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis').max(50),
  lastName: z.string().max(80).optional(),
  email: z.string().email('Email invalide').max(255).optional(),
});

export type GuestJoinInput = z.infer<typeof GuestJoinInputSchema>;

/**
 * Response from guest join.
 */
export const GuestJoinResponseSchema = z.object({
  eventId: z.string(),
  participantId: z.string(),
  userId: z.string(),
  isGuest: z.boolean(),
  accessToken: z.string(),
});

export type GuestJoinResponse = z.infer<typeof GuestJoinResponseSchema>;
