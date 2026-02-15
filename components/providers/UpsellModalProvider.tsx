import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { View, Pressable, Modal, Platform } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Typography, Button } from '@/components/ui';

// ============================================================================
// Context
// ============================================================================

interface UpsellContextValue {
  showUpsell: () => void;
  hideUpsell: () => void;
}

const UpsellContext = createContext<UpsellContextValue | null>(null);

export function useUpsellModal(): UpsellContextValue {
  const ctx = useContext(UpsellContext);
  if (!ctx) throw new Error('useUpsellModal must be used within UpsellModalProvider');
  return ctx;
}

// ============================================================================
// Provider (maquette: premium_plan_upsell_modal)
// ============================================================================

export function UpsellModalProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);

  const showUpsell = useCallback(() => setIsVisible(true), []);
  const hideUpsell = useCallback(() => setIsVisible(false), []);

  return (
    <UpsellContext.Provider value={{ showUpsell, hideUpsell }}>
      {children}
      <Modal
        visible={isVisible}
        transparent
        animationType="slide"
        onRequestClose={hideUpsell}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View
            className={`bg-white dark:bg-gray-900 rounded-t-3xl px-6 pt-8 pb-10 ${
              Platform.OS === 'web' ? 'max-w-md mx-auto w-full' : ''
            }`}
          >
            {/* Drag handle */}
            <View className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-6" />

            {/* Icon */}
            <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mx-auto mb-4">
              <MaterialIcons name="workspace-premium" size={32} color="#0a181e" />
            </View>

            <Typography variant="h2" className="text-center mb-6">
              Unlock unlimited events
            </Typography>

            {/* Features */}
            <View className="gap-4 mb-8">
              <UpsellFeature text="Create unlimited weekly runs" />
              <UpsellFeature text="Advanced route analytics" />
              <UpsellFeature text="Custom pacer assignments" />
            </View>

            {/* Buttons */}
            <Button onPress={hideUpsell}>Upgrade to Pro</Button>
            <Pressable className="mt-4" onPress={hideUpsell}>
              <Typography
                variant="body"
                color="secondary"
                className="text-center font-sans-medium"
              >
                Not now
              </Typography>
            </Pressable>

            <Typography variant="caption" color="muted" className="text-center mt-4">
              LIMIT REACHED - PLAN 403
            </Typography>
          </View>
        </View>
      </Modal>
    </UpsellContext.Provider>
  );
}

function UpsellFeature({ text }: { text: string }) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="w-6 h-6 rounded-full bg-brand-orange items-center justify-center">
        <MaterialIcons name="check" size={14} color="#ffffff" />
      </View>
      <Typography variant="body" className="font-sans-medium">
        {text}
      </Typography>
    </View>
  );
}
