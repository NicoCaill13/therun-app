import { z } from 'zod';

// ============================================================================
// GET /api/join/:eventCode - Resolve event by code
// ============================================================================

export const JoinEventSummarySchema = z.object({
  eventId: z.string(),
  title: z.string(),
  startDateTime: z.string(),
  locationName: z.string().nullable(),
  locationLat: z.number().nullable(),
  locationLng: z.number().nullable(),
  organiserId: z.string(),
  organiserFirstName: z.string(),
  organiserLastName: z.string().nullable(),
});

export type JoinEventSummary = z.infer<typeof JoinEventSummarySchema>;

// ============================================================================
// POST /api/join/:eventCode/participate - Join as authenticated user
// ============================================================================

export const JoinParticipateResponseSchema = z.object({
  participantId: z.string(),
  eventId: z.string(),
  userId: z.string(),
  role: z.string(),
  status: z.string(),
});

export type JoinParticipateResponse = z.infer<typeof JoinParticipateResponseSchema>;
