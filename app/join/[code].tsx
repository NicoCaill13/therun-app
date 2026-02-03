import { useCallback, useReducer, useEffect } from 'react';
import { View, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Container, ScrollContainer, Typography, H1, H2, Button, Input } from '@/components/ui';
import { LoadingState, ErrorState, SuccessState } from '@/components/states';
import { useAuth } from '@/lib/auth';
import { formatEventDate } from '@/lib/utils';
import {
  usePublicEventByCode,
  useJoinParticipate,
  useGuestJoin,
  GuestJoinInputSchema,
  type GuestJoinInput,
  type PublicEventByCode,
} from '@/lib/api';

// ============================================================================
// Types & State
// ============================================================================

type JoinStep = 'loading' | 'preview' | 'guest_form' | 'joining' | 'success' | 'error';

interface JoinState {
  step: JoinStep;
  errorMessage: string | null;
}

type JoinAction =
  | { type: 'SET_STEP'; payload: JoinStep }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'RESET' };

const initialState: JoinState = {
  step: 'loading',
  errorMessage: null,
};

function joinReducer(state: JoinState, action: JoinAction): JoinState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.payload, errorMessage: null };
    case 'SET_ERROR':
      return { step: 'error', errorMessage: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// ============================================================================
// Join Loading State (specialized)
// ============================================================================

function JoinLoadingState() {
  return (
    <LoadingState
      message="Chargement de l'evenement..."
      hasSafeArea
    />
  );
}

// ============================================================================
// Joining State (specialized)
// ============================================================================

function JoiningState() {
  return (
    <Container isCenter hasSafeArea className="bg-backgroundLight dark:bg-backgroundDark">
      <ActivityIndicator size="large" color="#16a34a" />
      <Typography className="mt-4" color="muted">
        Inscription en cours...
      </Typography>
    </Container>
  );
}

// ============================================================================
// Event Preview Component
// ============================================================================

interface EventPreviewProps {
  event: PublicEventByCode;
  isAuthenticated: boolean;
  isJoining: boolean;
  onJoinAsUser: () => void;
  onJoinAsGuest: () => void;
}

function EventPreview({ event, isAuthenticated, isJoining, onJoinAsUser, onJoinAsGuest }: EventPreviewProps) {
  const formattedDate = formatEventDate(event.startDateTime);
  const organiserName = [event.organiser.firstName, event.organiser.lastName].filter(Boolean).join(' ');

  return (
    <ScrollContainer hasSafeArea padding="lg" className="bg-backgroundLight dark:bg-backgroundDark">
      {/* Event Info Card */}
      <View className="bg-white dark:bg-charcoal/10 border border-borderGrey dark:border-secondary-800 rounded-xl p-5 mb-6">
        <Typography variant="caption" color="muted" className="mb-1">
          Vous etes invite a rejoindre
        </Typography>
        <H1 className="mb-4">{event.title}</H1>

        <View className="flex-row items-center mb-3">
          <Typography className="mr-2">📅</Typography>
          <Typography>{formattedDate}</Typography>
        </View>

        {event.locationName && (
          <View className="flex-row items-center mb-3">
            <Typography className="mr-2">📍</Typography>
            <View className="flex-1">
              <Typography>{event.locationName}</Typography>
              {event.locationAddress && (
                <Typography variant="bodySmall" color="muted">{event.locationAddress}</Typography>
              )}
            </View>
          </View>
        )}

        <View className="flex-row items-center">
          <Typography className="mr-2">👤</Typography>
          <Typography color="muted">Organise par {organiserName}</Typography>
        </View>
      </View>

      {/* Action Buttons */}
      {isAuthenticated ? (
        <Button
          variant="primary"
          size="lg"
          isFullWidth
          isLoading={isJoining}
          onPress={onJoinAsUser}
        >
          Participer
        </Button>
      ) : (
        <>
          <Button
            variant="primary"
            size="lg"
            isFullWidth
            onPress={onJoinAsGuest}
          >
            Continuer en tant qu'invite
          </Button>
          <Typography variant="caption" color="muted" className="text-center mt-4">
            Vous pourrez creer un compte plus tard pour retrouver vos sorties
          </Typography>
        </>
      )}
    </ScrollContainer>
  );
}

// ============================================================================
// Guest Form Component
// ============================================================================

interface GuestFormProps {
  event: PublicEventByCode;
  isJoining: boolean;
  onSubmit: (data: GuestJoinInput) => void;
  onBack: () => void;
}

function GuestForm({ event, isJoining, onSubmit, onBack }: GuestFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<GuestJoinInput>({
    resolver: zodResolver(GuestJoinInputSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
    },
    mode: 'onChange',
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollContainer hasSafeArea padding="lg">
        <H2 className="mb-2">Vos informations</H2>
        <Typography color="muted" className="mb-6">
          Entrez votre prenom pour rejoindre "{event.title}"
        </Typography>

        <Controller
          control={control}
          name="firstName"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Prenom *"
              placeholder="Ex: Jean"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.firstName?.message}
              containerClassName="mb-4"
              autoCapitalize="words"
              autoFocus
              returnKeyType="next"
            />
          )}
        />

        <Controller
          control={control}
          name="lastName"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Nom (optionnel)"
              placeholder="Ex: Dupont"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.lastName?.message}
              containerClassName="mb-4"
              autoCapitalize="words"
              returnKeyType="next"
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Email (optionnel)"
              placeholder="Ex: jean@example.com"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.email?.message}
              containerClassName="mb-6"
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="done"
            />
          )}
        />

        <Button
          variant="primary"
          size="lg"
          isFullWidth
          isLoading={isJoining}
          isDisabled={!isValid}
          onPress={handleSubmit(onSubmit)}
        >
          Rejoindre la sortie
        </Button>

        <Button
          variant="ghost"
          size="lg"
          isFullWidth
          onPress={onBack}
          className="mt-3"
        >
          Retour
        </Button>
      </ScrollContainer>
    </KeyboardAvoidingView>
  );
}

