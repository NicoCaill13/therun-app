import { z } from 'zod';

// ============================================================================
// Participant Status & Role Enums
// ============================================================================

export const ParticipantStatusSchema = z.enum(['INVITED', 'GOING', 'MAYBE', 'DECLINED']);
export type ParticipantStatus = z.infer<typeof ParticipantStatusSchema>;

export const RoleInEventSchema = z.enum(['ORGANISER', 'ENCADRANT', 'PARTICIPANT']);
export type RoleInEvent = z.infer<typeof RoleInEventSchema>;

// ============================================================================
// Event Route Reference (nested in participant)
// ============================================================================

export const EventRouteRefSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
});

export type EventRouteRef = z.infer<typeof EventRouteRefSchema>;

// ============================================================================
// Event Group Reference (nested in participant)
// ============================================================================

export const EventGroupRefSchema = z.object({
  id: z.string().uuid(),
  label: z.string(),
});

export type EventGroupRef = z.infer<typeof EventGroupRefSchema>;

// ============================================================================
// Participant List Item
// ============================================================================

export const ParticipantListItemSchema = z.object({
  participantId: z.string().uuid(),
  userId: z.string().uuid().nullable(),
  displayName: z.string(),
  roleInEvent: RoleInEventSchema,
  status: ParticipantStatusSchema,
  eventRoute: EventRouteRefSchema.nullable(),
  eventGroup: EventGroupRefSchema.nullable(),
});

export type ParticipantListItem = z.infer<typeof ParticipantListItemSchema>;

// ============================================================================
// Participants List Response (paginated)
// ============================================================================

export const ParticipantsListResponseSchema = z.object({
  items: z.array(ParticipantListItemSchema),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  totalCount: z.number().int().min(0),
  totalPages: z.number().int().min(0),
});

export type ParticipantsListResponse = z.infer<typeof ParticipantsListResponseSchema>;

// ============================================================================
// Participants by Route (for summary)
// ============================================================================

export const ParticipantsByRouteSchema = z.object({
  eventRouteId: z.string().uuid(),
  name: z.string(),
  goingCount: z.number().int().min(0),
});

export type ParticipantsByRoute = z.infer<typeof ParticipantsByRouteSchema>;

// ============================================================================
// Participants by Group (for summary)
// ============================================================================

export const ParticipantsByGroupSchema = z.object({
  eventGroupId: z.string().uuid(),
  label: z.string(),
  goingCount: z.number().int().min(0),
});

export type ParticipantsByGroup = z.infer<typeof ParticipantsByGroupSchema>;

// ============================================================================
// Participants Summary Response
// ============================================================================

export const ParticipantsSummaryResponseSchema = z.object({
  goingCount: z.number().int().min(0),
  invitedCount: z.number().int().min(0),
  maybeCount: z.number().int().min(0),
  byRoute: z.array(ParticipantsByRouteSchema),
  byGroup: z.array(ParticipantsByGroupSchema),
});

export type ParticipantsSummaryResponse = z.infer<typeof ParticipantsSummaryResponseSchema>;

// ============================================================================
// Upsert My Participation Input
// ============================================================================

export const UpsertParticipationInputSchema = z.object({
  status: z.enum(['GOING', 'MAYBE', 'DECLINED']),
});

export type UpsertParticipationInput = z.infer<typeof UpsertParticipationInputSchema>;

// ============================================================================
// Update My Selection Input
// ============================================================================

export const UpdateSelectionInputSchema = z.object({
  eventRouteId: z.string().uuid().nullable().optional(),
  eventGroupId: z.string().uuid().nullable().optional(),
});

export type UpdateSelectionInput = z.infer<typeof UpdateSelectionInputSchema>;

// ============================================================================
// Participant Response (after mutation)
// ============================================================================

export const ParticipantResponseSchema = z.object({
  userId: z.string().uuid().nullable(),
  displayName: z.string(),
  eventRouteId: z.string().uuid().nullable(),
  eventGroupId: z.string().uuid().nullable(),
  roleInEvent: RoleInEventSchema.optional(),
  status: ParticipantStatusSchema,
});

export type ParticipantResponse = z.infer<typeof ParticipantResponseSchema>;

// ============================================================================
// Query Params
// ============================================================================

export interface ParticipantsQueryParams {
  eventId: string;
  status?: ParticipantStatus;
  eventGroupId?: string;
  page?: number;
  pageSize?: number;
}
