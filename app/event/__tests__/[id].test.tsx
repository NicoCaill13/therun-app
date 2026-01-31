import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import EventDetailScreen from '../[id]';

// Mock hooks and navigation
const mockPush = jest.fn();
const mockBack = jest.fn();
const mockRefetch = jest.fn();
const mockShare = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
  useLocalSearchParams: () => ({ id: 'event-123' }),
  Stack: {
    Screen: ({ options }: any) => null,
  },
}));

jest.mock('react-native/Libraries/Share/Share', () => ({
  share: mockShare,
}));

// Mock new Phase 3 components to avoid dependency issues
jest.mock('@/components/event', () => ({
  PaceGroupSelector: () => null,
}));

jest.mock('@/components/map', () => ({
  EventMapPlaceholder: () => null,
  RouteInfoCard: () => null,
}));

jest.mock('@/lib/auth', () => ({
  useAuth: jest.fn(() => ({
    user: { id: 'user-1', displayName: 'John Doe' },
  })),
}));

jest.mock('@/lib/api', () => ({
  useEventDetails: jest.fn(),
  useUpsertParticipation: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
  })),
  useEventRoutes: jest.fn(() => ({
    data: undefined,
    isLoading: false,
    error: null,
  })),
}));

import { useAuth } from '@/lib/auth';
import { useEventDetails, useEventRoutes } from '@/lib/api';

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockedUseEventDetails = useEventDetails as jest.MockedFunction<typeof useEventDetails>;
const mockedUseEventRoutes = useEventRoutes as jest.MockedFunction<typeof useEventRoutes>;

// Test wrapper
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

// Mock event data
const mockEventDetails = {
  event: {
    id: 'event-123',
    title: 'Run du jeudi soir',
    description: 'Sortie tranquille pour tous niveaux',
    startDateTime: '2025-12-15T19:00:00.000Z',
    locationName: 'Parc Borely',
    locationAddress: 'Avenue du Prado, 13008 Marseille',
    locationLat: 43.262,
    locationLng: 5.376,
    status: 'SCHEDULED' as const,
    eventCode: 'ABC123',
    completedAt: null,
    goingCountAtCompletion: null,
  },
  organiser: {
    id: 'user-1',
    displayName: 'John Doe',
    email: 'john@example.com',
  },
  participants: [
    {
      id: 'participant-1',
      userId: 'user-2',
      displayName: 'Jane Smith',
      email: 'jane@example.com',
      status: 'GOING' as const,
      selectedPaceGroupId: null,
    },
    {
      id: 'participant-2',
      userId: 'user-3',
      displayName: 'Bob Wilson',
      email: 'bob@example.com',
      status: 'GOING' as const,
      selectedPaceGroupId: null,
    },
  ],
  currentUserParticipation: null,
};

