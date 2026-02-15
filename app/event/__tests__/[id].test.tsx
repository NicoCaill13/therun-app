import { render, screen } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import EventDetailScreen from '../[id]';

jest.mock('@/lib/api/events', () => ({ useEvent: jest.fn() }));
jest.mock('@/lib/hooks/platform', () => ({ useClipboard: () => ({ copy: jest.fn() }) }));

jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useLocalSearchParams: () => ({ id: 'event-123' }),
}));

import { useEvent } from '@/lib/api/events';

const mockedUseEvent = useEvent as jest.MockedFunction<typeof useEvent>;

const createWrapper = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
};

const mockEventDetails = {
  event: {
    id: 'event-123',
    title: 'Run du jeudi soir',
    description: 'Sortie tranquille',
    startDateTime: '2025-12-15T19:00:00.000Z',
    locationName: 'Parc Borely',
    locationAddress: null,
    locationLat: null,
    locationLng: null,
    status: 'SCHEDULED',
    eventCode: 'ABC123',
    completedAt: null,
    goingCountAtCompletion: null,
  },
  organiser: {
    id: 'user-1',
    displayName: 'John Doe',
    avatarUrl: null,
  },
  participants: [
    {
      userId: 'user-2',
      displayName: 'Jane Smith',
      eventRouteId: null,
      eventGroupId: null,
      roleInEvent: 'PARTICIPANT',
      status: 'GOING',
    },
    {
      userId: 'user-3',
      displayName: 'Bob Wilson',
      eventRouteId: null,
      eventGroupId: null,
      roleInEvent: 'PARTICIPANT',
      status: 'GOING',
    },
  ],
  currentUserParticipation: null,
};

describe('EventDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseEvent.mockReturnValue({
      data: mockEventDetails,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    } as any);
  });

  it('should render without crashing', () => {
    render(<EventDetailScreen />, { wrapper: createWrapper() });
    expect(screen.getByText('Event Details')).toBeTruthy();
  });

  it('should display event title', () => {
    render(<EventDetailScreen />, { wrapper: createWrapper() });
    expect(screen.getByText('Run du jeudi soir')).toBeTruthy();
  });

  it('should display organiser name', () => {
    render(<EventDetailScreen />, { wrapper: createWrapper() });
    expect(screen.getByText('John Doe')).toBeTruthy();
  });

  it('should display invite code', () => {
    render(<EventDetailScreen />, { wrapper: createWrapper() });
    expect(screen.getByText('INVITE CODE')).toBeTruthy();
    expect(screen.getByText('ABC123')).toBeTruthy();
  });

  it('should display Copy button', () => {
    render(<EventDetailScreen />, { wrapper: createWrapper() });
    expect(screen.getByText('Copy')).toBeTruthy();
  });

  it('should display participants count', () => {
    render(<EventDetailScreen />, { wrapper: createWrapper() });
    expect(screen.getByText(/View 2 participants/)).toBeTruthy();
  });

  it('should display Show QR and Copy Link buttons', () => {
    render(<EventDetailScreen />, { wrapper: createWrapper() });
    expect(screen.getByText('Show QR')).toBeTruthy();
    expect(screen.getByText('Copy Link')).toBeTruthy();
  });

  it('should show loading state when loading', () => {
    mockedUseEvent.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    render(<EventDetailScreen />, { wrapper: createWrapper() });

    expect(screen.getByText('Event Details')).toBeTruthy();
  });

  it('should return null when no data and not loading', () => {
    mockedUseEvent.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    const { queryByText } = render(<EventDetailScreen />, { wrapper: createWrapper() });

    expect(queryByText('Run du jeudi soir')).toBeNull();
  });
});
