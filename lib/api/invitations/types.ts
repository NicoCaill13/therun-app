import { z } from 'zod';

// ============================================================================
// GET /api/me/invitations - My invitations
// ============================================================================

export const InvitationItemSchema = z.object({
  participantId: z.string(),
  eventId: z.string(),
  role: z.string(),
  status: z.string(),
  eventTitle: z.string(),
  startDateTime: z.string(),
  locationName: z.string().nullable(),
  organiserId: z.string(),
  organiserFirstName: z.string(),
  organiserLastName: z.string().nullable(),
});

export const InvitationsListSchema = z.object({
  items: z.array(InvitationItemSchema),
  page: z.number(),
  pageSize: z.number(),
  totalCount: z.number(),
  totalPages: z.number(),
});

export type InvitationItem = z.infer<typeof InvitationItemSchema>;
export type InvitationsList = z.infer<typeof InvitationsListSchema>;

// ============================================================================
// GET /api/events/:id/invite/search - Search users to invite
// ============================================================================

export const InviteSearchItemSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string().nullable(),
  email: z.string().nullable(),
});

export const InviteSearchResponseSchema = z.object({
  items: z.array(InviteSearchItemSchema),
  page: z.number(),
  pageSize: z.number(),
  totalCount: z.number(),
  totalPages: z.number(),
});

export type InviteSearchItem = z.infer<typeof InviteSearchItemSchema>;
export type InviteSearchResponse = z.infer<typeof InviteSearchResponseSchema>;

// ============================================================================
// POST /api/events/:id/participants/invite - Invite a participant
// ============================================================================

export const InviteParticipantInputSchema = z.object({
  userId: z.string(),
  role: z.enum(['PARTICIPANT', 'ENCADRANT']),
});

export type InviteParticipantInput = z.infer<typeof InviteParticipantInputSchema>;

export const InviteParticipantResponseSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  userId: z.string(),
  role: z.string(),
  status: z.string(),
});

export type InviteParticipantResponse = z.infer<typeof InviteParticipantResponseSchema>;

// ============================================================================
// POST /api/events/:id/participants/:participantId/respond - RSVP
// ============================================================================

export const RespondInvitationInputSchema = z.object({
  status: z.enum(['GOING', 'DECLINED']),
});

export type RespondInvitationInput = z.infer<typeof RespondInvitationInputSchema>;

export const RespondInvitationResponseSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  userId: z.string(),
  role: z.string(),
  status: z.string(),
});

export type RespondInvitationResponse = z.infer<typeof RespondInvitationResponseSchema>;
