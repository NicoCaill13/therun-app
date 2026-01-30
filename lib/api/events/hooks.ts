import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery, useApiMutation } from '@/lib/hooks';
import { apiClient } from '@/lib/api/client';
import {
  CreateEventInput,
  EventDetailsResponse,
  EventDetailsResponseSchema,
  MeEventsListResponse,
  MeEventsListResponseSchema,
  MeEventsQueryParams,
} from './types';

// ============================================================================
// Query Keys
// ============================================================================

export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (params: MeEventsQueryParams) => [...eventKeys.lists(), params] as const,
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
  mine: (params: MeEventsQueryParams) => ['me', 'events', params] as const,
};

// ============================================================================
// useMyEvents - List current user's events
// ============================================================================

interface UseMyEventsOptions {
  enabled?: boolean;
}

/**
 * Hook to fetch current user's events.
 * Uses GET /me/events endpoint.
 */
export function useMyEvents(params: MeEventsQueryParams, options?: UseMyEventsOptions) {
  return useApiQuery<MeEventsListResponse>(
    eventKeys.mine(params),
    async () => {
      const response = await apiClient.get('/me/events', {
        params: {
          scope: params.scope,
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 20,
        },
      });

      // Validate response with Zod (DoD 1)
      return MeEventsListResponseSchema.parse(response.data);
    },
    {
      enabled: options?.enabled ?? true,
    }
  );
}

// ============================================================================
// useEventDetails - Get single event details
// ============================================================================

interface UseEventDetailsOptions {
  enabled?: boolean;
}

/**
 * Hook to fetch event details.
 * Uses GET /events/:eventId endpoint.
 */
export function useEventDetails(eventId: string, options?: UseEventDetailsOptions) {
  return useApiQuery<EventDetailsResponse>(
    eventKeys.detail(eventId),
    async () => {
      const response = await apiClient.get(`/events/${eventId}`);

      // Validate response with Zod (DoD 1)
      return EventDetailsResponseSchema.parse(response.data);
    },
    {
      enabled: (options?.enabled ?? true) && !!eventId,
    }
  );
}

// ============================================================================
// useCreateEvent - Create a new event
// ============================================================================

/**
 * Hook to create a new event.
 * Uses POST /events endpoint.
 *
 * Implements DoD 3 (Instant Experience):
 * - setQueryData immediately after creation
 * - Then invalidates queries for fresh data
 */
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useApiMutation<EventDetailsResponse, CreateEventInput>(
    async (data: CreateEventInput) => {
      const response = await apiClient.post('/events', data);

      // Validate response with Zod (DoD 1)
      return EventDetailsResponseSchema.parse(response.data);
    },
    {
      onSuccess: (created) => {
        // DoD 3: Instant Experience - set cache immediately
        queryClient.setQueryData(eventKeys.detail(created.event.id), created);

        // Invalidate list queries to include the new event
        queryClient.invalidateQueries({ queryKey: ['me', 'events'] });
      },
    }
  );
}
