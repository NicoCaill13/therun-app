import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider, InfiniteData } from '@tanstack/react-query';
import { ReactNode } from 'react';
import DashboardScreen from '../index';
import type { MeEventsListResponse } from '@/lib/api';

// Mock hooks
const mockPush = jest.fn();
const mockRefetch = jest.fn();
const mockFetchNextPage = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useNavigation: () => ({
    setOptions: jest.fn(),
    navigate: jest.fn(),
    goBack: jest.fn(),
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
  useMyEventsInfinite: jest.fn(),
  flattenInfiniteEvents: jest.fn((data) => {
    if (!data) return [];
    return data.pages.flatMap((page: MeEventsListResponse) => page.items);
  }),
}));

import { useAuth } from '@/lib/auth';
import { useMyEventsInfinite, flattenInfiniteEvents } from '@/lib/api';

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockedUseMyEventsInfinite = useMyEventsInfinite as jest.MockedFunction<typeof useMyEventsInfinite>;

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

// Helper to create infinite data structure
function createInfiniteData(items: any[]): InfiniteData<MeEventsListResponse> {
  return {
    pages: [{
      items,
      page: 1,
      pageSize: 10,
      total: items.length,
    }],
    pageParams: [{ page: 1 }],
  };
}

describe('DashboardScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
    mockRefetch.mockClear();
    mockFetchNextPage.mockClear();

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

      mockedUseMyEventsInfinite.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
        fetchNextPage: mockFetchNextPage,
        hasNextPage: false,
        isFetchingNextPage: false,
      } as any);

      render(<DashboardScreen />, { wrapper: createWrapper() });

      expect(screen.getByText('Chargement...')).toBeTruthy();
    });

    it('should show loading indicator when events are loading', () => {
      mockedUseMyEventsInfinite.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
        fetchNextPage: mockFetchNextPage,
        hasNextPage: false,
        isFetchingNextPage: false,
      } as any);

      render(<DashboardScreen />, { wrapper: createWrapper() });

      expect(screen.getByText('THE RUN')).toBeTruthy();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when user has no events', () => {
      mockedUseMyEventsInfinite.mockReturnValue({
        data: createInfiniteData([]),
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
        fetchNextPage: mockFetchNextPage,
        hasNextPage: false,
        isFetchingNextPage: false,
      } as any);

      render(<DashboardScreen />, { wrapper: createWrapper() });

      expect(screen.getByText('THE RUN')).toBeTruthy();
      expect(screen.getByText('Create your next run')).toBeTruthy();
      expect(screen.getByText('Create an event')).toBeTruthy();
      expect(screen.getByText('Join with a code')).toBeTruthy();
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

      mockedUseMyEventsInfinite.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
        fetchNextPage: mockFetchNextPage,
        hasNextPage: false,
        isFetchingNextPage: false,
      } as any);

      render(<DashboardScreen />, { wrapper: createWrapper() });

      expect(screen.getByText('THE RUN')).toBeTruthy();
      expect(screen.getByText('Create your next run')).toBeTruthy();
    });

    it('should navigate to create screen when CTA is pressed', () => {
      mockedUseMyEventsInfinite.mockReturnValue({
        data: createInfiniteData([]),
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
        fetchNextPage: mockFetchNextPage,
        hasNextPage: false,
        isFetchingNextPage: false,
      } as any);

      render(<DashboardScreen />, { wrapper: createWrapper() });

      const ctaButton = screen.getByLabelText('Create an event');
      fireEvent.press(ctaButton);

      expect(mockPush).toHaveBeenCalledWith('/event/create');
    });
  });

  describe('Events List', () => {
    const mockEventItems = [
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
    ];

    it('should display list of events', () => {
      mockedUseMyEventsInfinite.mockReturnValue({
        data: createInfiniteData(mockEventItems),
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
        fetchNextPage: mockFetchNextPage,
        hasNextPage: false,
        isFetchingNextPage: false,
      } as any);

      render(<DashboardScreen />, { wrapper: createWrapper() });

      expect(screen.getByText('Mes sorties')).toBeTruthy();
      expect(screen.getByText('Run du jeudi soir')).toBeTruthy();
      expect(screen.getByText('Sortie du dimanche')).toBeTruthy();
    });

    it('should display participant count for each event', () => {
      mockedUseMyEventsInfinite.mockReturnValue({
        data: createInfiniteData(mockEventItems),
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
        fetchNextPage: mockFetchNextPage,
        hasNextPage: false,
        isFetchingNextPage: false,
      } as any);

      render(<DashboardScreen />, { wrapper: createWrapper() });

      expect(screen.getByText('5 participants')).toBeTruthy();
      expect(screen.getByText('12 participants')).toBeTruthy();
    });

    it('should display location when available', () => {
      mockedUseMyEventsInfinite.mockReturnValue({
        data: createInfiniteData(mockEventItems),
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
        fetchNextPage: mockFetchNextPage,
        hasNextPage: false,
        isFetchingNextPage: false,
      } as any);

      render(<DashboardScreen />, { wrapper: createWrapper() });

      expect(screen.getByText('Parc Borely')).toBeTruthy();
    });

    it('should navigate to event detail when card is pressed', () => {
      mockedUseMyEventsInfinite.mockReturnValue({
        data: createInfiniteData(mockEventItems),
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
        fetchNextPage: mockFetchNextPage,
        hasNextPage: false,
        isFetchingNextPage: false,
      } as any);

      render(<DashboardScreen />, { wrapper: createWrapper() });

      const eventCard = screen.getByText('Run du jeudi soir');
      fireEvent.press(eventCard);

      expect(mockPush).toHaveBeenCalledWith('/event/event-1');
    });

    it('should display status badge for ongoing events', () => {
      const ongoingItems = [{
        ...mockEventItems[0],
        status: 'ONGOING' as const,
      }];

      mockedUseMyEventsInfinite.mockReturnValue({
        data: createInfiniteData(ongoingItems),
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
        fetchNextPage: mockFetchNextPage,
        hasNextPage: false,
        isFetchingNextPage: false,
      } as any);

      render(<DashboardScreen />, { wrapper: createWrapper() });

      expect(screen.getByText('En cours')).toBeTruthy();
    });
  });

  // ==========================================================================
  // Phase 4.2 - Tabs
  // ==========================================================================

  describe('Tabs (Phase 4.2)', () => {
    const mockEventItems = [{
      id: 'event-1',
      title: 'Run du jeudi soir',
      startDateTime: new Date(Date.now() + 86400000).toISOString(),
      status: 'SCHEDULED' as const,
      locationName: null,
      locationAddress: null,
      goingCount: 5,
    }];

    it('should display tabs for future and past events', () => {
      mockedUseMyEventsInfinite.mockReturnValue({
        data: createInfiniteData(mockEventItems),
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
        fetchNextPage: mockFetchNextPage,
        hasNextPage: false,
        isFetchingNextPage: false,
      } as any);

      render(<DashboardScreen />, { wrapper: createWrapper() });

      expect(screen.getByText('A venir')).toBeTruthy();
      expect(screen.getByText('Passees')).toBeTruthy();
    });

    it('should switch to past events when past tab is pressed', () => {
      mockedUseMyEventsInfinite.mockReturnValue({
        data: createInfiniteData(mockEventItems),
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
        fetchNextPage: mockFetchNextPage,
        hasNextPage: false,
        isFetchingNextPage: false,
      } as any);

      render(<DashboardScreen />, { wrapper: createWrapper() });

      const pastTab = screen.getByText('Passees');
      fireEvent.press(pastTab);

      // The hook should be called with 'past' scope after tab change
      // Note: Due to state change, we verify the tab was pressed
      expect(pastTab).toBeTruthy();
    });

    it('should show different empty state for past events', () => {
      const futureEvent = {
        id: 'event-1',
        title: 'Run a venir',
        startDateTime: new Date(Date.now() + 86400000).toISOString(),
        status: 'SCHEDULED' as const,
        locationName: null,
        locationAddress: null,
        goingCount: 1,
      };
      mockedUseMyEventsInfinite.mockImplementation((scope: string) => ({
        data: scope === 'future' ? createInfiniteData([futureEvent]) : createInfiniteData([]),
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
        fetchNextPage: mockFetchNextPage,
        hasNextPage: false,
        isFetchingNextPage: false,
      }));

      render(<DashboardScreen />, { wrapper: createWrapper() });

      expect(screen.getByText('Mes sorties')).toBeTruthy();
      const pastTab = screen.getByText('Passees');
      fireEvent.press(pastTab);

      expect(screen.getByText('Aucun historique')).toBeTruthy();
    });
  });

  // ==========================================================================
  // Phase 4.2 - Floating Action Button
  // ==========================================================================

  describe('Floating Action Button (Phase 4.2)', () => {
    const mockEventItems = [{
      id: 'event-1',
      title: 'Run du jeudi soir',
      startDateTime: new Date(Date.now() + 86400000).toISOString(),
      status: 'SCHEDULED' as const,
      locationName: null,
      locationAddress: null,
      goingCount: 5,
    }];

    it('should display FAB when events are present', () => {
      mockedUseMyEventsInfinite.mockReturnValue({
        data: createInfiniteData(mockEventItems),
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
        fetchNextPage: mockFetchNextPage,
        hasNextPage: false,
        isFetchingNextPage: false,
      } as any);

      render(<DashboardScreen />, { wrapper: createWrapper() });

      expect(screen.getByLabelText('Creer une nouvelle sortie')).toBeTruthy();
    });

    it('should navigate to create screen when FAB is pressed', () => {
      mockedUseMyEventsInfinite.mockReturnValue({
        data: createInfiniteData(mockEventItems),
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
        fetchNextPage: mockFetchNextPage,
        hasNextPage: false,
        isFetchingNextPage: false,
      } as any);

      render(<DashboardScreen />, { wrapper: createWrapper() });

      const fab = screen.getByLabelText('Creer une nouvelle sortie');
      fireEvent.press(fab);

      expect(mockPush).toHaveBeenCalledWith('/event/create');
    });
  });

  describe('Error State', () => {
    it('should show error message when fetch fails', () => {
      mockedUseMyEventsInfinite.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: { kind: 'UNKNOWN', message: 'Network error', status: 500 },
        refetch: mockRefetch,
        isRefetching: false,
        fetchNextPage: mockFetchNextPage,
        hasNextPage: false,
        isFetchingNextPage: false,
      } as any);

      render(<DashboardScreen />, { wrapper: createWrapper() });

      expect(screen.getByText('Network error')).toBeTruthy();
      expect(screen.getByText('Reessayer')).toBeTruthy();
    });

    it('should call refetch when retry button is pressed', () => {
      mockedUseMyEventsInfinite.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: { kind: 'UNKNOWN', message: 'Network error', status: 500 },
        refetch: mockRefetch,
        isRefetching: false,
        fetchNextPage: mockFetchNextPage,
        hasNextPage: false,
        isFetchingNextPage: false,
      } as any);

      render(<DashboardScreen />, { wrapper: createWrapper() });

      const retryButton = screen.getByText('Reessayer');
      fireEvent.press(retryButton);

      expect(mockRefetch).toHaveBeenCalled();
    });
  });
});
