import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery, useApiMutation } from '@/lib/hooks';
import { apiClient } from '@/lib/api/client';
import { eventKeys } from '@/lib/api/events/hooks';
import {
  ParticipantsListResponse,
  ParticipantsListResponseSchema,
  ParticipantsSummaryResponse,
  ParticipantsSummaryResponseSchema,
  ParticipantResponse,
  ParticipantResponseSchema,
  UpsertParticipationInput,
  UpdateSelectionInput,
  ParticipantsQueryParams,
  ParticipantStatus,
} from './types';

// ============================================================================
// Query Keys
// ============================================================================

export const participantKeys = {
  all: ['participants'] as const,
  lists: () => [...participantKeys.all, 'list'] as const,
  list: (eventId: string, params?: Omit<ParticipantsQueryParams, 'eventId'>) =>
    [...participantKeys.lists(), eventId, params] as const,
  summaries: () => [...participantKeys.all, 'summary'] as const,
  summary: (eventId: string) => [...participantKeys.summaries(), eventId] as const,
};

// ============================================================================
// useParticipantsList - List event participants (paginated)
// ============================================================================

interface UseParticipantsListOptions {
  enabled?: boolean;
}

/**
 * Hook to fetch event participants (paginated).
 * Uses GET /events/:eventId/participants endpoint.
 */
export function useParticipantsList(
  params: ParticipantsQueryParams,
  options?: UseParticipantsListOptions
) {
  const { eventId, ...queryParams } = params;

  return useApiQuery<ParticipantsListResponse>(
    participantKeys.list(eventId, queryParams),
    async () => {
      const response = await apiClient.get(`/events/${eventId}/participants`, {
        params: {
          status: queryParams.status,
          eventGroupId: queryParams.eventGroupId,
          page: queryParams.page ?? 1,
          pageSize: queryParams.pageSize ?? 20,
        },
      });

      return ParticipantsListResponseSchema.parse(response.data);
    },
    {
      enabled: (options?.enabled ?? true) && !!eventId,
    }
  );
}

// ============================================================================
// useParticipantsSummary - Get participants summary (counts by route/group)
// ============================================================================

interface UseParticipantsSummaryOptions {
  enabled?: boolean;
}

/**
 * Hook to fetch participants summary.
 * Uses GET /events/:eventId/participants/summary endpoint.
 */
export function useParticipantsSummary(
  eventId: string,
  options?: UseParticipantsSummaryOptions
) {
  return useApiQuery<ParticipantsSummaryResponse>(
    participantKeys.summary(eventId),
    async () => {
      const response = await apiClient.get(`/events/${eventId}/participants/summary`);

      return ParticipantsSummaryResponseSchema.parse(response.data);
    },
    {
      enabled: (options?.enabled ?? true) && !!eventId,
    }
  );
}

// ============================================================================
// useUpsertParticipation - Join/Leave event (Optimistic UI)
// ============================================================================

interface UpsertParticipationParams {
  eventId: string;
  input: UpsertParticipationInput;
}

/**
 * Hook to upsert current user's participation (join/leave).
 * Uses POST /events/:eventId/participants/me endpoint.
 *
 * Implements DoD 4 (Optimistic UI):
 * - Updates cache immediately before API call
 * - Rollbacks on error
 */
export function useUpsertParticipation() {
  const queryClient = useQueryClient();

  return useApiMutation<ParticipantResponse, UpsertParticipationParams>(
    async ({ eventId, input }) => {
      const response = await apiClient.post(`/events/${eventId}/participants/me`, input);

      return ParticipantResponseSchema.parse(response.data);
    },
    {
      onMutate: async ({ eventId, input }) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({ queryKey: eventKeys.detail(eventId) });
        await queryClient.cancelQueries({ queryKey: participantKeys.summary(eventId) });

        // Snapshot the previous values
        const previousEvent = queryClient.getQueryData(eventKeys.detail(eventId));
        const previousSummary = queryClient.getQueryData(participantKeys.summary(eventId));

        // Optimistically update the summary counts
        queryClient.setQueryData<ParticipantsSummaryResponse>(
          participantKeys.summary(eventId),
          (old) => {
            if (!old) return old;

            // Simplified optimistic update: adjust counts based on new status
            const isJoining = input.status === 'GOING';
            const isLeaving = input.status === 'DECLINED';

            return {
              ...old,
              goingCount: isJoining ? old.goingCount + 1 : isLeaving ? old.goingCount - 1 : old.goingCount,
              maybeCount: input.status === 'MAYBE' ? old.maybeCount + 1 : old.maybeCount,
            };
          }
        );

        return { previousEvent, previousSummary };
      },
      onError: (_error, { eventId }, context) => {
        // Rollback on error
        if (context?.previousEvent) {
          queryClient.setQueryData(eventKeys.detail(eventId), context.previousEvent);
        }
        if (context?.previousSummary) {
          queryClient.setQueryData(participantKeys.summary(eventId), context.previousSummary);
        }
      },
      onSettled: (_data, _error, { eventId }) => {
        // Invalidate to refetch fresh data
        queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
        queryClient.invalidateQueries({ queryKey: participantKeys.summary(eventId) });
        queryClient.invalidateQueries({ queryKey: participantKeys.list(eventId) });
      },
    }
  );
}

// ============================================================================
// useUpdateSelection - Update pace group / route selection
// ============================================================================

interface UpdateSelectionParams {
  eventId: string;
  input: UpdateSelectionInput;
}

/**
 * Hook to update current user's selection (pace group/route).
 * Uses PATCH /events/:eventId/participants/me endpoint.
 */
export function useUpdateSelection() {
  const queryClient = useQueryClient();

  return useApiMutation<ParticipantResponse, UpdateSelectionParams>(
    async ({ eventId, input }) => {
      const response = await apiClient.patch(`/events/${eventId}/participants/me`, input);

      return ParticipantResponseSchema.parse(response.data);
    },
    {
      onSuccess: (_data, { eventId }) => {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
        queryClient.invalidateQueries({ queryKey: participantKeys.summary(eventId) });
        queryClient.invalidateQueries({ queryKey: participantKeys.list(eventId) });
      },
    }
  );
}
