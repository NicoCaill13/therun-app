import { render, screen } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import CreateEventScreen from '../create';

jest.mock('@/lib/auth', () => ({ useAuth: jest.fn() }));
jest.mock('@/lib/api/events', () => ({
  ...jest.requireActual('@/lib/api/events'),
  useCreateEvent: jest.fn(),
}));

import { useAuth } from '@/lib/auth';
import { useCreateEvent } from '@/lib/api/events';

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockedUseCreateEvent = useCreateEvent as jest.MockedFunction<typeof useCreateEvent>;

const createWrapper = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
};

describe('CreateEventScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    mockedUseCreateEvent.mockReturnValue({
      mutateAsync: jest.fn(),
      mutate: jest.fn(),
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null,
      data: undefined,
      reset: jest.fn(),
    } as any);
  });

  it('should render without crashing', () => {
    render(<CreateEventScreen />, { wrapper: createWrapper() });
    expect(screen.getByText('Create Event')).toBeTruthy();
  });

  it('should display form fields', () => {
    render(<CreateEventScreen />, { wrapper: createWrapper() });

    expect(screen.getByText('EVENT TITLE')).toBeTruthy();
    expect(screen.getByText('DATE & TIME')).toBeTruthy();
    expect(screen.getByText('LOCATION')).toBeTruthy();
    expect(screen.getByText('DESCRIPTION')).toBeTruthy();
  });

  it('should display Create event button', () => {
    render(<CreateEventScreen />, { wrapper: createWrapper() });
    expect(screen.getByText('Create event')).toBeTruthy();
  });

  it('should display Cancel button', () => {
    render(<CreateEventScreen />, { wrapper: createWrapper() });
    expect(screen.getByText('Cancel')).toBeTruthy();
  });

  it('should have accessible EVENT TITLE input', () => {
    render(<CreateEventScreen />, { wrapper: createWrapper() });
    expect(screen.getByLabelText('EVENT TITLE')).toBeTruthy();
  });

  it('should have placeholder for event title', () => {
    render(<CreateEventScreen />, { wrapper: createWrapper() });
    expect(screen.getByPlaceholderText('e.g. Morning Trail Run')).toBeTruthy();
  });
});
