import { z } from 'zod';

// ============================================================================
// Participant Role and Status
// ============================================================================

export const ParticipantRoleSchema = z.enum(['PARTICIPANT', 'ENCADRANT', 'ORGANISER']);
export type ParticipantRole = z.infer<typeof ParticipantRoleSchema>;

export const InvitationStatusSchema = z.enum(['INVITED', 'GOING', 'DECLINED', 'MAYBE']);
export type InvitationStatus = z.infer<typeof InvitationStatusSchema>;

// ============================================================================
// Invitation Item
// ============================================================================

export const InvitationItemSchema = z.object({
  participantId: z.string().uuid(),
  eventId: z.string().uuid(),
  role: ParticipantRoleSchema,
  status: z.literal('INVITED'),
  eventTitle: z.string(),
  startDateTime: z.string().datetime(),
  locationName: z.string().nullable(),
  organiserId: z.string().uuid(),
  organiserFirstName: z.string(),
  organiserLastName: z.string().nullable(),
});

export type InvitationItem = z.infer<typeof InvitationItemSchema>;

// ============================================================================
// My Invitations Response (paginated)
// ============================================================================

export const MyInvitationsResponseSchema = z.object({
  items: z.array(InvitationItemSchema),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  totalCount: z.number().int().min(0),
  totalPages: z.number().int().min(0),
});

export type MyInvitationsResponse = z.infer<typeof MyInvitationsResponseSchema>;

// ============================================================================
// Respond to Invitation
// ============================================================================

export const RespondInvitationInputSchema = z.object({
  status: z.enum(['GOING', 'DECLINED', 'MAYBE']),
});

export type RespondInvitationInput = z.infer<typeof RespondInvitationInputSchema>;

export const RespondInvitationResponseSchema = z.object({
  participantId: z.string().uuid(),
  status: InvitationStatusSchema,
  respondedAt: z.string().datetime(),
});

export type RespondInvitationResponse = z.infer<typeof RespondInvitationResponseSchema>;

// ============================================================================
// Invite User to Event
// ============================================================================

export const InviteUserInputSchema = z.object({
  userId: z.string().uuid(),
  role: ParticipantRoleSchema.optional(),
});

export type InviteUserInput = z.infer<typeof InviteUserInputSchema>;

export const InviteUserResponseSchema = z.object({
  participantId: z.string().uuid(),
  userId: z.string().uuid(),
  eventId: z.string().uuid(),
  role: ParticipantRoleSchema,
  status: z.literal('INVITED'),
  displayName: z.string().nullable(),
  email: z.string().email().nullable(),
});

export type InviteUserResponse = z.infer<typeof InviteUserResponseSchema>;

// ============================================================================
// Search Users to Invite
// ============================================================================

export const SearchUserItemSchema = z.object({
  id: z.string().uuid(),
  displayName: z.string().nullable(),
  email: z.string().email().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
});

export type SearchUserItem = z.infer<typeof SearchUserItemSchema>;

export const SearchUsersResponseSchema = z.object({
  items: z.array(SearchUserItemSchema),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  totalCount: z.number().int().min(0),
  totalPages: z.number().int().min(0),
});

export type SearchUsersResponse = z.infer<typeof SearchUsersResponseSchema>;

// ============================================================================
// Query Params
// ============================================================================

export interface InvitationsQueryParams {
  page?: number;
  pageSize?: number;
}

export interface SearchUsersQueryParams {
  query: string;
  eventId: string;
  page?: number;
  pageSize?: number;
}
