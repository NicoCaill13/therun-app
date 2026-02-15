import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { apiClient } from '@/lib/api/client';
import { useResolveEventCode, useParticipate } from '../hooks';

jest.mock('@/lib/api/client', () => ({
  apiClient: { get: jest.fn(), post: jest.fn() },
}));

const createWrapper = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
};

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('Join Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useResolveEventCode', () => {
    const mockEventSummary = {
      eventId: 'evt_123',
      title: 'Morning Run',
      startDateTime: '2025-02-01T08:00:00.000Z',
      locationName: 'Central Park',
      locationLat: 40.785091,
      locationLng: -73.968285,
      organiserId: 'usr_456',
      organiserFirstName: 'John',
      organiserLastName: 'Doe',
    };

    it('should fetch event summary by code', async () => {
      mockedApiClient.get.mockResolvedValueOnce({ data: mockEventSummary });

      const { result } = renderHook(() => useResolveEventCode('ABC123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/join/ABC123');
      expect(result.current.data?.eventId).toBe('evt_123');
      expect(result.current.data?.title).toBe('Morning Run');
    });

    it('should not fetch when code is empty', () => {
      renderHook(() => useResolveEventCode(''), {
        wrapper: createWrapper(),
      });

      expect(mockedApiClient.get).not.toHaveBeenCalled();
    });

    it('should not fetch when code is too short (< 4 chars)', () => {
      renderHook(() => useResolveEventCode('AB'), {
        wrapper: createWrapper(),
      });

      expect(mockedApiClient.get).not.toHaveBeenCalled();
    });

    it('should fetch when code is exactly 4 chars', async () => {
      mockedApiClient.get.mockResolvedValueOnce({ data: mockEventSummary });

      const { result } = renderHook(() => useResolveEventCode('ABCD'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/join/ABCD');
    });

    it('should handle errors', async () => {
      mockedApiClient.get.mockRejectedValueOnce(new Error('Event not found'));

      const { result } = renderHook(() => useResolveEventCode('INVALID'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useParticipate', () => {
    const mockParticipateResponse = {
      participantId: 'part_123',
      eventId: 'evt_456',
      userId: 'usr_789',
      role: 'PARTICIPANT',
      status: 'GOING',
    };

    it('should join event as authenticated user', async () => {
      mockedApiClient.post.mockResolvedValueOnce({ data: mockParticipateResponse });

      const { result } = renderHook(() => useParticipate('ABC123'), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync();

      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/join/ABC123/participate');

      await waitFor(() => {
        expect(result.current.data?.participantId).toBe('part_123');
        expect(result.current.data?.status).toBe('GOING');
      });
    });

    it('should handle join errors', async () => {
      mockedApiClient.post.mockRejectedValueOnce(new Error('Already joined'));

      const { result } = renderHook(() => useParticipate('ABC123'), {
        wrapper: createWrapper(),
      });

      try {
        await result.current.mutateAsync();
      } catch {
        // Expected to fail
      }

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });
});
