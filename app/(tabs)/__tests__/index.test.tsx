import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import DashboardScreen from '../index';

// Mock hooks
const mockPush = jest.fn();
const mockRefetch = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

jest.mock('@/lib/auth', () => ({
  useAuth: jest.fn(() => ({
    isAuthenticated: true,
    isLoading: false,
    user: { id: 'user-1', displayName: 'John Doe' },
  })),
}));

jest.mock('@/lib/api', () => ({
  useMyEvents: jest.fn(),
}));

import { useAuth } from '@/lib/auth';
import { useMyEvents } from '@/lib/api';

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockedUseMyEvents = useMyEvents as jest.MockedFunction<typeof useMyEvents>;

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

describe('DashboardScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
    mockRefetch.mockClear();

    // Default mocks
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      isGuest: false,
      user: { id: 'user-1', displayName: 'John Doe', email: 'john@example.com', isGuest: false },
      token: 'mock-token',
      signIn: jest.fn(),
      signInAsGuest: jest.fn(),
      signOut: jest.fn(),
      updateUser: jest.fn(),
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator when auth is loading', () => {
      mockedUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        isGuest: false,
        user: null,
        token: null,
        signIn: jest.fn(),
        signInAsGuest: jest.fn(),
        signOut: jest.fn(),
        updateUser: jest.fn(),
      });

      mockedUseMyEvents.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
      } as any);

      render(<DashboardScreen />, { wrapper: createWrapper() });

      expect(screen.getByText('Chargement...')).toBeTruthy();
    });

    it('should show loading indicator when events are loading', () => {
      mockedUseMyEvents.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
      } as any);

      render(<DashboardScreen />, { wrapper: createWrapper() });

      expect(screen.getByText('Chargement...')).toBeTruthy();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when user has no events', () => {
      mockedUseMyEvents.mockReturnValue({
        data: { items: [], page: 1, pageSize: 20, total: 0 },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
      } as any);

      render(<DashboardScreen />, { wrapper: createWrapper() });

      expect(screen.getByText('Aucune sortie')).toBeTruthy();
      expect(screen.getByText(/Vous n'avez pas encore de sortie/)).toBeTruthy();
      expect(screen.getByText('Creer une sortie')).toBeTruthy();
    });

    it('should show empty state when not authenticated', () => {
      mockedUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        isGuest: false,
        user: null,
        token: null,
        signIn: jest.fn(),
        signInAsGuest: jest.fn(),
        signOut: jest.fn(),
        updateUser: jest.fn(),
      });

      mockedUseMyEvents.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
      } as any);

      render(<DashboardScreen />, { wrapper: createWrapper() });

      expect(screen.getByText('Aucune sortie')).toBeTruthy();
    });

    it('should navigate to create screen when CTA is pressed', () => {
      mockedUseMyEvents.mockReturnValue({
        data: { items: [], page: 1, pageSize: 20, total: 0 },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
      } as any);

      render(<DashboardScreen />, { wrapper: createWrapper() });

      const ctaButton = screen.getByText('Creer une sortie');
      fireEvent.press(ctaButton);

      expect(mockPush).toHaveBeenCalledWith('/event/create');
    });
  });

  describe('Events List', () => {
    const mockEvents = {
      items: [
        {
          id: 'event-1',
          title: 'Run du jeudi soir',
          startDateTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          status: 'SCHEDULED' as const,
          locationName: 'Parc Borely',
          locationAddress: null,
          goingCount: 5,
        },
        {
          id: 'event-2',
          title: 'Sortie du dimanche',
          startDateTime: new Date(Date.now() + 3 * 86400000).toISOString(), // In 3 days
          status: 'SCHEDULED' as const,
          locationName: null,
          locationAddress: null,
          goingCount: 12,
        },
      ],
      page: 1,
      pageSize: 20,
      total: 2,
    };

    it('should display list of events', () => {
      mockedUseMyEvents.mockReturnValue({
        data: mockEvents,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
      } as any);

      render(<DashboardScreen />, { wrapper: createWrapper() });

      expect(screen.getByText('Mes sorties')).toBeTruthy();
      expect(screen.getByText('Run du jeudi soir')).toBeTruthy();
      expect(screen.getByText('Sortie du dimanche')).toBeTruthy();
    });

    it('should display participant count for each event', () => {
      mockedUseMyEvents.mockReturnValue({
        data: mockEvents,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
      } as any);

      render(<DashboardScreen />, { wrapper: createWrapper() });

      expect(screen.getByText('5 participants')).toBeTruthy();
      expect(screen.getByText('12 participants')).toBeTruthy();
    });

    it('should display location when available', () => {
      mockedUseMyEvents.mockReturnValue({
        data: mockEvents,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
      } as any);

      render(<DashboardScreen />, { wrapper: createWrapper() });

      expect(screen.getByText('Parc Borely')).toBeTruthy();
    });

    it('should navigate to event detail when card is pressed', () => {
      mockedUseMyEvents.mockReturnValue({
        data: mockEvents,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
      } as any);

      render(<DashboardScreen />, { wrapper: createWrapper() });

      const eventCard = screen.getByText('Run du jeudi soir');
      fireEvent.press(eventCard);

      expect(mockPush).toHaveBeenCalledWith('/event/event-1');
    });

    it('should display status badge for ongoing events', () => {
      const ongoingEvent = {
        ...mockEvents,
        items: [
          {
            ...mockEvents.items[0],
            status: 'ONGOING' as const,
          },
        ],
      };

      mockedUseMyEvents.mockReturnValue({
        data: ongoingEvent,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
      } as any);

      render(<DashboardScreen />, { wrapper: createWrapper() });

      expect(screen.getByText('En cours')).toBeTruthy();
    });
  });

  describe('Error State', () => {
    it('should show error message when fetch fails', () => {
      mockedUseMyEvents.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: { kind: 'UNKNOWN', message: 'Network error', status: 500 },
        refetch: mockRefetch,
        isRefetching: false,
      } as any);

      render(<DashboardScreen />, { wrapper: createWrapper() });

      expect(screen.getByText('Network error')).toBeTruthy();
      expect(screen.getByText('Reessayer')).toBeTruthy();
    });

    it('should call refetch when retry button is pressed', () => {
      mockedUseMyEvents.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: { kind: 'UNKNOWN', message: 'Network error', status: 500 },
        refetch: mockRefetch,
        isRefetching: false,
      } as any);

      render(<DashboardScreen />, { wrapper: createWrapper() });

      const retryButton = screen.getByText('Reessayer');
      fireEvent.press(retryButton);

      expect(mockRefetch).toHaveBeenCalled();
    });
  });
});
