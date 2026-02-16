import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { ParticipantsListSchema, ParticipantsSummarySchema } from './types';
import type {
  ParticipantsList,
  ParticipantsSummary,
  ParticipationStatus,
  UpdateSelectionInput,
  UpdateParticipantRoleInput,
} from './types';

/** GET /api/events/:id/participants - Paginated participant list */
export function useParticipants(
  eventId: string | undefined,
  filters?: { status?: string; page?: number; pageSize?: number }
) {
  return useQuery<ParticipantsList>({
    queryKey: ['events', eventId, 'participants', filters],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/events/${eventId}/participants`, {
        params: filters,
      });
      return ParticipantsListSchema.parse(data);
    },
    enabled: Boolean(eventId),
  });
}

/** GET /api/events/:id/participants/summary */
export function useParticipantsSummary(eventId: string | undefined) {
  return useQuery<ParticipantsSummary>({
    queryKey: ['events', eventId, 'participants', 'summary'],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/events/${eventId}/participants/summary`);
      return ParticipantsSummarySchema.parse(data);
    },
    enabled: Boolean(eventId),
  });
}

/** POST /api/events/:id/participants/me - Join/leave event */
export function useUpsertMyParticipation(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (status: ParticipationStatus) => {
      const { data } = await apiClient.post(`/api/events/${eventId}/participants/me`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'participants'] });
    },
  });
}

/** PATCH /api/events/:id/participants/me - Update route/group selection */
export function useUpdateMySelection(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateSelectionInput) => {
      const { data } = await apiClient.patch(`/api/events/${eventId}/participants/me`, input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId] });
    },
  });
}

/** PATCH /api/events/:id/participants/:userId/role - Update participant role */
export function useUpdateParticipantRole(eventId: string, userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateParticipantRoleInput) => {
      const { data } = await apiClient.patch(
        `/api/events/${eventId}/participants/${userId}/role`,
        input
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'participants'] });
    },
  });
}