// ============================================================================
// Main Join Screen
// ============================================================================

export default function JoinScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const { isAuthenticated, signInAsGuest } = useAuth();
  const [state, dispatch] = useReducer(joinReducer, initialState);

  // API hooks
  const {
    data: event,
    isLoading: isLoadingEvent,
    error: eventError,
    refetch: refetchEvent,
  } = usePublicEventByCode(code ?? '');

  const joinParticipate = useJoinParticipate();
  const guestJoin = useGuestJoin();

  // Update step based on loading state
  useEffect(() => {
    if (isLoadingEvent) {
      dispatch({ type: 'SET_STEP', payload: 'loading' });
    } else if (eventError) {
      dispatch({ type: 'SET_ERROR', payload: eventError.message || 'Evenement introuvable' });
    } else if (event && state.step === 'loading') {
      dispatch({ type: 'SET_STEP', payload: 'preview' });
    }
  }, [isLoadingEvent, eventError, event, state.step]);

  // Handle join as authenticated user
  const handleJoinAsUser = useCallback(async () => {
    if (!code) return;

    dispatch({ type: 'SET_STEP', payload: 'joining' });

    try {
      await joinParticipate.mutateAsync(code);
      dispatch({ type: 'SET_STEP', payload: 'success' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Impossible de rejoindre la sortie';
      dispatch({ type: 'SET_ERROR', payload: message });
    }
  }, [code, joinParticipate]);

  // Handle navigation to guest form
  const handleShowGuestForm = useCallback(() => {
    dispatch({ type: 'SET_STEP', payload: 'guest_form' });
  }, []);

  // Handle guest join submission
  const handleGuestSubmit = useCallback(async (data: GuestJoinInput) => {
    if (!event) return;

    dispatch({ type: 'SET_STEP', payload: 'joining' });

    try {
      const result = await guestJoin.mutateAsync({
        eventId: event.join.eventId,
        input: data,
      });

      // Store guest session (simulate - in real app, backend would return a token)
      // For now, we just mark the user as a guest in local auth state
      await signInAsGuest(`guest_${result.userId}`, result.userId);

      dispatch({ type: 'SET_STEP', payload: 'success' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Impossible de rejoindre la sortie';
      dispatch({ type: 'SET_ERROR', payload: message });
    }
  }, [event, guestJoin, signInAsGuest]);

  // Handle back to preview
  const handleBackToPreview = useCallback(() => {
    dispatch({ type: 'SET_STEP', payload: 'preview' });
  }, []);

  // Handle retry
  const handleRetry = useCallback(() => {
    dispatch({ type: 'RESET' });
    refetchEvent();
  }, [refetchEvent]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // Handle continue to event
  const handleContinue = useCallback(() => {
    if (event) {
      router.replace(`/event/${event.id}`);
    } else {
      router.replace('/(tabs)');
    }
  }, [router, event]);

  // Render based on step
  const renderContent = () => {
    switch (state.step) {
      case 'loading':
        return <JoinLoadingState />;

      case 'error':
        return (
          <ErrorState
            message={state.errorMessage || 'Une erreur est survenue'}
            onRetry={handleRetry}
            onBack={handleBack}
            hasSafeArea
          />
        );

      case 'success':
        return (
          <SuccessState
            title="Bienvenue !"
            message="Vous avez rejoint"
            subtitle={event?.title || 'la sortie'}
            actionLabel="Voir l'evenement"
            onAction={handleContinue}
            hasSafeArea
          />
        );

      case 'guest_form':
        if (!event) return <JoinLoadingState />;
        return (
          <GuestForm
            event={event}
            isJoining={guestJoin.isPending}
            onSubmit={handleGuestSubmit}
            onBack={handleBackToPreview}
          />
        );

      case 'joining':
        return <JoiningState />;

      case 'preview':
      default:
        if (!event) return <JoinLoadingState />;
        return (
          <EventPreview
            event={event}
            isAuthenticated={isAuthenticated}
            isJoining={joinParticipate.isPending}
            onJoinAsUser={handleJoinAsUser}
            onJoinAsGuest={handleShowGuestForm}
          />
        );
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: event?.title || 'Rejoindre',
          headerBackTitle: 'Retour',
        }}
      />
      {renderContent()}
    </>
  );
}

