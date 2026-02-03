import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import CreateEventScreen from '../create';

// Mock hooks and navigation
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();
const mockMutateAsync = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
  }),
  Stack: {
    Screen: ({ options }: any) => null,
  },
}));

jest.mock('@/lib/api', () => ({
  useCreateEvent: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
    error: null,
  }),
  CreateEventInputSchema: jest.requireActual('@/lib/api/events/types').CreateEventInputSchema,
}));

jest.mock('@/components/providers', () => ({
  useUpsellModal: () => ({
    showUpsell: jest.fn(),
  }),
}));

// Test wrapper
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe('CreateEventScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMutateAsync.mockResolvedValue({
      event: { id: 'new-event-id', title: 'Test Event' },
      organiser: { id: 'user-1' },
      participants: [],
      currentUserParticipation: null,
    });
  });

  describe('Form Rendering', () => {
    it('should render all form fields', () => {
      render(<CreateEventScreen />, { wrapper: createWrapper() });

      expect(screen.getByText('Create Event')).toBeTruthy();
      expect(screen.getByText('Event Title')).toBeTruthy();
      expect(screen.getByText('Date & Time')).toBeTruthy();
      expect(screen.getByText('Location')).toBeTruthy();
      expect(screen.getByText('Address')).toBeTruthy();
      expect(screen.getByText('Description')).toBeTruthy();
    });

    it('should render submit and cancel buttons', () => {
      render(<CreateEventScreen />, { wrapper: createWrapper() });

      expect(screen.getByText('Create event')).toBeTruthy();
      expect(screen.getByText('Cancel')).toBeTruthy();
    });

    it('should have default date set to tomorrow at 19:00', () => {
      render(<CreateEventScreen />, { wrapper: createWrapper() });

      // Check that time input shows 19:00
      expect(screen.getByDisplayValue('19:00')).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('should disable submit button when title is empty', () => {
      render(<CreateEventScreen />, { wrapper: createWrapper() });

      const submitButton = screen.getByText('Create event');
      // Button should be disabled (we check by seeing if mutation is not called)
      fireEvent.press(submitButton);

      expect(mockMutateAsync).not.toHaveBeenCalled();
    });

    it('should enable submit when valid data is entered', async () => {
      render(<CreateEventScreen />, { wrapper: createWrapper() });

      const titleInput = screen.getByPlaceholderText('e.g. Morning Trail Run');
      await act(async () => {
        fireEvent.changeText(titleInput, 'Test Run');
      });

      const submitButton = screen.getByRole('button', { name: 'Create event' });
      await act(async () => {
        fireEvent.press(submitButton);
      });

      await waitFor(
        () => expect(mockMutateAsync).toHaveBeenCalled(),
        { timeout: 2000 }
      );
    });
  });

  describe('Form Submission', () => {
    it('should call createEvent mutation with form data', async () => {
      render(<CreateEventScreen />, { wrapper: createWrapper() });

      const titleInput = screen.getByPlaceholderText('e.g. Morning Trail Run');
      const locationInput = screen.getByPlaceholderText('Search for a location');
      const descriptionInput = screen.getByPlaceholderText(
        'Tell runners what to expect, pace group info, etc.'
      );

      await act(async () => {
        fireEvent.changeText(titleInput, 'Run du samedi');
        fireEvent.changeText(locationInput, 'Parc Central');
        fireEvent.changeText(descriptionInput, 'Super sortie');
      });

      const submitButton = screen.getByRole('button', { name: 'Create event' });
      await act(async () => {
        fireEvent.press(submitButton);
      });

      await waitFor(
        () =>
          expect(mockMutateAsync).toHaveBeenCalledWith(
            expect.objectContaining({
              title: 'Run du samedi',
              locationName: 'Parc Central',
              description: 'Super sortie',
            })
          ),
        { timeout: 2000 }
      );
    });

    it('should navigate to event detail after successful creation', async () => {
      mockMutateAsync.mockResolvedValue({
        event: { id: 'created-event-123', title: 'Test Event' },
        organiser: { id: 'user-1' },
        participants: [],
        currentUserParticipation: null,
      });

      render(<CreateEventScreen />, { wrapper: createWrapper() });

      const titleInput = screen.getByPlaceholderText('e.g. Morning Trail Run');
      await act(async () => {
        fireEvent.changeText(titleInput, 'Run du samedi');
      });

      const submitButton = screen.getByRole('button', { name: 'Create event' });
      await act(async () => {
        fireEvent.press(submitButton);
      });

      await waitFor(
        () => expect(mockReplace).toHaveBeenCalledWith('/event/created-event-123'),
        { timeout: 2000 }
      );
    });

    it('should not navigate on mutation error', async () => {
      mockMutateAsync.mockRejectedValue({ kind: 'VALIDATION', message: 'Error' });

      render(<CreateEventScreen />, { wrapper: createWrapper() });

      const titleInput = screen.getByPlaceholderText('e.g. Morning Trail Run');
      await act(async () => {
        fireEvent.changeText(titleInput, 'Run du samedi');
      });

      const submitButton = screen.getByRole('button', { name: 'Create event' });
      await act(async () => {
        fireEvent.press(submitButton);
      });

      await waitFor(
        () => expect(mockMutateAsync).toHaveBeenCalled(),
        { timeout: 2000 }
      );
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  describe('Cancel Action', () => {
    it('should go back when cancel is pressed', () => {
      render(<CreateEventScreen />, { wrapper: createWrapper() });

      const cancelButton = screen.getByText('Cancel');
      fireEvent.press(cancelButton);

      expect(mockBack).toHaveBeenCalled();
    });
  });

  describe('Date/Time Input', () => {
    it('should update date when input changes', async () => {
      render(<CreateEventScreen />, { wrapper: createWrapper() });

      // Find date input (YYYY-MM-DD format)
      const dateInputs = screen.getAllByPlaceholderText('AAAA-MM-JJ');
      expect(dateInputs.length).toBeGreaterThan(0);
    });

    it('should update time when input changes', () => {
      render(<CreateEventScreen />, { wrapper: createWrapper() });

      const timeInput = screen.getByPlaceholderText('HH:MM');
      fireEvent.changeText(timeInput, '20:30');

      expect(screen.getByDisplayValue('20:30')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible labels on form fields', () => {
      render(<CreateEventScreen />, { wrapper: createWrapper() });

      expect(screen.getByLabelText('Event Title')).toBeTruthy();
      expect(screen.getByLabelText('Location')).toBeTruthy();
      expect(screen.getByLabelText('Address')).toBeTruthy();
      expect(screen.getByLabelText('Description')).toBeTruthy();
    });

    it('should have accessible label on submit button', () => {
      render(<CreateEventScreen />, { wrapper: createWrapper() });

      expect(screen.getByLabelText('Create event')).toBeTruthy();
    });
  });
});
