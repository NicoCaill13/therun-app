import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery, useApiMutation } from '@/lib/hooks';
import { apiClient } from '@/lib/api/client';
import {
  CreateEventRouteInput,
  CreateRouteInput,
  EventRoute,
  EventRouteSchema,
  EventRoutesList,
  EventRoutesListSchema,
  ListRoutesQueryParams,
  Route,
  RouteListResponse,
  RouteListResponseSchema,
  RouteSchema,
  SuggestRoutesQueryParams,
  SuggestRoutesResponse,
  SuggestRoutesResponseSchema,
} from './types';

// ============================================================================
// Query Keys
// ============================================================================

export const routeKeys = {
  all: ['routes'] as const,
  lists: () => [...routeKeys.all, 'list'] as const,
  list: (params: ListRoutesQueryParams) => [...routeKeys.lists(), params] as const,
  details: () => [...routeKeys.all, 'detail'] as const,
  detail: (routeId: string) => [...routeKeys.details(), routeId] as const,
  suggestions: () => [...routeKeys.all, 'suggest'] as const,
  suggestion: (params: SuggestRoutesQueryParams) => [...routeKeys.suggestions(), params] as const,
  eventRoutes: () => [...routeKeys.all, 'event'] as const,
  eventRoute: (eventId: string) => [...routeKeys.eventRoutes(), eventId] as const,
};

// ============================================================================
// useRoutes - List/search routes from library
// ============================================================================

interface UseRoutesOptions {
  enabled?: boolean;
}

/**
 * Hook to fetch routes from library with optional filters.
 * Uses GET /routes endpoint.
 */
export function useRoutes(params: ListRoutesQueryParams = {}, options?: UseRoutesOptions) {
  return useApiQuery<RouteListResponse>(
    routeKeys.list(params),
    async () => {
      const response = await apiClient.get('/routes', {
        params: {
          createdBy: params.createdBy,
          lat: params.lat,
          lng: params.lng,
          radiusMeters: params.radiusMeters,
          distanceMin: params.distanceMin,
          distanceMax: params.distanceMax,
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 20,
        },
      });

      // Validate response with Zod (DoD 1)
      return RouteListResponseSchema.parse(response.data);
    },
    {
      enabled: options?.enabled ?? true,
    }
  );
}

// ============================================================================
// useMyRoutes - List current user's routes
// ============================================================================

/**
 * Hook to fetch current user's routes.
 * Convenience wrapper around useRoutes with createdBy='me'.
 */
export function useMyRoutes(params: Omit<ListRoutesQueryParams, 'createdBy'> = {}, options?: UseRoutesOptions) {
  return useRoutes({ ...params, createdBy: 'me' }, options);
}

// ============================================================================
// useRoute - Get single route details
// ============================================================================

interface UseRouteOptions {
  enabled?: boolean;
}

/**
 * Hook to fetch route details.
 * Uses GET /routes/:routeId endpoint.
 */
export function useRoute(routeId: string, options?: UseRouteOptions) {
  return useApiQuery<Route>(
    routeKeys.detail(routeId),
    async () => {
      const response = await apiClient.get(`/routes/${routeId}`);

      // Validate response with Zod (DoD 1)
      return RouteSchema.parse(response.data);
    },
    {
      enabled: (options?.enabled ?? true) && !!routeId,
    }
  );
}

// ============================================================================
// useSuggestRoutes - Get route suggestions near a location
// ============================================================================

interface UseSuggestRoutesOptions {
  enabled?: boolean;
}

/**
 * Hook to fetch route suggestions near a location.
 * Uses GET /routes/suggest endpoint.
 */
export function useSuggestRoutes(params: SuggestRoutesQueryParams, options?: UseSuggestRoutesOptions) {
  return useApiQuery<SuggestRoutesResponse>(
    routeKeys.suggestion(params),
    async () => {
      const response = await apiClient.get('/routes/suggest', {
        params: {
          lat: params.lat,
          lng: params.lng,
          radiusMeters: params.radiusMeters ?? 10000,
        },
      });

      // Validate response with Zod (DoD 1)
      return SuggestRoutesResponseSchema.parse(response.data);
    },
    {
      enabled: (options?.enabled ?? true) && !!params.lat && !!params.lng,
    }
  );
}

// ============================================================================
// useCreateRoute - Create a new route in library
// ============================================================================

/**
 * Hook to create a new route in library.
 * Uses POST /routes endpoint.
 */
export function useCreateRoute() {
  const queryClient = useQueryClient();

  return useApiMutation<Route, CreateRouteInput>(
    async (data) => {
      const response = await apiClient.post('/routes', data);

      // Validate response with Zod (DoD 1)
      return RouteSchema.parse(response.data);
    },
    {
      onSuccess: (created) => {
        // Set cache for the new route
        queryClient.setQueryData(routeKeys.detail(created.id), created);

        // Invalidate list queries
        queryClient.invalidateQueries({ queryKey: routeKeys.lists() });
      },
    }
  );
}

// ============================================================================
// useAddRouteToEvent - Attach a route to an event
// ============================================================================

interface AddRouteToEventParams {
  eventId: string;
  data: CreateEventRouteInput;
}

/**
 * Hook to attach a route to an event.
 * Uses POST /events/:eventId/routes endpoint.
 * 
 * Can either attach an existing route (routeId) or create inline (encodedPolyline).
 */
export function useAddRouteToEvent() {
  const queryClient = useQueryClient();

  return useApiMutation<EventRoute, AddRouteToEventParams>(
    async ({ eventId, data }) => {
      const response = await apiClient.post(`/events/${eventId}/routes`, data);

      // Validate response with Zod (DoD 1)
      return EventRouteSchema.parse(response.data);
    },
    {
      onSuccess: (_, { eventId }) => {
        // Invalidate event routes
        queryClient.invalidateQueries({ queryKey: routeKeys.eventRoute(eventId) });
      },
    }
  );
}

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
