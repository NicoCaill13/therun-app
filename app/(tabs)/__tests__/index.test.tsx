import { render, screen } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import HomeScreen from '../index';

jest.mock('@/lib/auth', () => ({ useAuth: jest.fn() }));
jest.mock('@/lib/api/me', () => ({ useMeEvents: jest.fn() }));

import { useAuth } from '@/lib/auth';
import { useMeEvents } from '@/lib/api/me';

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockedUseMeEvents = useMeEvents as jest.MockedFunction<typeof useMeEvents>;

const createWrapper = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
};

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      token: null,
      isGuest: false,
      signIn: jest.fn(),
      signInAsGuest: jest.fn(),
      signOut: jest.fn(),
      updateUser: jest.fn(),
    } as any);
    mockedUseMeEvents.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    } as any);
  });

  it('should render without crashing', () => {
    render(<HomeScreen />, { wrapper: createWrapper() });
    expect(screen.getByText('THE RUN')).toBeTruthy();
  });

  it('should show empty state when not authenticated', () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      token: null,
      isGuest: false,
      signIn: jest.fn(),
      signInAsGuest: jest.fn(),
      signOut: jest.fn(),
      updateUser: jest.fn(),
    } as any);

    render(<HomeScreen />, { wrapper: createWrapper() });

    expect(screen.getByText('THE RUN')).toBeTruthy();
    expect(screen.getByText('Create your next run')).toBeTruthy();
    expect(screen.getByText('Create an event')).toBeTruthy();
    expect(screen.getByText('Join with a code')).toBeTruthy();
  });

  it('should show empty state when authenticated but no events', () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 'user-1', displayName: 'John' },
      token: 'token',
      isGuest: false,
      signIn: jest.fn(),
      signInAsGuest: jest.fn(),
      signOut: jest.fn(),
      updateUser: jest.fn(),
    } as any);
    mockedUseMeEvents.mockReturnValue({
      data: { items: [], page: 1, pageSize: 20, total: 0 },
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    render(<HomeScreen />, { wrapper: createWrapper() });

    expect(screen.getByText('Create your next run')).toBeTruthy();
    expect(screen.getByText('Create an event')).toBeTruthy();
  });

  it('should show events list when authenticated with events', () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 'user-1', displayName: 'John' },
      token: 'token',
      isGuest: false,
      signIn: jest.fn(),
      signInAsGuest: jest.fn(),
      signOut: jest.fn(),
      updateUser: jest.fn(),
    } as any);
    mockedUseMeEvents.mockReturnValue({
      data: {
        items: [
          {
            id: 'event-1',
            title: 'Run du jeudi',
            startDateTime: new Date(Date.now() + 86400000).toISOString(),
            status: 'SCHEDULED',
            locationName: 'Parc Borely',
            locationAddress: null,
            goingCount: 5,
          },
        ],
        page: 1,
        pageSize: 20,
        total: 1,
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    render(<HomeScreen />, { wrapper: createWrapper() });

    expect(screen.getByText('Upcoming')).toBeTruthy();
    expect(screen.getByText('Run du jeudi')).toBeTruthy();
  });

  it('should show loading state when events are loading', () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 'user-1', displayName: 'John' },
      token: 'token',
      isGuest: false,
      signIn: jest.fn(),
      signInAsGuest: jest.fn(),
      signOut: jest.fn(),
      updateUser: jest.fn(),
    } as any);
    mockedUseMeEvents.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    render(<HomeScreen />, { wrapper: createWrapper() });

    expect(screen.getByText('THE RUN')).toBeTruthy();
  });
});
