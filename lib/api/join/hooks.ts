import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from '../client';
import { normalizeApiError, type NormalizedError } from '../normalizeApiError';
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
 */
export function useJoinResolve(
  eventCode: string,
  options?: Omit<UseQueryOptions<JoinEventSummary, NormalizedError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<JoinEventSummary, NormalizedError>({
    queryKey: joinKeys.resolve(eventCode),
    queryFn: () => fetchJoinResolve(eventCode),
    enabled: Boolean(eventCode) && options?.enabled !== false,
    ...options,
  });
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
 */
export function usePublicEventByCode(
  eventCode: string,
  options?: Omit<UseQueryOptions<PublicEventByCode, NormalizedError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<PublicEventByCode, NormalizedError>({
    queryKey: joinKeys.publicByCode(eventCode),
    queryFn: () => fetchPublicEventByCode(eventCode),
    enabled: Boolean(eventCode) && options?.enabled !== false,
    ...options,
  });
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
 */
export function useJoinParticipate() {
  const queryClient = useQueryClient();

  return useMutation<JoinParticipateResponse, NormalizedError, string>({
    mutationFn: joinParticipate,
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['events', data.eventId] });
      queryClient.invalidateQueries({ queryKey: ['events', 'mine'] });
    },
    onError: (error) => {
      // Error is already normalized by apiClient interceptor
      console.error('[useJoinParticipate] Error:', error);
    },
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
 */
export function useGuestJoin() {
  const queryClient = useQueryClient();

  return useMutation<GuestJoinResponse, NormalizedError, GuestJoinParams>({
    mutationFn: guestJoin,
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['events', data.eventId] });
    },
    onError: (error) => {
      console.error('[useGuestJoin] Error:', error);
    },
  });
}

// ============================================================================
// useJoinFlow - Combined hook for the complete join flow
// ============================================================================

interface JoinFlowState {
  step: 'loading' | 'preview' | 'guest_form' | 'joining' | 'success' | 'error';
  event: PublicEventByCode | null;
  error: NormalizedError | null;
}

/**
 * Combined hook that orchestrates the complete join flow.
 * Handles both authenticated and guest users.
 */
export function useJoinFlow(eventCode: string, isAuthenticated: boolean) {
  const publicEventQuery = usePublicEventByCode(eventCode, { enabled: Boolean(eventCode) });
  const joinParticipate = useJoinParticipate();
  const guestJoin = useGuestJoin();

  const joinAsUser = useCallback(async () => {
    if (!eventCode) return null;
    return joinParticipate.mutateAsync(eventCode);
  }, [eventCode, joinParticipate]);

  const joinAsGuest = useCallback(async (input: GuestJoinInput) => {
    if (!publicEventQuery.data?.join.eventId) return null;
    return guestJoin.mutateAsync({
      eventId: publicEventQuery.data.join.eventId,
      input,
    });
  }, [publicEventQuery.data, guestJoin]);

  return {
    // Event data
    event: publicEventQuery.data ?? null,
    isLoadingEvent: publicEventQuery.isLoading,
    eventError: publicEventQuery.error ?? null,
    refetchEvent: publicEventQuery.refetch,

    // Join mutations
    joinAsUser,
    joinAsGuest,
    isJoining: joinParticipate.isPending || guestJoin.isPending,
    joinError: joinParticipate.error ?? guestJoin.error ?? null,
    joinResult: joinParticipate.data ?? guestJoin.data ?? null,
  };
}
