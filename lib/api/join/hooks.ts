import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { useApiQuery, useApiMutation } from '@/lib/hooks';
import type { NormalizedApiError } from '../normalizeApiError';
import {
  JoinEventSummarySchema,
  JoinParticipateResponseSchema,
  PublicEventByCodeSchema,
  GuestJoinResponseSchema,
  type JoinEventSummary,
  type JoinParticipateResponse,
  type PublicEventByCode,
  type GuestJoinInput,
  type GuestJoinResponse,
} from './types';

// ============================================================================
// Query Keys
// ============================================================================

export const joinKeys = {
  all: ['join'] as const,
  resolve: (eventCode: string) => [...joinKeys.all, 'resolve', eventCode] as const,
  publicByCode: (eventCode: string) => [...joinKeys.all, 'public', eventCode] as const,
};

// ============================================================================
// Query Options Interface
// ============================================================================

interface UseQueryOptions {
  /**
   * Whether the query is enabled.
   * @default true
   */
  enabled?: boolean;
}

// ============================================================================
// useJoinResolve - GET /join/:eventCode
// ============================================================================

/**
 * Fetches event summary by code.
 * This is a public endpoint (no auth required).
 */
async function fetchJoinResolve(eventCode: string): Promise<JoinEventSummary> {
  const response = await apiClient.get(`/join/${eventCode}`);
  return JoinEventSummarySchema.parse(response.data);
}

/**
 * Hook to resolve an event by code.
 *
 * @param eventCode - The event code to resolve
 * @param options - Query options
 * @returns Query result with JoinEventSummary data
 */
export function useJoinResolve(eventCode: string, options?: UseQueryOptions) {
  return useApiQuery<JoinEventSummary>(
    joinKeys.resolve(eventCode),
    () => fetchJoinResolve(eventCode),
    {
      enabled: Boolean(eventCode) && (options?.enabled ?? true),
    }
  );
}

// ============================================================================
// usePublicEventByCode - GET /public/events/by-code/:eventCode
// ============================================================================

/**
 * Fetches public event details by code.
 * This is a public endpoint (no auth required).
 */
async function fetchPublicEventByCode(eventCode: string): Promise<PublicEventByCode> {
  const response = await apiClient.get(`/public/events/by-code/${eventCode}`);
  return PublicEventByCodeSchema.parse(response.data);
}

/**
 * Hook to get public event details by code.
 *
 * @param eventCode - The event code to look up
 * @param options - Query options
 * @returns Query result with PublicEventByCode data
 */
export function usePublicEventByCode(eventCode: string, options?: UseQueryOptions) {
  return useApiQuery<PublicEventByCode>(
    joinKeys.publicByCode(eventCode),
    () => fetchPublicEventByCode(eventCode),
    {
      enabled: Boolean(eventCode) && (options?.enabled ?? true),
    }
  );
}

// ============================================================================
// useJoinParticipate - POST /join/:eventCode/participate
// ============================================================================

/**
 * Join event as authenticated user.
 */
async function joinParticipate(eventCode: string): Promise<JoinParticipateResponse> {
  const response = await apiClient.post(`/join/${eventCode}/participate`);
  return JoinParticipateResponseSchema.parse(response.data);
}

/**
 * Hook for authenticated user to join an event.
 *
 * @returns Mutation for joining an event
 */
export function useJoinParticipate() {
  const queryClient = useQueryClient();

  return useApiMutation<JoinParticipateResponse, string>(joinParticipate, {
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['events', data.eventId] });
      queryClient.invalidateQueries({ queryKey: ['events', 'mine'] });
      queryClient.invalidateQueries({ queryKey: ['me', 'events'] });
    },
    // Disable auto upsell for join flow (handled differently)
    autoShowUpsell: false,
  });
}

// ============================================================================
// useGuestJoin - POST /public/events/:eventId/guest-join
// ============================================================================

interface GuestJoinParams {
  eventId: string;
  input: GuestJoinInput;
}

/**
 * Join event as guest (no auth required).
 */
async function guestJoin({ eventId, input }: GuestJoinParams): Promise<GuestJoinResponse> {
  const response = await apiClient.post(`/public/events/${eventId}/guest-join`, input);
  return GuestJoinResponseSchema.parse(response.data);
}

/**
 * Hook for guest to join an event (no auth required).
 *
 * @returns Mutation for guest joining
 */
export function useGuestJoin() {
  const queryClient = useQueryClient();

  return useApiMutation<GuestJoinResponse, GuestJoinParams>(guestJoin, {
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['events', data.eventId] });
    },
    // Disable auto upsell for guest join
    autoShowUpsell: false,
  });
}

// ============================================================================
// useJoinFlow - Combined hook for the complete join flow
// ============================================================================

/**
 * Combined hook that orchestrates the complete join flow.
 * Handles both authenticated and guest users.
 *
 * @param eventCode - The event code to join
 * @param isAuthenticated - Whether the current user is authenticated
 * @returns Object with all join flow state and actions
 */
export function useJoinFlow(eventCode: string, isAuthenticated: boolean) {
  const publicEventQuery = usePublicEventByCode(eventCode, { enabled: Boolean(eventCode) });
  const joinParticipateMutation = useJoinParticipate();
  const guestJoinMutation = useGuestJoin();

  const joinAsUser = useCallback(async () => {
    if (!eventCode) return null;
    return joinParticipateMutation.mutateAsync(eventCode);
  }, [eventCode, joinParticipateMutation]);

  const joinAsGuest = useCallback(
    async (input: GuestJoinInput) => {
      if (!publicEventQuery.data?.join.eventId) return null;
      return guestJoinMutation.mutateAsync({
        eventId: publicEventQuery.data.join.eventId,
        input,
      });
    },
    [publicEventQuery.data, guestJoinMutation]
  );

  return {
    // Event data
    event: publicEventQuery.data ?? null,
    isLoadingEvent: publicEventQuery.isLoading,
    eventError: publicEventQuery.error ?? null,
    refetchEvent: publicEventQuery.refetch,

    // Join mutations
    joinAsUser,
    joinAsGuest,
    isJoining: joinParticipateMutation.isPending || guestJoinMutation.isPending,
    joinError: joinParticipateMutation.error ?? guestJoinMutation.error ?? null,
    joinResult: joinParticipateMutation.data ?? guestJoinMutation.data ?? null,
  };
}
