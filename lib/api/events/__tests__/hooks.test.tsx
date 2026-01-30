import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { AxiosError } from 'axios';
import { useMyEvents, useEventDetails, useCreateEvent, eventKeys } from '../hooks';
import { apiClient } from '@/lib/api/client';

/** Create an AxiosError so normalizeApiError returns the correct kind. */
function createAxiosError(status: number, data: Record<string, unknown> = {}) {
  return new AxiosError(
    'Request failed',
    'ERR_BAD_RESPONSE',
    undefined,
    undefined,
    { status, data, statusText: String(status), headers: {}, config: {} as any }
  );
}

// Mock API client
jest.mock('@/lib/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

// Mock UpsellModalProvider
jest.mock('@/components/providers', () => ({
  useUpsellModal: () => ({
    showUpsell: jest.fn(),
  }),
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

// Test wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe('Event Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('eventKeys', () => {
    it('should generate correct query keys', () => {
      expect(eventKeys.all).toEqual(['events']);
      expect(eventKeys.lists()).toEqual(['events', 'list']);
      expect(eventKeys.detail('123')).toEqual(['events', 'detail', '123']);
      expect(eventKeys.mine({ scope: 'future' })).toEqual([
        'me',
        'events',
        { scope: 'future' },
      ]);
    });
  });

  describe('useMyEvents', () => {
    const mockResponse = {
      data: {
        items: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            title: 'Run du jeudi',
            startDateTime: '2025-12-15T19:00:00.000Z',
            status: 'SCHEDULED',
            locationName: null,
            locationAddress: null,
            goingCount: 5,
          },
        ],
        page: 1,
        pageSize: 20,
        total: 1,
      },
    };

    it('should fetch events successfully', async () => {
      mockedApiClient.get.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(
        () => useMyEvents({ scope: 'future' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.items).toHaveLength(1);
      expect(result.current.data?.items[0].title).toBe('Run du jeudi');
      expect(mockedApiClient.get).toHaveBeenCalledWith('/me/events', {
        params: { scope: 'future', page: 1, pageSize: 20 },
      });
    });

    it('should not fetch when disabled', async () => {
      const { result } = renderHook(
        () => useMyEvents({ scope: 'future' }, { enabled: false }),
        { wrapper: createWrapper() }
      );

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isFetching).toBe(false);
      expect(mockedApiClient.get).not.toHaveBeenCalled();
    });

    it('should handle API errors', async () => {
      mockedApiClient.get.mockRejectedValueOnce({
        response: { status: 500, data: { message: 'Server Error' } },
      });

      const { result } = renderHook(
        () => useMyEvents({ scope: 'future' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });

    it('should pass pagination params', async () => {
      mockedApiClient.get.mockResolvedValueOnce({
        data: { items: [], page: 2, pageSize: 10, total: 0 },
      });

      renderHook(
        () => useMyEvents({ scope: 'past', page: 2, pageSize: 10 }),
        { wrapper: createWrapper() }
      );

      await waitFor(() =>
        expect(mockedApiClient.get).toHaveBeenCalledWith('/me/events', {
          params: { scope: 'past', page: 2, pageSize: 10 },
        })
      );
    });
  });

  describe('useEventDetails', () => {
    const mockEventDetails = {
      data: {
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
          email: 'john@example.com',
        },
        participants: [],
        currentUserParticipation: null,
      },
    };

    it('should fetch event details successfully', async () => {
      mockedApiClient.get.mockResolvedValueOnce(mockEventDetails);

      const { result } = renderHook(
        () => useEventDetails('550e8400-e29b-41d4-a716-446655440000'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.event.title).toBe('Run du jeudi');
      expect(result.current.data?.organiser.displayName).toBe('John Doe');
      expect(mockedApiClient.get).toHaveBeenCalledWith(
        '/events/550e8400-e29b-41d4-a716-446655440000'
      );
    });

    it('should not fetch when eventId is empty', async () => {
      const { result } = renderHook(() => useEventDetails(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
      expect(mockedApiClient.get).not.toHaveBeenCalled();
    });

    it('should not fetch when disabled', async () => {
      const { result } = renderHook(
        () => useEventDetails('123', { enabled: false }),
        { wrapper: createWrapper() }
      );

      expect(result.current.isLoading).toBe(false);
      expect(mockedApiClient.get).not.toHaveBeenCalled();
    });

    it('should handle 404 error', async () => {
      mockedApiClient.get.mockRejectedValueOnce(
        createAxiosError(404, { message: 'Event not found' })
      );

      const { result } = renderHook(
        () => useEventDetails('non-existent-id'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.kind).toBe('NOT_FOUND');
    });
  });

  describe('useCreateEvent', () => {
    const mockCreatedEvent = {
      data: {
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
          email: 'john@example.com',
        },
        participants: [],
        currentUserParticipation: null,
      },
    };

    it('should create event successfully', async () => {
      mockedApiClient.post.mockResolvedValueOnce(mockCreatedEvent);

      const { result } = renderHook(() => useCreateEvent(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync({
        title: 'Nouvelle sortie',
        startDateTime: '2025-12-15T19:00:00.000Z',
      });

      expect(mockedApiClient.post).toHaveBeenCalledWith('/events', {
        title: 'Nouvelle sortie',
        startDateTime: '2025-12-15T19:00:00.000Z',
      });
    });

    it('should handle validation errors', async () => {
      mockedApiClient.post.mockRejectedValueOnce(
        createAxiosError(400, {
          message: 'Validation failed',
          errors: ['title is required'],
        })
      );

      const { result } = renderHook(() => useCreateEvent(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.mutateAsync({
          title: '',
          startDateTime: '2025-12-15T19:00:00.000Z',
        })
      ).rejects.toMatchObject({ kind: 'VALIDATION' });
    });

    it('should handle plan limit error (403)', async () => {
      mockedApiClient.post.mockRejectedValueOnce(
        createAxiosError(403, { message: 'plan limit reached', code: 'PLAN_LIMIT' })
      );

      const { result } = renderHook(() => useCreateEvent(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.mutateAsync({
          title: 'Nouvelle sortie',
          startDateTime: '2025-12-15T19:00:00.000Z',
        })
      ).rejects.toMatchObject({ kind: 'PLAN_LIMIT' });
    });
  });
});
