import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import {
  EventDetailsSchema,
  BroadcastResponseSchema,
} from './types';
import type {
  CreateEventInput,
  UpdateEventInput,
  EventDetails,
  BroadcastInput,
  BroadcastResponse,
  DuplicateEventInput,
} from './types';

/** GET /api/events/:id - Event details */
export function useEvent(eventId: string | undefined) {
  return useQuery<EventDetails>({
    queryKey: ['events', eventId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/events/${eventId}`);
      return EventDetailsSchema.parse(data);
    },
    enabled: Boolean(eventId),
  });
}

/** POST /api/events - Create a new event */
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation<EventDetails, unknown, CreateEventInput>({
    mutationFn: async (input) => {
      const { data } = await apiClient.post('/api/events', input);
      return EventDetailsSchema.parse(data);
    },
    onSuccess: (created) => {
      // Optimistic: inject into cache immediately
      queryClient.setQueryData(['events', created.event.id], created);
      // Invalidate my events list
      queryClient.invalidateQueries({ queryKey: ['me', 'events'] });
    },
  });
}

/** PATCH /api/events/:id - Update event */
export function useUpdateEvent(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation<EventDetails, unknown, UpdateEventInput>({
    mutationFn: async (input) => {
      const { data } = await apiClient.patch(`/api/events/${eventId}`, input);
      return EventDetailsSchema.parse(data);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['events', eventId], updated);
      queryClient.invalidateQueries({ queryKey: ['me', 'events'] });
    },
  });
}

/** PATCH /api/events/:id/complete - Mark event as completed */
export function useCompleteEvent(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation<EventDetails, unknown, void>({
    mutationFn: async () => {
      const { data } = await apiClient.patch(`/api/events/${eventId}/complete`);
      return EventDetailsSchema.parse(data);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['events', eventId], updated);
      queryClient.invalidateQueries({ queryKey: ['me', 'events'] });
    },
  });
}

/** POST /api/events/:id/broadcast - Send broadcast message */
export function useBroadcast(eventId: string) {
  return useMutation<BroadcastResponse, unknown, BroadcastInput>({
    mutationFn: async (input) => {
      const { data } = await apiClient.post(`/api/events/${eventId}/broadcast`, input);
      return BroadcastResponseSchema.parse(data);
    },
  });
}

/** POST /api/events/:id/duplicate - Duplicate a completed event */
export function useDuplicateEvent(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation<EventDetails, unknown, DuplicateEventInput>({
    mutationFn: async (input) => {
      const { data } = await apiClient.post(`/api/events/${eventId}/duplicate`, input);
      return EventDetailsSchema.parse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me', 'events'] });
    },
  });
}
