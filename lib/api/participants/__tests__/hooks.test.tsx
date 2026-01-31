import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UpsellModalProvider } from '@/components/providers/UpsellModalProvider';
import { apiClient } from '@/lib/api/client';
import {
  useParticipantsList,
  useParticipantsSummary,
  useUpsertParticipation,
  useUpdateSelection,
} from '../hooks';

// Mock API client
jest.mock('@/lib/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  },
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

// Test data
const mockParticipantsList = {
  items: [
    {
      participantId: '550e8400-e29b-41d4-a716-446655440000',
      userId: '550e8400-e29b-41d4-a716-446655440001',
      displayName: 'John Doe',
      roleInEvent: 'ORGANISER',
      status: 'GOING',
      eventRoute: null,
      eventGroup: { id: '550e8400-e29b-41d4-a716-446655440002', label: '5:00/km' },
    },
  ],
  page: 1,
  pageSize: 20,
  totalCount: 1,
  totalPages: 1,
};

const mockSummary = {
  goingCount: 10,
  invitedCount: 5,
  maybeCount: 3,
  byRoute: [],
  byGroup: [
    { eventGroupId: '550e8400-e29b-41d4-a716-446655440002', label: '5:00/km', goingCount: 4 },
  ],
};

const mockParticipantResponse = {
  userId: '550e8400-e29b-41d4-a716-446655440001',
  displayName: 'John Doe',
  eventRouteId: null,
  eventGroupId: '550e8400-e29b-41d4-a716-446655440002',
  roleInEvent: 'PARTICIPANT',
  status: 'GOING',
};

// Wrapper component
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <UpsellModalProvider>
          {children}
        </UpsellModalProvider>
      </QueryClientProvider>
    );
  };
}

describe('Participants Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useParticipantsList', () => {
    it('should fetch participants list', async () => {
      mockedApiClient.get.mockResolvedValueOnce({ data: mockParticipantsList });

      const { result } = renderHook(
        () => useParticipantsList({ eventId: 'evt_123' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        '/events/evt_123/participants',
        expect.objectContaining({
          params: expect.objectContaining({
            page: 1,
            pageSize: 20,
          }),
        })
      );
      expect(result.current.data?.items).toHaveLength(1);
      expect(result.current.data?.items[0].displayName).toBe('John Doe');
    });

    it('should pass status filter to API', async () => {
      mockedApiClient.get.mockResolvedValueOnce({ data: mockParticipantsList });

      const { result } = renderHook(
        () => useParticipantsList({ eventId: 'evt_123', status: 'GOING' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        '/events/evt_123/participants',
        expect.objectContaining({
          params: expect.objectContaining({
            status: 'GOING',
          }),
        })
      );
    });

    it('should not fetch when disabled', () => {
      renderHook(
        () => useParticipantsList({ eventId: 'evt_123' }, { enabled: false }),
        { wrapper: createWrapper() }
      );

      expect(mockedApiClient.get).not.toHaveBeenCalled();
    });
  });

  describe('useParticipantsSummary', () => {
    it('should fetch participants summary', async () => {
      mockedApiClient.get.mockResolvedValueOnce({ data: mockSummary });

      const { result } = renderHook(
        () => useParticipantsSummary('evt_123'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockedApiClient.get).toHaveBeenCalledWith('/events/evt_123/participants/summary');
      expect(result.current.data?.goingCount).toBe(10);
      expect(result.current.data?.byGroup).toHaveLength(1);
    });
  });

  describe('useUpsertParticipation', () => {
    it('should upsert participation with GOING status', async () => {
      mockedApiClient.post.mockResolvedValueOnce({ data: mockParticipantResponse });

      const { result } = renderHook(
        () => useUpsertParticipation(),
        { wrapper: createWrapper() }
      );

      await result.current.mutateAsync({
        eventId: 'evt_123',
        input: { status: 'GOING' },
      });

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/events/evt_123/participants/me',
        { status: 'GOING' }
      );

      await waitFor(() => {
        expect(result.current.data?.status).toBe('GOING');
      });
    });

    it('should handle error during participation update', async () => {
      const errorMessage = 'Event not found';
      mockedApiClient.post.mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(
        () => useUpsertParticipation(),
        { wrapper: createWrapper() }
      );

      let didThrow = false;
      try {
        await result.current.mutateAsync({
          eventId: 'evt_invalid',
          input: { status: 'GOING' },
        });
      } catch {
        didThrow = true;
      }

      expect(didThrow).toBe(true);
    });
  });

  describe('useUpdateSelection', () => {
    it('should update selection with group ID', async () => {
      mockedApiClient.patch.mockResolvedValueOnce({ data: mockParticipantResponse });

      const { result } = renderHook(
        () => useUpdateSelection(),
        { wrapper: createWrapper() }
      );

      await result.current.mutateAsync({
        eventId: 'evt_123',
        input: { eventGroupId: '550e8400-e29b-41d4-a716-446655440002' },
      });

      expect(mockedApiClient.patch).toHaveBeenCalledWith(
        '/events/evt_123/participants/me',
        { eventGroupId: '550e8400-e29b-41d4-a716-446655440002' }
      );

      await waitFor(() => {
        expect(result.current.data?.eventGroupId).toBe('550e8400-e29b-41d4-a716-446655440002');
      });
    });

    it('should clear selection with null', async () => {
      const clearedResponse = { ...mockParticipantResponse, eventGroupId: null };
      mockedApiClient.patch.mockResolvedValueOnce({ data: clearedResponse });

      const { result } = renderHook(
        () => useUpdateSelection(),
        { wrapper: createWrapper() }
      );

      await result.current.mutateAsync({
        eventId: 'evt_123',
        input: { eventGroupId: null },
      });

      expect(mockedApiClient.patch).toHaveBeenCalledWith(
        '/events/evt_123/participants/me',
        { eventGroupId: null }
      );

      await waitFor(() => {
        expect(result.current.data?.eventGroupId).toBeNull();
      });
    });
  });
});
