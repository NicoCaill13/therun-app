import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { UpsellModalProvider } from '@/components/providers/UpsellModalProvider';
import { apiClient } from '../../client';
import {
  useJoinResolve,
  usePublicEventByCode,
  useJoinParticipate,
  useGuestJoin,
  joinKeys,
} from '../hooks';

// Mock the API client
jest.mock('../../client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

// Query client wrapper with UpsellModalProvider
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <UpsellModalProvider>
          {children}
        </UpsellModalProvider>
      </QueryClientProvider>
    );
  };
}

describe('joinKeys', () => {
  it('should generate correct query keys', () => {
    expect(joinKeys.all).toEqual(['join']);
    expect(joinKeys.resolve('ABC123')).toEqual(['join', 'resolve', 'ABC123']);
    expect(joinKeys.publicByCode('XYZ789')).toEqual(['join', 'public', 'XYZ789']);
  });
});

describe('useJoinResolve', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

    const { result } = renderHook(
      () => useJoinResolve('ABC123'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedApiClient.get).toHaveBeenCalledWith('/join/ABC123');
    expect(result.current.data?.eventId).toBe('evt_123');
    expect(result.current.data?.title).toBe('Morning Run');
  });

  it('should not fetch when eventCode is empty', () => {
    renderHook(
      () => useJoinResolve(''),
      { wrapper: createWrapper() }
    );

    expect(mockedApiClient.get).not.toHaveBeenCalled();
  });

  it('should handle errors', async () => {
    const error = new Error('Event not found');
    mockedApiClient.get.mockRejectedValueOnce(error);

    const { result } = renderHook(
      () => useJoinResolve('INVALID'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('usePublicEventByCode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockPublicEvent = {
    id: 'evt_123',
    eventCode: 'ABC123',
    title: 'Evening Run',
    startDateTime: '2025-02-01T18:00:00.000Z',
    status: 'SCHEDULED',
    locationName: 'Beach',
    locationAddress: '123 Beach St',
    organiser: {
      firstName: 'Jane',
      lastName: 'Smith',
    },
    join: {
      eventCode: 'ABC123',
      eventId: 'evt_123',
    },
  };

  it('should fetch public event by code', async () => {
    mockedApiClient.get.mockResolvedValueOnce({ data: mockPublicEvent });

    const { result } = renderHook(
      () => usePublicEventByCode('ABC123'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedApiClient.get).toHaveBeenCalledWith('/public/events/by-code/ABC123');
    expect(result.current.data?.id).toBe('evt_123');
    expect(result.current.data?.organiser.firstName).toBe('Jane');
  });

  it('should not fetch when eventCode is empty', () => {
    renderHook(
      () => usePublicEventByCode(''),
      { wrapper: createWrapper() }
    );

    expect(mockedApiClient.get).not.toHaveBeenCalled();
  });
});

describe('useJoinParticipate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockParticipateResponse = {
    participantId: 'part_123',
    eventId: 'evt_456',
    userId: 'usr_789',
    role: 'PARTICIPANT',
    status: 'GOING',
  };

  it('should join event as authenticated user', async () => {
    mockedApiClient.post.mockResolvedValueOnce({ data: mockParticipateResponse });

    const { result } = renderHook(
      () => useJoinParticipate(),
      { wrapper: createWrapper() }
    );

    await result.current.mutateAsync('ABC123');

    expect(mockedApiClient.post).toHaveBeenCalledWith('/join/ABC123/participate');

    await waitFor(() => {
      expect(result.current.data?.participantId).toBe('part_123');
      expect(result.current.data?.status).toBe('GOING');
    });
  });

  it('should handle join errors', async () => {
    const error = new Error('Already joined');
    mockedApiClient.post.mockRejectedValueOnce(error);

    const { result } = renderHook(
      () => useJoinParticipate(),
      { wrapper: createWrapper() }
    );

    try {
      await result.current.mutateAsync('ABC123');
    } catch {
      // Expected to fail
    }

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useGuestJoin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockGuestJoinResponse = {
    eventId: 'evt_123',
    participantId: 'part_456',
    userId: 'usr_guest_789',
    isGuest: true,
    accessToken: 'guest-jwt-token',
  };

  it('should join event as guest', async () => {
    mockedApiClient.post.mockResolvedValueOnce({ data: mockGuestJoinResponse });

    const { result } = renderHook(
      () => useGuestJoin(),
      { wrapper: createWrapper() }
    );

    await result.current.mutateAsync({
      eventId: 'evt_123',
      input: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      },
    });

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      '/public/events/evt_123/guest-join',
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      }
    );

    await waitFor(() => {
      expect(result.current.data?.isGuest).toBe(true);
      expect(result.current.data?.participantId).toBe('part_456');
    });
  });

  it('should join with minimal data', async () => {
    mockedApiClient.post.mockResolvedValueOnce({ data: mockGuestJoinResponse });

    const { result } = renderHook(
      () => useGuestJoin(),
      { wrapper: createWrapper() }
    );

    await result.current.mutateAsync({
      eventId: 'evt_123',
      input: { firstName: 'Jane' },
    });

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      '/public/events/evt_123/guest-join',
      { firstName: 'Jane' }
    );
  });

  it('should handle guest join errors', async () => {
    const error = new Error('Event not joinable');
    mockedApiClient.post.mockRejectedValueOnce(error);

    const { result } = renderHook(
      () => useGuestJoin(),
      { wrapper: createWrapper() }
    );

    try {
      await result.current.mutateAsync({
        eventId: 'evt_123',
        input: { firstName: 'John' },
      });
    } catch {
      // Expected to fail
    }

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
