import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { JoinEventSummarySchema, JoinParticipateResponseSchema } from './types';
import type { JoinEventSummary, JoinParticipateResponse } from './types';

/** GET /api/join/:eventCode - Resolve event from code */
export function useResolveEventCode(code: string | undefined) {
  return useQuery<JoinEventSummary>({
    queryKey: ['join', code],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/join/${code}`);
      return JoinEventSummarySchema.parse(data);
    },
    enabled: Boolean(code) && (code?.length ?? 0) >= 4,
    retry: false,
  });
}

/** POST /api/join/:eventCode/participate - Join event as authenticated user */
export function useParticipate(code: string) {
  const queryClient = useQueryClient();

  return useMutation<JoinParticipateResponse, unknown, void>({
    mutationFn: async () => {
      const { data } = await apiClient.post(`/api/join/${code}/participate`);
      return JoinParticipateResponseSchema.parse(data);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['events', result.eventId] });
      queryClient.invalidateQueries({ queryKey: ['me', 'events'] });
    },
  });
}
