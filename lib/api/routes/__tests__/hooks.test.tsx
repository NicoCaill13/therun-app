import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { useEventRoutes } from '../hooks';

// Mock API client
jest.mock('@/lib/api/client', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

// Test data
const mockEventRoutes = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    eventId: '550e8400-e29b-41d4-a716-446655440001',
    routeId: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Parcours 10K',
    distanceMeters: 10000,
    type: 'LOOP',
    encodedPolyline: '_p~iF~ps|U_ulLnnqC_mqNvxq`@',
    createdAt: '2025-01-15T10:00:00.000Z',
    updatedAt: '2025-01-15T10:00:00.000Z',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    eventId: '550e8400-e29b-41d4-a716-446655440001',
    routeId: null,
    name: 'Parcours 5K',
    distanceMeters: 5000,
    type: 'OUT_AND_BACK',
    encodedPolyline: '_p~iF~ps|U',
    createdAt: '2025-01-15T10:00:00.000Z',
    updatedAt: '2025-01-15T10:00:00.000Z',
  },
];

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
        {children}
      </QueryClientProvider>
    );
  };
}

describe('Routes Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useEventRoutes', () => {
    it('should fetch event routes', async () => {
      mockedApiClient.get.mockResolvedValueOnce({ data: mockEventRoutes });

      const { result } = renderHook(
        () => useEventRoutes('evt_123'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/events/evt_123/routes');
      expect(result.current.data).toHaveLength(2);
      expect(result.current.data?.[0].name).toBe('Parcours 10K');
      expect(result.current.data?.[1].name).toBe('Parcours 5K');
    });

    it('should return empty array when no routes', async () => {
      mockedApiClient.get.mockResolvedValueOnce({ data: [] });

      const { result } = renderHook(
        () => useEventRoutes('evt_123'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveLength(0);
    });

    it('should not fetch when disabled', () => {
      renderHook(
        () => useEventRoutes('evt_123', { enabled: false }),
        { wrapper: createWrapper() }
      );

      expect(mockedApiClient.get).not.toHaveBeenCalled();
    });

    it('should not fetch when eventId is empty', () => {
      renderHook(
        () => useEventRoutes(''),
        { wrapper: createWrapper() }
      );

      expect(mockedApiClient.get).not.toHaveBeenCalled();
    });

    it('should handle API error', async () => {
      const errorMessage = 'Event not found';
      mockedApiClient.get.mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(
        () => useEventRoutes('evt_invalid'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });

    it('should include encoded polyline in response', async () => {
      mockedApiClient.get.mockResolvedValueOnce({ data: mockEventRoutes });

      const { result } = renderHook(
        () => useEventRoutes('evt_123'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Verify polyline data is present
      expect(result.current.data?.[0].encodedPolyline).toBe('_p~iF~ps|U_ulLnnqC_mqNvxq`@');
      expect(result.current.data?.[0].distanceMeters).toBe(10000);
    });
  });
});
