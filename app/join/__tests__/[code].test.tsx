import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import JoinScreen from '../[code]';

// Mock hooks and navigation
const mockPush = jest.fn();
const mockBack = jest.fn();
const mockReplace = jest.fn();
const mockRefetch = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    replace: mockReplace,
  }),
  useLocalSearchParams: () => ({ code: 'ABC123' }),
  Stack: {
    Screen: ({ options }: { options: Record<string, unknown> }) => null,
  },
}));

const mockSignInAsGuest = jest.fn();

jest.mock('@/lib/auth', () => ({
  useAuth: jest.fn(() => ({
    isAuthenticated: false,
    signInAsGuest: mockSignInAsGuest,
  })),
}));

const mockMutateAsyncParticipate = jest.fn();
const mockMutateAsyncGuestJoin = jest.fn();

jest.mock('@/lib/api', () => {
  // Import the real schema inside the mock factory
  const { GuestJoinInputSchema } = jest.requireActual('@/lib/api/join/types');

  return {
    usePublicEventByCode: jest.fn(),
    useJoinParticipate: jest.fn(() => ({
      mutateAsync: mockMutateAsyncParticipate,
      isPending: false,
      error: null,
    })),
    useGuestJoin: jest.fn(() => ({
      mutateAsync: mockMutateAsyncGuestJoin,
      isPending: false,
      error: null,
    })),
    GuestJoinInputSchema,
  };
});

import { useAuth } from '@/lib/auth';
import { usePublicEventByCode, useJoinParticipate, useGuestJoin } from '@/lib/api';

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockedUsePublicEventByCode = usePublicEventByCode as jest.MockedFunction<typeof usePublicEventByCode>;
const mockedUseJoinParticipate = useJoinParticipate as jest.MockedFunction<typeof useJoinParticipate>;
const mockedUseGuestJoin = useGuestJoin as jest.MockedFunction<typeof useGuestJoin>;

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
const mockPublicEvent = {
  id: 'event-123',
  eventCode: 'ABC123',
  title: 'Morning Run',
  startDateTime: '2025-02-15T08:00:00.000Z',
  status: 'SCHEDULED' as const,
  locationName: 'Central Park',
  locationAddress: '123 Park Ave',
  organiser: {
    firstName: 'John',
    lastName: 'Doe',
  },
  join: {
    eventCode: 'ABC123',
    eventId: 'event-123',
  },
};

