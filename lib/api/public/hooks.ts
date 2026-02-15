import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { useAuth } from '@/lib/auth';
import { PublicEventSchema, GuestJoinResponseSchema } from './types';
import type { PublicEvent, GuestJoinInput, GuestJoinResponse } from './types';

/** GET /api/public/events/by-code/:eventCode - Public event preview (no auth) */
export function usePublicEventByCode(eventCode: string | undefined) {
  return useQuery<PublicEvent>({
    queryKey: ['public', 'events', eventCode],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/public/events/by-code/${eventCode}`);
      return PublicEventSchema.parse(data);
    },
    enabled: Boolean(eventCode),
    retry: false,
  });
}

/** POST /api/public/events/:eventId/guest-join - Join as guest (no auth required) */
export function useGuestJoin(eventId: string) {
  const { signInAsGuest } = useAuth();

  return useMutation<GuestJoinResponse, unknown, GuestJoinInput>({
    mutationFn: async (input) => {
      const { data } = await apiClient.post(`/api/public/events/${eventId}/guest-join`, input);
      return GuestJoinResponseSchema.parse(data);
    },
    onSuccess: async (response) => {
      await signInAsGuest(response.accessToken, response.userId);
    },
  });
}
