import { useApiQuery } from '@/lib/hooks';
import { apiClient } from '@/lib/api/client';
import {
  EventRoutesList,
  EventRoutesListSchema,
} from './types';

// ============================================================================
// Query Keys
// ============================================================================

export const routeKeys = {
  all: ['routes'] as const,
  eventRoutes: () => [...routeKeys.all, 'event'] as const,
  eventRoute: (eventId: string) => [...routeKeys.eventRoutes(), eventId] as const,
};

// ============================================================================
// useEventRoutes - List routes attached to an event
// ============================================================================

interface UseEventRoutesOptions {
  enabled?: boolean;
}

/**
 * Hook to fetch event routes (with encoded polylines).
 * Uses GET /events/:eventId/routes endpoint.
 */
export function useEventRoutes(eventId: string, options?: UseEventRoutesOptions) {
  return useApiQuery<EventRoutesList>(
    routeKeys.eventRoute(eventId),
    async () => {
      const response = await apiClient.get(`/events/${eventId}/routes`);

      return EventRoutesListSchema.parse(response.data);
    },
    {
      enabled: (options?.enabled ?? true) && !!eventId,
    }
  );
}
