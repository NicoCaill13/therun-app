import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { apiClient } from '@/lib/api/client';
import { useParticipants } from '../hooks';

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

describe('Participants Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useParticipants', () => {
    it('should fetch participants list', async () => {
      mockedApiClient.get.mockResolvedValueOnce({ data: mockParticipantsList });

      const { result } = renderHook(() => useParticipants('evt_123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/events/evt_123/participants', {
        params: undefined,
      });
      expect(result.current.data?.items).toHaveLength(1);
      expect(result.current.data?.items[0].displayName).toBe('John Doe');
    });

    it('should pass filters to API', async () => {
      mockedApiClient.get.mockResolvedValueOnce({ data: mockParticipantsList });

      const { result } = renderHook(
        () => useParticipants('evt_123', { status: 'GOING', page: 2, pageSize: 10 }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/events/evt_123/participants', {
        params: { status: 'GOING', page: 2, pageSize: 10 },
      });
    });

    it('should not fetch when eventId is undefined', () => {
      renderHook(() => useParticipants(undefined), {
        wrapper: createWrapper(),
      });

      expect(mockedApiClient.get).not.toHaveBeenCalled();
    });

    it('should not fetch when eventId is empty', () => {
      renderHook(() => useParticipants(''), {
        wrapper: createWrapper(),
      });

      expect(mockedApiClient.get).not.toHaveBeenCalled();
    });

    it('should handle API errors', async () => {
      mockedApiClient.get.mockRejectedValueOnce(new Error('Event not found'));

      const { result } = renderHook(() => useParticipants('evt_invalid'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });
  });
});
