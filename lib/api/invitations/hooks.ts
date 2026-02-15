import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import {
  InvitationsListSchema,
  InviteSearchResponseSchema,
  InviteParticipantResponseSchema,
} from './types';
import type {
  InvitationsList,
  InviteSearchResponse,
  InviteParticipantInput,
  InviteParticipantResponse,
} from './types';

/** GET /api/me/invitations - My pending invitations */
export function useInvitations(page = 1) {
  return useQuery<InvitationsList>({
    queryKey: ['me', 'invitations', page],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/me/invitations', {
        params: { page, pageSize: 20 },
      });
      return InvitationsListSchema.parse(data);
    },
  });
}

/** GET /api/events/:id/invite/search - Search users to invite */
export function useInviteSearch(eventId: string, query: string) {
  return useQuery<InviteSearchResponse>({
    queryKey: ['events', eventId, 'invite', 'search', query],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/events/${eventId}/invite/search`, {
        params: { query },
      });
      return InviteSearchResponseSchema.parse(data);
    },
    enabled: query.length >= 2,
  });
}

/** POST /api/events/:id/participants/invite - Invite a user to event */
export function useInviteParticipant(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation<InviteParticipantResponse, unknown, InviteParticipantInput>({
    mutationFn: async (input) => {
      const { data } = await apiClient.post(
        `/api/events/${eventId}/participants/invite`,
        input
      );
      return InviteParticipantResponseSchema.parse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'participants'] });
    },
  });
}