describe('EventDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRefetch.mockClear();

    mockedUseAuth.mockReturnValue({
      user: { id: 'user-1', displayName: 'John Doe', email: 'john@example.com', isGuest: false },
    } as any);

    mockedUseEventDetails.mockReturnValue({
      data: mockEventDetails,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      isRefetching: false,
    } as any);

    mockedUseEventRoutes.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as any);
  });

  describe('Loading State', () => {
    it('should show loading indicator when loading', () => {
      mockedUseEventDetails.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
      } as any);

      render(<EventDetailScreen />, { wrapper: createWrapper() });

      expect(screen.getByText('Chargement...')).toBeTruthy();
    });
  });

  describe('Error State', () => {
    it('should show error message when fetch fails', () => {
      mockedUseEventDetails.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: { kind: 'NOT_FOUND', message: 'Event not found', status: 404 },
        refetch: mockRefetch,
        isRefetching: false,
      } as any);

      render(<EventDetailScreen />, { wrapper: createWrapper() });

      expect(screen.getByText('Event not found')).toBeTruthy();
      expect(screen.getByText('Reessayer')).toBeTruthy();
    });

    it('should call refetch when retry is pressed', () => {
      mockedUseEventDetails.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: { kind: 'UNKNOWN', message: 'Error', status: 500 },
        refetch: mockRefetch,
        isRefetching: false,
      } as any);

      render(<EventDetailScreen />, { wrapper: createWrapper() });

      fireEvent.press(screen.getByText('Reessayer'));

      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('Event Display', () => {
    it('should display event title', () => {
      render(<EventDetailScreen />, { wrapper: createWrapper() });

      expect(screen.getByText('Run du jeudi soir')).toBeTruthy();
    });

    it('should display organiser name', () => {
      render(<EventDetailScreen />, { wrapper: createWrapper() });

      expect(screen.getByText(/Organise par John Doe/)).toBeTruthy();
    });

    it('should display event date', () => {
      render(<EventDetailScreen />, { wrapper: createWrapper() });

      expect(screen.getByText('Date et heure')).toBeTruthy();
    });

    it('should display location when available', () => {
      render(<EventDetailScreen />, { wrapper: createWrapper() });

      expect(screen.getByText('Lieu')).toBeTruthy();
      expect(screen.getByText('Parc Borely')).toBeTruthy();
      expect(screen.getByText('Avenue du Prado, 13008 Marseille')).toBeTruthy();
    });

    it('should display description when available', () => {
      render(<EventDetailScreen />, { wrapper: createWrapper() });

      expect(screen.getByText('Description')).toBeTruthy();
      expect(screen.getByText('Sortie tranquille pour tous niveaux')).toBeTruthy();
    });

    it('should not display description section when empty', () => {
      const noDescEvent = {
        ...mockEventDetails,
        event: { ...mockEventDetails.event, description: null },
      };

      mockedUseEventDetails.mockReturnValue({
        data: noDescEvent,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
      } as any);

      render(<EventDetailScreen />, { wrapper: createWrapper() });

      expect(screen.queryByText('Description')).toBeNull();
    });
  });

  describe('Status Badge', () => {
    it('should display SCHEDULED status', () => {
      render(<EventDetailScreen />, { wrapper: createWrapper() });

      expect(screen.getByText('Planifie')).toBeTruthy();
    });

    it('should display ONGOING status', () => {
      const ongoingEvent = {
        ...mockEventDetails,
        event: { ...mockEventDetails.event, status: 'ONGOING' as const },
      };

      mockedUseEventDetails.mockReturnValue({
        data: ongoingEvent,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
      } as any);

      render(<EventDetailScreen />, { wrapper: createWrapper() });

      expect(screen.getByText('En cours')).toBeTruthy();
    });

    it('should display COMPLETED status', () => {
      const completedEvent = {
        ...mockEventDetails,
        event: { ...mockEventDetails.event, status: 'COMPLETED' as const },
      };

      mockedUseEventDetails.mockReturnValue({
        data: completedEvent,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
      } as any);

      render(<EventDetailScreen />, { wrapper: createWrapper() });

      expect(screen.getByText('Termine')).toBeTruthy();
    });

    it('should display CANCELLED status', () => {
      const cancelledEvent = {
        ...mockEventDetails,
        event: { ...mockEventDetails.event, status: 'CANCELLED' as const },
      };

      mockedUseEventDetails.mockReturnValue({
        data: cancelledEvent,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
      } as any);

      render(<EventDetailScreen />, { wrapper: createWrapper() });

      expect(screen.getByText('Annule')).toBeTruthy();
    });
  });

  describe('Participants', () => {
    it('should display participant count', () => {
      render(<EventDetailScreen />, { wrapper: createWrapper() });

      expect(screen.getByText('2 participants')).toBeTruthy();
    });

    it('should display participant list', () => {
      render(<EventDetailScreen />, { wrapper: createWrapper() });

      expect(screen.getByText('Participants (2)')).toBeTruthy();
      expect(screen.getByText('Jane Smith')).toBeTruthy();
      expect(screen.getByText('Bob Wilson')).toBeTruthy();
    });

    it('should use singular form for one participant', () => {
      const singleParticipant = {
        ...mockEventDetails,
        participants: [mockEventDetails.participants[0]],
      };

      mockedUseEventDetails.mockReturnValue({
        data: singleParticipant,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
      } as any);

      render(<EventDetailScreen />, { wrapper: createWrapper() });

      expect(screen.getByText('1 participant')).toBeTruthy();
    });
  });

  describe('Share Code (Organiser)', () => {
    it('should display share code for organiser', () => {
      render(<EventDetailScreen />, { wrapper: createWrapper() });

      expect(screen.getByText('Code de partage')).toBeTruthy();
      expect(screen.getByText('ABC123')).toBeTruthy();
      expect(screen.getByText('Partager')).toBeTruthy();
    });

    it('should not display share code for non-organiser', () => {
      mockedUseAuth.mockReturnValue({
        user: { id: 'other-user', displayName: 'Other User', email: 'other@example.com', isGuest: false },
      } as any);

      render(<EventDetailScreen />, { wrapper: createWrapper() });

      expect(screen.queryByText('Code de partage')).toBeNull();
    });

    it('should not display share code for completed events', () => {
      const completedEvent = {
        ...mockEventDetails,
        event: { ...mockEventDetails.event, status: 'COMPLETED' as const },
      };

      mockedUseEventDetails.mockReturnValue({
        data: completedEvent,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
      } as any);

      render(<EventDetailScreen />, { wrapper: createWrapper() });

      expect(screen.queryByText('Code de partage')).toBeNull();
    });
  });

  describe('Participate Button', () => {
    it('should show participate button for non-organiser', () => {
      mockedUseAuth.mockReturnValue({
        user: { id: 'other-user', displayName: 'Other User', email: 'other@example.com', isGuest: false },
      } as any);

      render(<EventDetailScreen />, { wrapper: createWrapper() });

      expect(screen.getByText('Participer')).toBeTruthy();
    });

    it('should not show participate button for organiser', () => {
      render(<EventDetailScreen />, { wrapper: createWrapper() });

      expect(screen.queryByText('Participer')).toBeNull();
    });

    it('should not show participate button for completed events', () => {
      mockedUseAuth.mockReturnValue({
        user: { id: 'other-user', displayName: 'Other User', email: 'other@example.com', isGuest: false },
      } as any);

      const completedEvent = {
        ...mockEventDetails,
        event: { ...mockEventDetails.event, status: 'COMPLETED' as const },
      };

      mockedUseEventDetails.mockReturnValue({
        data: completedEvent,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
      } as any);

      render(<EventDetailScreen />, { wrapper: createWrapper() });

      expect(screen.queryByText('Participer')).toBeNull();
    });
  });
});
