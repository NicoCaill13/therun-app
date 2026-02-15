import { z } from 'zod';

// ============================================================================
// POST /api/events - Create event input
// ============================================================================

export const CreateEventInputSchema = z.object({
  title: z.string().min(1, 'Titre requis'),
  description: z.string().optional(),
  startDateTime: z.string().min(1, 'Date requise'),
  locationName: z.string().optional(),
  locationAddress: z.string().optional(),
  locationLat: z.number().optional(),
  locationLng: z.number().optional(),
});

export type CreateEventInput = z.infer<typeof CreateEventInputSchema>;

// ============================================================================
// PATCH /api/events/:id - Update event input
// ============================================================================

export const UpdateEventInputSchema = z.object({
  startDateTime: z.string().optional(),
  locationName: z.string().max(120).optional(),
  locationAddress: z.string().max(200).optional(),
  locationLat: z.number().optional(),
  locationLng: z.number().optional(),
  status: z.string().optional(),
});

export type UpdateEventInput = z.infer<typeof UpdateEventInputSchema>;

// ============================================================================
// Response schemas
// ============================================================================

export const EventBlockSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  startDateTime: z.string(),
  locationName: z.string().nullable(),
  locationAddress: z.string().nullable(),
  locationLat: z.number().nullable(),
  locationLng: z.number().nullable(),
  status: z.string(),
  eventCode: z.string(),
  completedAt: z.string().nullable(),
  goingCountAtCompletion: z.number().nullable(),
});

export const SimpleUserSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  avatarUrl: z.string().nullable().optional(),
});

export const EventParticipantSchema = z.object({
  userId: z.string(),
  displayName: z.string(),
  eventRouteId: z.string().nullable(),
  eventGroupId: z.string().nullable(),
  roleInEvent: z.string(),
  status: z.string(),
});

export const CurrentUserParticipationSchema = z.object({
  userId: z.string(),
  roleInEvent: z.string(),
  status: z.string(),
  eventRouteId: z.string().nullable(),
  eventGroupId: z.string().nullable(),
});

export const EventDetailsSchema = z.object({
  event: EventBlockSchema,
  organiser: SimpleUserSchema,
  participants: z.array(EventParticipantSchema),
  currentUserParticipation: CurrentUserParticipationSchema.nullable(),
});

export type EventBlock = z.infer<typeof EventBlockSchema>;
export type SimpleUser = z.infer<typeof SimpleUserSchema>;
export type EventParticipant = z.infer<typeof EventParticipantSchema>;
export type CurrentUserParticipation = z.infer<typeof CurrentUserParticipationSchema>;
export type EventDetails = z.infer<typeof EventDetailsSchema>;

// ============================================================================
// POST /api/events/:id/broadcast
// ============================================================================

export const BroadcastInputSchema = z.object({
  title: z.string().max(120).optional(),
  body: z.string().min(1).max(1000),
});

export type BroadcastInput = z.infer<typeof BroadcastInputSchema>;

export const BroadcastResponseSchema = z.object({
  sentCount: z.number(),
});

export type BroadcastResponse = z.infer<typeof BroadcastResponseSchema>;

// ============================================================================
// POST /api/events/:id/duplicate
// ============================================================================

export const DuplicateEventInputSchema = z.object({
  startDateTime: z.string(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  locationName: z.string().optional(),
  locationAddress: z.string().optional(),
  locationLat: z.number().optional(),
  locationLng: z.number().optional(),
  copyAllGroups: z.boolean().optional(),
  groupIds: z.array(z.string()).optional(),
});

export type DuplicateEventInput = z.infer<typeof DuplicateEventInputSchema>;