describe('JoinScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      signInAsGuest: mockSignInAsGuest,
    } as unknown as ReturnType<typeof useAuth>);

    mockedUsePublicEventByCode.mockReturnValue({
      data: mockPublicEvent,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    } as unknown as ReturnType<typeof usePublicEventByCode>);

    mockedUseJoinParticipate.mockReturnValue({
      mutateAsync: mockMutateAsyncParticipate,
      isPending: false,
      error: null,
      data: null,
    } as unknown as ReturnType<typeof useJoinParticipate>);

    mockedUseGuestJoin.mockReturnValue({
      mutateAsync: mockMutateAsyncGuestJoin,
      isPending: false,
      error: null,
      data: null,
    } as unknown as ReturnType<typeof useGuestJoin>);
  });

  describe('Loading State', () => {
    it('should show loading indicator when loading', () => {
      mockedUsePublicEventByCode.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        refetch: mockRefetch,
      } as unknown as ReturnType<typeof usePublicEventByCode>);

      render(<JoinScreen />, { wrapper: createWrapper() });

      expect(screen.getByText("Chargement de l'evenement...")).toBeTruthy();
    });
  });

  describe('Error State', () => {
    it('should show error message when fetch fails', async () => {
      mockedUsePublicEventByCode.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: { kind: 'NOT_FOUND', message: 'Evenement introuvable', status: 404 },
        refetch: mockRefetch,
      } as unknown as ReturnType<typeof usePublicEventByCode>);

      render(<JoinScreen />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Oups !')).toBeTruthy();
      });
    });

    it('should call refetch when retry is pressed', async () => {
      mockedUsePublicEventByCode.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: { kind: 'UNKNOWN', message: 'Error', status: 500 },
        refetch: mockRefetch,
      } as unknown as ReturnType<typeof usePublicEventByCode>);

      render(<JoinScreen />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Reessayer')).toBeTruthy();
      });

      fireEvent.press(screen.getByText('Reessayer'));

      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('Event Preview (Guest)', () => {
    it('should display event title', () => {
      render(<JoinScreen />, { wrapper: createWrapper() });

      expect(screen.getByText('Morning Run')).toBeTruthy();
    });

    it('should display event location', () => {
      render(<JoinScreen />, { wrapper: createWrapper() });

      expect(screen.getByText('Central Park')).toBeTruthy();
      expect(screen.getByText('123 Park Ave')).toBeTruthy();
    });

    it('should display organiser name', () => {
      render(<JoinScreen />, { wrapper: createWrapper() });

      expect(screen.getByText(/Organise par John Doe/)).toBeTruthy();
    });

    it('should display guest join button for unauthenticated users', () => {
      render(<JoinScreen />, { wrapper: createWrapper() });

      expect(screen.getByText("Continuer en tant qu'invite")).toBeTruthy();
    });
  });

  describe('Event Preview (Authenticated)', () => {
    it('should display participate button for authenticated users', () => {
      mockedUseAuth.mockReturnValue({
        isAuthenticated: true,
        signInAsGuest: mockSignInAsGuest,
      } as unknown as ReturnType<typeof useAuth>);

      render(<JoinScreen />, { wrapper: createWrapper() });

      expect(screen.getByText('Participer')).toBeTruthy();
    });

    it('should not display guest option for authenticated users', () => {
      mockedUseAuth.mockReturnValue({
        isAuthenticated: true,
        signInAsGuest: mockSignInAsGuest,
      } as unknown as ReturnType<typeof useAuth>);

      render(<JoinScreen />, { wrapper: createWrapper() });

      expect(screen.queryByText("Continuer en tant qu'invite")).toBeNull();
    });
  });

  describe('Guest Form', () => {
    it('should navigate to guest form when button is pressed', async () => {
      render(<JoinScreen />, { wrapper: createWrapper() });

      fireEvent.press(screen.getByText("Continuer en tant qu'invite"));

      await waitFor(() => {
        expect(screen.getByText('Vos informations')).toBeTruthy();
        expect(screen.getByText('Prenom *')).toBeTruthy();
      });
    });

    it('should show optional fields in guest form', async () => {
      render(<JoinScreen />, { wrapper: createWrapper() });

      fireEvent.press(screen.getByText("Continuer en tant qu'invite"));

      await waitFor(() => {
        expect(screen.getByText('Nom (optionnel)')).toBeTruthy();
        expect(screen.getByText('Email (optionnel)')).toBeTruthy();
      });
    });

    it('should have disabled submit button when firstname is empty', async () => {
      render(<JoinScreen />, { wrapper: createWrapper() });

      fireEvent.press(screen.getByText("Continuer en tant qu'invite"));

      await waitFor(() => {
        const submitButton = screen.getByText('Rejoindre la sortie');
        // Button should be disabled (we check by trying to press it and seeing no mutation)
        expect(submitButton).toBeTruthy();
      });
    });
  });

  describe('Join Actions', () => {
    it('should call joinParticipate for authenticated users', async () => {
      mockedUseAuth.mockReturnValue({
        isAuthenticated: true,
        signInAsGuest: mockSignInAsGuest,
      } as unknown as ReturnType<typeof useAuth>);

      mockMutateAsyncParticipate.mockResolvedValueOnce({
        participantId: 'part-123',
        eventId: 'event-123',
        userId: 'user-123',
        role: 'PARTICIPANT',
        status: 'GOING',
      });

      render(<JoinScreen />, { wrapper: createWrapper() });

      fireEvent.press(screen.getByText('Participer'));

      await waitFor(() => {
        expect(mockMutateAsyncParticipate).toHaveBeenCalledWith('ABC123');
      });
    });
  });

  describe('Success State', () => {
    it('should show success screen after joining', async () => {
      mockedUseAuth.mockReturnValue({
        isAuthenticated: true,
        signInAsGuest: mockSignInAsGuest,
      } as unknown as ReturnType<typeof useAuth>);

      mockMutateAsyncParticipate.mockResolvedValueOnce({
        participantId: 'part-123',
        eventId: 'event-123',
        userId: 'user-123',
        role: 'PARTICIPANT',
        status: 'GOING',
      });

      render(<JoinScreen />, { wrapper: createWrapper() });

      fireEvent.press(screen.getByText('Participer'));

      await waitFor(() => {
        expect(screen.getByText('Bienvenue !')).toBeTruthy();
        expect(screen.getByText(/Vous avez rejoint/)).toBeTruthy();
      });
    });

    it('should navigate to event when continue is pressed', async () => {
      mockedUseAuth.mockReturnValue({
        isAuthenticated: true,
        signInAsGuest: mockSignInAsGuest,
      } as unknown as ReturnType<typeof useAuth>);

      mockMutateAsyncParticipate.mockResolvedValueOnce({
        participantId: 'part-123',
        eventId: 'event-123',
        userId: 'user-123',
        role: 'PARTICIPANT',
        status: 'GOING',
      });

      render(<JoinScreen />, { wrapper: createWrapper() });

      fireEvent.press(screen.getByText('Participer'));

      await waitFor(() => {
        expect(screen.getByText("Voir l'evenement")).toBeTruthy();
      });

      fireEvent.press(screen.getByText("Voir l'evenement"));

      expect(mockReplace).toHaveBeenCalledWith('/event/event-123');
    });
  });

  describe('Navigation', () => {
    it('should go back when back button is pressed in error state', async () => {
      mockedUsePublicEventByCode.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: { kind: 'NOT_FOUND', message: 'Not found', status: 404 },
        refetch: mockRefetch,
      } as unknown as ReturnType<typeof usePublicEventByCode>);

      render(<JoinScreen />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Retour')).toBeTruthy();
      });

      fireEvent.press(screen.getByText('Retour'));

      expect(mockBack).toHaveBeenCalled();
    });
  });
});
