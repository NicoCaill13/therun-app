import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { MeProfileSchema, MeEventsListSchema } from './types';
import type { MeProfile, MeEventsList, MeEventsScope } from './types';

/** GET /api/me - Current user profile with plan benefits */
export function useMe() {
  return useQuery<MeProfile>({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/me');
      return MeProfileSchema.parse(data);
    },
  });
}

/** GET /api/me/events - My events (future | past | cancelled) */
export function useMeEvents(scope: MeEventsScope, page = 1, pageSize = 20) {
  return useQuery<MeEventsList>({
    queryKey: ['me', 'events', scope, page],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/me/events', {
        params: { scope, page, pageSize },
      });
      return MeEventsListSchema.parse(data);
    },
  });
}
