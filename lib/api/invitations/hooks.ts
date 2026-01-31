import { useQueryClient, InfiniteData } from '@tanstack/react-query';
import { useApiQuery, useApiMutation, useApiInfiniteQuery } from '@/lib/hooks';
import { apiClient } from '@/lib/api/client';
import {
  InviteUserInput,
  InviteUserResponse,
  InviteUserResponseSchema,
  InvitationsQueryParams,
  MyInvitationsResponse,
  MyInvitationsResponseSchema,
  RespondInvitationInput,
  RespondInvitationResponse,
  RespondInvitationResponseSchema,
  SearchUsersQueryParams,
  SearchUsersResponse,
  SearchUsersResponseSchema,
} from './types';
import { eventKeys } from '@/lib/api/events/hooks';

// ============================================================================
// Query Keys
// ============================================================================

export const invitationKeys = {
  all: ['invitations'] as const,
  lists: () => [...invitationKeys.all, 'list'] as const,
  list: (params: InvitationsQueryParams) => [...invitationKeys.lists(), params] as const,
  searchUsers: (eventId: string, query: string) => ['users', 'search', eventId, query] as const,
};

// ============================================================================
// useMyInvitations - List current user's pending invitations
// ============================================================================

interface UseMyInvitationsOptions {
  enabled?: boolean;
}

/**
 * Hook to fetch current user's pending invitations.
 * Uses GET /me/invitations endpoint.
 */
export function useMyInvitations(params: InvitationsQueryParams = {}, options?: UseMyInvitationsOptions) {
  return useApiQuery<MyInvitationsResponse>(
    invitationKeys.list(params),
    async () => {
      const response = await apiClient.get('/me/invitations', {
        params: {
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 20,
        },
      });

      // Validate response with Zod (DoD 1)
      return MyInvitationsResponseSchema.parse(response.data);
    },
    {
      enabled: options?.enabled ?? true,
    }
  );
}

// ============================================================================
// useMyInvitationsInfinite - Infinite scroll for invitations
// ============================================================================

interface UseMyInvitationsInfiniteOptions {
  enabled?: boolean;
  pageSize?: number;
}

/**
 * Hook to fetch current user's invitations with infinite scroll.
 * Uses GET /me/invitations endpoint with pagination.
 */
export function useMyInvitationsInfinite(options?: UseMyInvitationsInfiniteOptions) {
  const pageSize = options?.pageSize ?? 20;

  return useApiInfiniteQuery<MyInvitationsResponse>(
    [...invitationKeys.lists(), { infinite: true }],
    async ({ pageParam }) => {
      const response = await apiClient.get('/me/invitations', {
        params: {
          page: pageParam.page,
          pageSize,
        },
      });

      // Validate response with Zod (DoD 1)
      return MyInvitationsResponseSchema.parse(response.data);
    },
    {
      enabled: options?.enabled ?? true,
      getNextPageParam: (lastPage) => {
        if (lastPage.page < lastPage.totalPages) {
          return { page: lastPage.page + 1 };
        }
        return undefined;
      },
    }
  );
}

/**
 * Helper to flatten infinite query pages into a single array.
 */
export function flattenInfiniteInvitations(data: InfiniteData<MyInvitationsResponse> | undefined) {
  if (!data) return [];
  return data.pages.flatMap((page) => page.items);
}

// ============================================================================
// useRespondToInvitation - Respond to an invitation (GOING/DECLINED/MAYBE)
// ============================================================================

interface RespondToInvitationParams {
  eventId: string;
  participantId: string;
  data: RespondInvitationInput;
}

/**
 * Hook to respond to an invitation.
 * Uses POST /events/:eventId/participants/:participantId/respond endpoint.
 */
export function useRespondToInvitation() {
  const queryClient = useQueryClient();

  return useApiMutation<RespondInvitationResponse, RespondToInvitationParams>(
    async ({ eventId, participantId, data }) => {
      const response = await apiClient.post(
        `/events/${eventId}/participants/${participantId}/respond`,
        data
      );

      // Validate response with Zod (DoD 1)
      return RespondInvitationResponseSchema.parse(response.data);
    },
    {
      onSuccess: (_, { eventId }) => {
        // Invalidate invitations list
        queryClient.invalidateQueries({ queryKey: invitationKeys.all });
        // Invalidate event details
        queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
        // Invalidate my events
        queryClient.invalidateQueries({ queryKey: ['me', 'events'] });
      },
    }
  );
}

// ============================================================================
// useSearchUsersToInvite - Search users to invite to an event
// ============================================================================

interface UseSearchUsersOptions {
  enabled?: boolean;
}

/**
 * Hook to search users to invite to an event.
 * Uses GET /events/:eventId/invite/search endpoint.
 */
export function useSearchUsersToInvite(params: SearchUsersQueryParams, options?: UseSearchUsersOptions) {
  return useApiQuery<SearchUsersResponse>(
    invitationKeys.searchUsers(params.eventId, params.query),
    async () => {
      const response = await apiClient.get(`/events/${params.eventId}/invite/search`, {
        params: {
          q: params.query,
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 20,
        },
      });

      // Validate response with Zod (DoD 1)
      return SearchUsersResponseSchema.parse(response.data);
    },
    {
      enabled: (options?.enabled ?? true) && !!params.query && params.query.length >= 2,
    }
  );
}

// ============================================================================
// useInviteUserToEvent - Invite a user to an event
// ============================================================================

interface InviteUserToEventParams {
  eventId: string;
  data: InviteUserInput;
}

/**
 * Hook to invite a user to an event.
 * Uses POST /events/:eventId/participants/invite endpoint.
 */
export function useInviteUserToEvent() {
  const queryClient = useQueryClient();

  return useApiMutation<InviteUserResponse, InviteUserToEventParams>(
    async ({ eventId, data }) => {
      const response = await apiClient.post(`/events/${eventId}/participants/invite`, data);

      // Validate response with Zod (DoD 1)
      return InviteUserResponseSchema.parse(response.data);
    },
    {
      onSuccess: (_, { eventId }) => {
        // Invalidate event details to refresh participants list
        queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
        // Invalidate participants queries
        queryClient.invalidateQueries({ queryKey: ['participants', eventId] });
      },
    }
  );
}
