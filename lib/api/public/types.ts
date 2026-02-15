import { z } from 'zod';

// ============================================================================
// GET /api/public/events/by-code/:eventCode - Public event preview
// ============================================================================

export const PublicOrganiserSchema = z.object({
  firstName: z.string(),
  lastName: z.string().nullable(),
});

export const PublicJoinSchema = z.object({
  eventCode: z.string(),
  eventId: z.string(),
});

export const PublicEventSchema = z.object({
  id: z.string(),
  eventCode: z.string(),
  title: z.string(),
  startDateTime: z.string(),
  status: z.string(),
  locationName: z.string().nullable(),
  locationAddress: z.string().nullable(),
  organiser: PublicOrganiserSchema,
  join: PublicJoinSchema,
});

export type PublicEvent = z.infer<typeof PublicEventSchema>;

// ============================================================================
// POST /api/public/events/:eventId/guest-join - Guest join
// ============================================================================

export const GuestJoinInputSchema = z.object({
  firstName: z.string().min(1, 'Nom requis').max(50),
  lastName: z.string().max(80).optional(),
  email: z.string().email().max(255).optional(),
});

export type GuestJoinInput = z.infer<typeof GuestJoinInputSchema>;

export const GuestJoinResponseSchema = z.object({
  eventId: z.string(),
  participantId: z.string(),
  userId: z.string(),
  isGuest: z.boolean(),
  accessToken: z.string(),
});

export type GuestJoinResponse = z.infer<typeof GuestJoinResponseSchema>;
