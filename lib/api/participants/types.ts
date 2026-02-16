import { z } from 'zod';

// ============================================================================
// GET /api/events/:id/participants - Paginated list
// ============================================================================

export const ParticipantItemSchema = z.object({
  participantId: z.string(),
  userId: z.string(),
  displayName: z.string(),
  roleInEvent: z.string(),
  status: z.string(),
  eventRoute: z.object({
    id: z.string(),
    name: z.string(),
  }).nullable().optional(),
  eventGroup: z.object({
    id: z.string(),
    label: z.string(),
  }).nullable().optional(),
});

export const ParticipantsListSchema = z.object({
  items: z.array(ParticipantItemSchema),
  page: z.number(),
  pageSize: z.number(),
  totalCount: z.number(),
  totalPages: z.number(),
});

export type ParticipantItem = z.infer<typeof ParticipantItemSchema>;
export type ParticipantsList = z.infer<typeof ParticipantsListSchema>;

// ============================================================================
// GET /api/events/:id/participants/summary
// ============================================================================

export const ParticipantsSummarySchema = z.object({
  goingCount: z.number(),
  invitedCount: z.number(),
  maybeCount: z.number(),
  byRoute: z.array(z.object({
    eventRouteId: z.string(),
    name: z.string(),
    goingCount: z.number(),
  })),
  byGroup: z.array(z.object({
    eventGroupId: z.string(),
    label: z.string(),
    goingCount: z.number(),
  })),
});

export type ParticipantsSummary = z.infer<typeof ParticipantsSummarySchema>;

// ============================================================================
// POST /api/events/:id/participants/me - Upsert participation
// ============================================================================

export type ParticipationStatus = 'GOING' | 'DECLINED' | 'MAYBE';

export const UpsertParticipationInputSchema = z.object({
  status: z.enum(['GOING', 'DECLINED', 'MAYBE']),
});

// ============================================================================
// PATCH /api/events/:id/participants/me - Update selection
// ============================================================================

export const UpdateSelectionInputSchema = z.object({
  eventRouteId: z.string().nullable().optional(),
  eventGroupId: z.string().nullable().optional(),
});

export type UpdateSelectionInput = z.infer<typeof UpdateSelectionInputSchema>;

// ============================================================================
// PATCH /api/events/:id/participants/:userId/role - Update participant role
// ============================================================================

export const UpdateParticipantRoleInputSchema = z.object({
  roleInEvent: z.enum(['ORGANISER', 'ENCADRANT', 'PARTICIPANT']),
});

export type UpdateParticipantRoleInput = z.infer<typeof UpdateParticipantRoleInputSchema>;
