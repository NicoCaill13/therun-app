import { View, Platform } from 'react-native';
import { ReactNode, useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ============================================================================
// Component
// ============================================================================

export function BottomBar({ children, className = '' }: BottomBarProps) {
  const insets = useSafeAreaInsets();

  const paddingBottom = Platform.OS === 'web' ? 16 : Math.max(insets.bottom, 16);

  const combinedClasses = useMemo(() => {
    const baseClasses =
      'bg-white/95 dark:bg-background-dark/95 border-t border-gray-100 dark:border-gray-800 px-4 pt-4';
    const webClasses =
      Platform.OS === 'web'
        ? 'max-w-md mx-auto w-full'
        : '';
    return `${baseClasses} ${webClasses} ${className}`.trim();
  }, [className]);

  return (
    <View
      className={combinedClasses}
      style={[
        { paddingBottom },
        Platform.OS === 'web'
          ? { backdropFilter: 'blur(16px)' }
          : undefined,
      ]}
    >
      {children}
    </View>
  );
}

// ============================================================================
// Types
// ============================================================================

interface BottomBarProps {
  children: ReactNode;
  className?: string;
}
