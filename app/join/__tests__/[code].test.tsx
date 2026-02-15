import { render, screen } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import JoinByCodeScreen from '../[code]';

jest.mock('@/lib/api/join', () => ({ useResolveEventCode: jest.fn(), useParticipate: jest.fn() }));
jest.mock('@/lib/auth', () => ({ useAuth: jest.fn() }));

jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useLocalSearchParams: () => ({ code: '' }),
}));

import { useResolveEventCode, useParticipate } from '@/lib/api/join';
import { useAuth } from '@/lib/auth';

const mockedUseResolveEventCode = useResolveEventCode as jest.MockedFunction<typeof useResolveEventCode>;
const mockedUseParticipate = useParticipate as jest.MockedFunction<typeof useParticipate>;
const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

const createWrapper = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
};

describe('JoinByCodeScreen', () => {
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
    mockedUseResolveEventCode.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    } as any);
    mockedUseParticipate.mockReturnValue({
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
    render(<JoinByCodeScreen />, { wrapper: createWrapper() });
    expect(screen.getByText('Join with Code')).toBeTruthy();
  });

  it('should display Enter Club Code heading', () => {
    render(<JoinByCodeScreen />, { wrapper: createWrapper() });
    expect(screen.getByText('Enter Club Code')).toBeTruthy();
  });

  it('should display code input instructions', () => {
    render(<JoinByCodeScreen />, { wrapper: createWrapper() });
    expect(
      screen.getByText('Enter the 6-character code provided by your organizer to join the session.')
    ).toBeTruthy();
  });

  it('should display Continue button', () => {
    render(<JoinByCodeScreen />, { wrapper: createWrapper() });
    expect(screen.getByText('Continue')).toBeTruthy();
  });

  it('should display Where do I find the code?', () => {
    render(<JoinByCodeScreen />, { wrapper: createWrapper() });
    expect(screen.getByText('Where do I find the code?')).toBeTruthy();
  });
});
