import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useEvent, useCreateEvent } from '../hooks';
import { apiClient } from '@/lib/api/client';

jest.mock('@/lib/api/client', () => ({
  apiClient: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
}));

const createWrapper = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
};

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('Event Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useEvent', () => {
    const mockEventDetails = {
      event: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Run du jeudi',
        description: null,
        startDateTime: '2025-12-15T19:00:00.000Z',
        locationName: null,
        locationAddress: null,
        locationLat: null,
        locationLng: null,
        status: 'SCHEDULED',
        eventCode: 'ABC123',
        completedAt: null,
        goingCountAtCompletion: null,
      },
      organiser: {
        id: '550e8400-e29b-41d4-a716-446655440001',
        displayName: 'John Doe',
        avatarUrl: null,
      },
      participants: [],
      currentUserParticipation: null,
    };

    it('should fetch event details successfully', async () => {
      mockedApiClient.get.mockResolvedValueOnce({ data: mockEventDetails });

      const { result } = renderHook(() => useEvent('550e8400-e29b-41d4-a716-446655440000'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.event.title).toBe('Run du jeudi');
      expect(result.current.data?.organiser.displayName).toBe('John Doe');
      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/events/550e8400-e29b-41d4-a716-446655440000');
    });

    it('should not fetch when eventId is undefined', () => {
      const { result } = renderHook(() => useEvent(undefined), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isFetching).toBe(false);
      expect(mockedApiClient.get).not.toHaveBeenCalled();
    });

    it('should not fetch when eventId is empty', () => {
      const { result } = renderHook(() => useEvent(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
      expect(mockedApiClient.get).not.toHaveBeenCalled();
    });

    it('should handle API errors', async () => {
      mockedApiClient.get.mockRejectedValueOnce(new Error('Not found'));

      const { result } = renderHook(() => useEvent('non-existent-id'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });
  });

  describe('useCreateEvent', () => {
    const mockCreatedEvent = {
      event: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Nouvelle sortie',
        description: null,
        startDateTime: '2025-12-15T19:00:00.000Z',
        locationName: null,
        locationAddress: null,
        locationLat: null,
        locationLng: null,
        status: 'SCHEDULED',
        eventCode: 'XYZ789',
        completedAt: null,
        goingCountAtCompletion: null,
      },
      organiser: {
        id: '550e8400-e29b-41d4-a716-446655440001',
        displayName: 'John Doe',
        avatarUrl: null,
      },
      participants: [],
      currentUserParticipation: null,
    };

    it('should create event successfully', async () => {
      mockedApiClient.post.mockResolvedValueOnce({ data: mockCreatedEvent });

      const { result } = renderHook(() => useCreateEvent(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync({
        title: 'Nouvelle sortie',
        startDateTime: '2025-12-15T19:00:00.000Z',
      });

      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/events', {
        title: 'Nouvelle sortie',
        startDateTime: '2025-12-15T19:00:00.000Z',
      });
    });

    it('should return created event data', async () => {
      mockedApiClient.post.mockResolvedValueOnce({ data: mockCreatedEvent });

      const { result } = renderHook(() => useCreateEvent(), {
        wrapper: createWrapper(),
      });

      const response = await result.current.mutateAsync({
        title: 'Nouvelle sortie',
        startDateTime: '2025-12-15T19:00:00.000Z',
      });

      expect(response.event.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(response.event.title).toBe('Nouvelle sortie');
      expect(response.event.eventCode).toBe('XYZ789');
    });

    it('should handle API errors', async () => {
      mockedApiClient.post.mockRejectedValueOnce(new Error('Validation failed'));

      const { result } = renderHook(() => useCreateEvent(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.mutateAsync({
          title: '',
          startDateTime: '2025-12-15T19:00:00.000Z',
        })
      ).rejects.toThrow();
    });
  });
});
