import { createContext, useContext, useReducer, useCallback, useMemo, ReactNode } from 'react';
import { Modal, View, Pressable } from 'react-native';
import { Typography, H2, Button } from '@/components/ui';
import { shouldShowUpsell } from '@/lib/api/normalizeApiError';

// ============================================================================
// Constants
// ============================================================================

const FEATURES = [
  'Sorties illimitées',
  'Parcours personnalisés',
  'Statistiques avancées',
  'Support prioritaire',
] as const;

// ============================================================================
// Reducer
// ============================================================================

interface UpsellState {
  isVisible: boolean;
  errorMessage: string | null;
}

type UpsellAction =
  | { type: 'SHOW'; payload?: string }
  | { type: 'HIDE' };

const initialState: UpsellState = {
  isVisible: false,
  errorMessage: null,
};

function upsellReducer(state: UpsellState, action: UpsellAction): UpsellState {
  switch (action.type) {
    case 'SHOW':
      return {
        isVisible: true,
        errorMessage: action.payload ?? null,
      };

    case 'HIDE':
      return initialState;

    default:
      return state;
  }
}

// ============================================================================
// Context
// ============================================================================

interface UpsellModalContextValue {
  showUpsell: (error?: { kind: string; message: string }) => void;
  hideUpsell: () => void;
  isVisible: boolean;
}

const UpsellModalContext = createContext<UpsellModalContextValue | null>(null);

interface UpsellModalProviderProps {
  children: ReactNode;
}

/**
 * UpsellModalProvider component.
 * Provides a global modal for upselling premium plans when plan limits are reached.
 * Uses useReducer for predictable state management (per .cursorrules).
 *
 * @example
 * const { showUpsell } = useUpsellModal();
 *
 * try {
 *   await createEvent(data);
 * } catch (error) {
 *   const normalized = normalizeApiError(error);
 *   if (shouldShowUpsell(normalized)) {
 *     showUpsell(normalized);
 *   }
 * }
 */
export function UpsellModalProvider({ children }: UpsellModalProviderProps) {
  const [state, dispatch] = useReducer(upsellReducer, initialState);

  const showUpsell = useCallback((error?: { kind: string; message: string }) => {
    if (error && shouldShowUpsell(error as never)) {
      dispatch({ type: 'SHOW', payload: error.message });
    } else if (error) {
      dispatch({ type: 'SHOW', payload: error.message });
    } else {
      dispatch({ type: 'SHOW' });
    }
  }, []);

  const hideUpsell = useCallback(() => {
    dispatch({ type: 'HIDE' });
  }, []);

  const handleUpgrade = useCallback(() => {
    // TODO: Navigate to upgrade screen or open web browser
    console.log('Navigate to upgrade');
    hideUpsell();
  }, [hideUpsell]);

  const handleBackdropPress = useCallback(() => {
    hideUpsell();
  }, [hideUpsell]);

  const stopPropagation = useCallback((e: { stopPropagation: () => void }) => {
    e.stopPropagation();
  }, []);

  const value = useMemo<UpsellModalContextValue>(() => ({
    showUpsell,
    hideUpsell,
    isVisible: state.isVisible,
  }), [showUpsell, hideUpsell, state.isVisible]);

  return (
    <UpsellModalContext.Provider value={value}>
      {children}
      <Modal
        visible={state.isVisible}
        transparent
        animationType="fade"
        onRequestClose={hideUpsell}
        accessibilityViewIsModal
      >
        <Pressable
          className="flex-1 bg-black/50 items-center justify-center"
          onPress={handleBackdropPress}
          accessibilityRole="button"
          accessibilityLabel="Fermer la modale"
        >
          <Pressable
            className="bg-white dark:bg-secondary-800 rounded-2xl mx-6 p-6 w-full max-w-sm"
            onPress={stopPropagation}
            accessibilityLabel="Passer à Premium"
          >
            {/* Icon */}
            <View className="items-center mb-4">
              <View className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 items-center justify-center">
                <Typography className="text-3xl" accessibilityLabel="Éclair">⚡</Typography>
              </View>
            </View>

            {/* Title */}
            <H2 className="text-center mb-2">Passez à Premium</H2>

            {/* Message */}
            <Typography color="muted" className="text-center mb-6">
              {state.errorMessage ?? 'Vous avez atteint la limite de votre forfait gratuit. Passez à Premium pour débloquer toutes les fonctionnalités.'}
            </Typography>

            {/* Features list */}
            <View className="mb-6" accessible accessibilityLabel="Fonctionnalités Premium">
              {FEATURES.map((feature) => (
                <FeatureItem key={feature} text={feature} />
              ))}
            </View>

            {/* Actions */}
            <Button
              variant="primary"
              isFullWidth
              onPress={handleUpgrade}
              className="mb-3"
            >
              Découvrir Premium
            </Button>
            <Button
              variant="ghost"
              isFullWidth
              onPress={hideUpsell}
            >
              Plus tard
            </Button>
          </Pressable>
        </Pressable>
      </Modal>
    </UpsellModalContext.Provider>
  );
}

// ============================================================================
// Subcomponents
// ============================================================================

interface FeatureItemProps {
  text: string;
}

function FeatureItem({ text }: FeatureItemProps) {
  return (
    <View className="flex-row items-center mb-2" accessible accessibilityLabel={`Inclus: ${text}`}>
      <Typography className="text-primary-500 mr-2">✓</Typography>
      <Typography color="secondary">{text}</Typography>
    </View>
  );
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to access upsell modal context.
 * Must be used within UpsellModalProvider.
 */
export function useUpsellModal(): UpsellModalContextValue {
  const context = useContext(UpsellModalContext);

  if (!context) {
    throw new Error('useUpsellModal must be used within an UpsellModalProvider');
  }

  return context;
}
