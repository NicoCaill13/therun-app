import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useReducer, useCallback } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Container, Typography, H1, Button } from '@/components/ui';
import { useAuth } from '@/lib/auth';

// ============================================================================
// Reducer
// ============================================================================

interface JoinState {
  status: 'loading' | 'error' | 'success';
  errorMessage: string | null;
}

type JoinAction =
  | { type: 'START_LOADING' }
  | { type: 'SUCCESS' }
  | { type: 'ERROR'; payload: string };

const initialState: JoinState = {
  status: 'loading',
  errorMessage: null,
};

function joinReducer(state: JoinState, action: JoinAction): JoinState {
  switch (action.type) {
    case 'START_LOADING':
      return { status: 'loading', errorMessage: null };

    case 'SUCCESS':
      return { status: 'success', errorMessage: null };

    case 'ERROR':
      return { status: 'error', errorMessage: action.payload };

    default:
      return state;
  }
}

// ============================================================================
// Component
// ============================================================================

/**
 * Join screen - Entry point for event join via deep link.
 * Route: /join/[code] or the-run://join/[code]
 *
 * Based on spec.md Phase 2.3 requirements:
 * - Sequence API: POST /auth/guest -> POST /events/join-by-code
 * - Session: JWT guest (24h) stored in Cookie/SessionStorage
 */
export default function JoinScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const { isAuthenticated, signInAsGuest } = useAuth();
  const [state, dispatch] = useReducer(joinReducer, initialState);

  const joinEvent = useCallback(async () => {
    dispatch({ type: 'START_LOADING' });

    try {
      // TODO: Implement actual API calls
      // 1. If not authenticated, create guest session
      // 2. Join event by code
      // 3. Navigate to event detail

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      dispatch({ type: 'SUCCESS' });

      // Navigate to event detail (placeholder)
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 1000);
    } catch {
      dispatch({ type: 'ERROR', payload: 'Impossible de rejoindre la sortie. Veuillez réessayer.' });
    }
  }, []);

  useEffect(() => {
    if (!code) {
      dispatch({ type: 'ERROR', payload: 'Code de sortie invalide.' });
      return;
    }

    joinEvent();
  }, [code, joinEvent]);

  const handleRetry = useCallback(() => {
    joinEvent();
  }, [joinEvent]);

  const handleBack = useCallback(() => {
    router.back();
  }, []);

  if (state.status === 'loading') {
    return (
      <Container isCenter hasSafeArea>
        <ActivityIndicator
          size="large"
          color="#16a34a"
          accessibilityLabel="Chargement"
        />
        <Typography className="mt-4" color="muted">
          Connexion à la sortie...
        </Typography>
        <Typography className="mt-2 text-lg font-mono" color="primary">
          {code}
        </Typography>
      </Container>
    );
  }

  if (state.status === 'error') {
    return (
      <Container isCenter hasSafeArea padding="lg">
        <View className="items-center">
          <View
            className="w-20 h-20 rounded-full bg-red-100 items-center justify-center mb-4"
            accessibilityRole="image"
            accessibilityLabel="Erreur"
          >
            <Typography className="text-4xl">❌</Typography>
          </View>
          <H1 className="text-center mb-2">Oups !</H1>
          <Typography color="muted" className="text-center mb-6">
            {state.errorMessage}
          </Typography>
          <Button variant="primary" onPress={handleRetry}>
            Réessayer
          </Button>
          <Button variant="ghost" onPress={handleBack} className="mt-2">
            Retour
          </Button>
        </View>
      </Container>
    );
  }

  return (
    <Container isCenter hasSafeArea>
      <View className="items-center">
        <View
          className="w-20 h-20 rounded-full bg-primary-100 items-center justify-center mb-4"
          accessibilityRole="image"
          accessibilityLabel="Succès"
        >
          <Typography className="text-4xl">✓</Typography>
        </View>
        <H1 className="text-center mb-2">Bienvenue !</H1>
        <Typography color="muted" className="text-center">
          Vous avez rejoint la sortie.
        </Typography>
      </View>
    </Container>
  );
}
