import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { AxiosError } from 'axios';
import {
  useMyEvents,
  useEventDetails,
  useCreateEvent,
  useCompleteEvent,
  useMyEventsInfinite,
  flattenInfiniteEvents,
  eventKeys,
} from '../hooks';
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
    patch: jest.fn(),
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

  // ==========================================================================
  // Phase 4.1 - useCompleteEvent
  // ==========================================================================

  describe('useCompleteEvent', () => {
    const mockCompletedEvent = {
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
          status: 'COMPLETED',
          eventCode: 'ABC123',
          completedAt: '2025-12-15T21:00:00.000Z',
          goingCountAtCompletion: 8,
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

    it('should complete event successfully', async () => {
      mockedApiClient.patch.mockResolvedValueOnce(mockCompletedEvent);

      const { result } = renderHook(() => useCompleteEvent(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync({
        eventId: '550e8400-e29b-41d4-a716-446655440000',
      });

      expect(mockedApiClient.patch).toHaveBeenCalledWith(
        '/events/550e8400-e29b-41d4-a716-446655440000/complete'
      );
    });

    it('should return COMPLETED status after mutation', async () => {
      mockedApiClient.patch.mockResolvedValueOnce(mockCompletedEvent);

      const { result } = renderHook(() => useCompleteEvent(), {
        wrapper: createWrapper(),
      });

      const response = await result.current.mutateAsync({
        eventId: '550e8400-e29b-41d4-a716-446655440000',
      });

      expect(response.event.status).toBe('COMPLETED');
      expect(response.event.completedAt).toBe('2025-12-15T21:00:00.000Z');
      expect(response.event.goingCountAtCompletion).toBe(8);
    });

    it('should handle 403 forbidden (not organiser)', async () => {
      mockedApiClient.patch.mockRejectedValueOnce(
        createAxiosError(403, { message: 'Only organiser can complete this event' })
      );

      const { result } = renderHook(() => useCompleteEvent(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.mutateAsync({ eventId: '550e8400-e29b-41d4-a716-446655440000' })
      ).rejects.toMatchObject({ kind: 'FORBIDDEN' });
    });

    it('should handle 400 bad request (invalid state transition)', async () => {
      mockedApiClient.patch.mockRejectedValueOnce(
        createAxiosError(400, { message: 'Invalid state transition' })
      );

      const { result } = renderHook(() => useCompleteEvent(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.mutateAsync({ eventId: '550e8400-e29b-41d4-a716-446655440000' })
      ).rejects.toMatchObject({ kind: 'VALIDATION' });
    });
  });

  // ==========================================================================
  // Phase 4.2 - useMyEventsInfinite
  // ==========================================================================

  describe('useMyEventsInfinite', () => {
    const mockPage1 = {
      data: {
        items: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            title: 'Run 1',
            startDateTime: '2025-12-15T19:00:00.000Z',
            status: 'SCHEDULED',
            locationName: null,
            locationAddress: null,
            goingCount: 5,
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440001',
            title: 'Run 2',
            startDateTime: '2025-12-16T19:00:00.000Z',
            status: 'SCHEDULED',
            locationName: null,
            locationAddress: null,
            goingCount: 3,
          },
        ],
        page: 1,
        pageSize: 2,
        total: 4,
      },
    };

    const mockPage2 = {
      data: {
        items: [
          {
            id: '550e8400-e29b-41d4-a716-446655440002',
            title: 'Run 3',
            startDateTime: '2025-12-17T19:00:00.000Z',
            status: 'SCHEDULED',
            locationName: null,
            locationAddress: null,
            goingCount: 2,
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440003',
            title: 'Run 4',
            startDateTime: '2025-12-18T19:00:00.000Z',
            status: 'SCHEDULED',
            locationName: null,
            locationAddress: null,
            goingCount: 1,
          },
        ],
        page: 2,
        pageSize: 2,
        total: 4,
      },
    };

    it('should fetch first page successfully', async () => {
      mockedApiClient.get.mockResolvedValueOnce(mockPage1);

      const { result } = renderHook(() => useMyEventsInfinite('future'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.pages).toHaveLength(1);
      expect(result.current.data?.pages[0].items).toHaveLength(2);
      expect(result.current.hasNextPage).toBe(true);
    });

    it('should indicate hasNextPage correctly', async () => {
      mockedApiClient.get.mockResolvedValueOnce(mockPage1);

      const { result } = renderHook(() => useMyEventsInfinite('future', { pageSize: 2 }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Total 4 items, page 1 with pageSize 2 -> hasNextPage = true
      expect(result.current.hasNextPage).toBe(true);
    });

    it('should fetch next page', async () => {
      mockedApiClient.get
        .mockResolvedValueOnce(mockPage1)
        .mockResolvedValueOnce(mockPage2);

      const { result } = renderHook(() => useMyEventsInfinite('future', { pageSize: 2 }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Fetch next page
      result.current.fetchNextPage();

      await waitFor(() => expect(result.current.data?.pages).toHaveLength(2));

      expect(result.current.data?.pages[1].items[0].title).toBe('Run 3');
      expect(result.current.hasNextPage).toBe(false); // All items loaded
    });

    it('should not fetch when disabled', async () => {
      const { result } = renderHook(
        () => useMyEventsInfinite('future', { enabled: false }),
        { wrapper: createWrapper() }
      );

      expect(result.current.isLoading).toBe(false);
      expect(mockedApiClient.get).not.toHaveBeenCalled();
    });

    it('should handle different scopes', async () => {
      const pastEvents = {
        data: {
          items: [{
            id: '550e8400-e29b-41d4-a716-446655440004',
            title: 'Past Run',
            startDateTime: '2025-01-01T19:00:00.000Z',
            status: 'COMPLETED',
            locationName: null,
            locationAddress: null,
            goingCount: 10,
          }],
          page: 1,
          pageSize: 10,
          total: 1,
        },
      };

      mockedApiClient.get.mockResolvedValueOnce(pastEvents);

      const { result } = renderHook(() => useMyEventsInfinite('past'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedApiClient.get).toHaveBeenCalledWith('/me/events', {
        params: { scope: 'past', page: 1, pageSize: 10 },
      });
    });
  });

  // ==========================================================================
  // Phase 4.2 - flattenInfiniteEvents helper
  // ==========================================================================

  describe('flattenInfiniteEvents', () => {
    it('should return empty array for undefined data', () => {
      expect(flattenInfiniteEvents(undefined)).toEqual([]);
    });

    it('should flatten single page', () => {
      const data = {
        pages: [{
          items: [
            { id: '1', title: 'Run 1', startDateTime: '2025-12-15T19:00:00.000Z', status: 'SCHEDULED' as const, locationName: null, locationAddress: null, goingCount: 5 },
            { id: '2', title: 'Run 2', startDateTime: '2025-12-16T19:00:00.000Z', status: 'SCHEDULED' as const, locationName: null, locationAddress: null, goingCount: 3 },
          ],
          page: 1,
          pageSize: 10,
          total: 2,
        }],
        pageParams: [{ page: 1 }],
      };

      const result = flattenInfiniteEvents(data);
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Run 1');
      expect(result[1].title).toBe('Run 2');
    });

    it('should flatten multiple pages', () => {
      const data = {
        pages: [
          {
            items: [
              { id: '1', title: 'Run 1', startDateTime: '2025-12-15T19:00:00.000Z', status: 'SCHEDULED' as const, locationName: null, locationAddress: null, goingCount: 5 },
            ],
            page: 1,
            pageSize: 1,
            total: 3,
          },
          {
            items: [
              { id: '2', title: 'Run 2', startDateTime: '2025-12-16T19:00:00.000Z', status: 'SCHEDULED' as const, locationName: null, locationAddress: null, goingCount: 3 },
            ],
            page: 2,
            pageSize: 1,
            total: 3,
          },
          {
            items: [
              { id: '3', title: 'Run 3', startDateTime: '2025-12-17T19:00:00.000Z', status: 'COMPLETED' as const, locationName: null, locationAddress: null, goingCount: 8 },
            ],
            page: 3,
            pageSize: 1,
            total: 3,
          },
        ],
        pageParams: [{ page: 1 }, { page: 2 }, { page: 3 }],
      };

      const result = flattenInfiniteEvents(data);
      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
      expect(result[2].id).toBe('3');
    });

    it('should handle empty pages', () => {
      const data = {
        pages: [{
          items: [],
          page: 1,
          pageSize: 10,
          total: 0,
        }],
        pageParams: [{ page: 1 }],
      };

      const result = flattenInfiniteEvents(data);
      expect(result).toHaveLength(0);
    });
  });
});
