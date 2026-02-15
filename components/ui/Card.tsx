import { View, ViewProps, Pressable, PressableProps } from 'react-native';
import { ReactNode, useMemo } from 'react';

// ============================================================================
// Constants
// ============================================================================

const PADDING_CLASSES = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
} as const;

// ============================================================================
// Card Component
// ============================================================================

export function Card({
  padding = 'md',
  className = '',
  children,
  ...props
}: CardProps) {
  const combinedClasses = useMemo(() => {
    const baseClasses =
      'bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800';
    return `${baseClasses} ${PADDING_CLASSES[padding]} ${className}`.trim();
  }, [padding, className]);

  return (
    <View className={combinedClasses} {...props}>
      {children}
    </View>
  );
}

// ============================================================================
// Pressable Card Component
// ============================================================================

export function PressableCard({
  padding = 'md',
  className = '',
  children,
  ...props
}: PressableCardProps) {
  const combinedClasses = useMemo(() => {
    const baseClasses =
      'bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 active:scale-[0.99]';
    return `${baseClasses} ${PADDING_CLASSES[padding]} ${className}`.trim();
  }, [padding, className]);

  return (
    <Pressable className={combinedClasses} {...props}>
      {children}
    </Pressable>
  );
}

// ============================================================================
// Types
// ============================================================================

export type CardPadding = keyof typeof PADDING_CLASSES;

interface CardProps extends ViewProps {
  padding?: CardPadding;
  className?: string;
  children: ReactNode;
}

interface PressableCardProps extends PressableProps {
  padding?: CardPadding;
  className?: string;
  children: ReactNode;
}
