import { View } from 'react-native';
import { ReactNode, useMemo } from 'react';
import { Typography } from './Typography';

// ============================================================================
// Constants
// ============================================================================

const VARIANT_CLASSES = {
  orange: 'bg-brand-orange-bg',
  green: 'bg-green-100',
  red: 'bg-red-100',
  gray: 'bg-gray-100 dark:bg-gray-800',
  charcoal: 'bg-charcoal',
} as const;

const TEXT_COLOR_CLASSES = {
  orange: 'text-brand-orange',
  green: 'text-green-700',
  red: 'text-error-red',
  gray: 'text-gray-600 dark:text-gray-400',
  charcoal: 'text-white',
} as const;

// ============================================================================
// Component
// ============================================================================

export function Badge({ variant = 'orange', label, className = '', icon }: BadgeProps) {
  const combinedClasses = useMemo(() => {
    const baseClasses = 'rounded-full px-3 h-7 items-center justify-center flex-row';
    return `${baseClasses} ${VARIANT_CLASSES[variant]} ${className}`.trim();
  }, [variant, className]);

  return (
    <View className={combinedClasses}>
      {icon && <View className="mr-1">{icon}</View>}
      <Typography
        variant="caption"
        className={`font-sans-semibold tracking-wider uppercase ${TEXT_COLOR_CLASSES[variant]}`}
      >
        {label}
      </Typography>
    </View>
  );
}

// ============================================================================
// Types
// ============================================================================

export type BadgeVariant = keyof typeof VARIANT_CLASSES;

interface BadgeProps {
  variant?: BadgeVariant;
  label: string;
  className?: string;
  icon?: ReactNode;
}
