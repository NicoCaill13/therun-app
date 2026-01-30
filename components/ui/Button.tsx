import { Pressable, PressableProps, ActivityIndicator } from 'react-native';
import { ReactNode, useMemo } from 'react';
import { Typography } from './Typography';

// ============================================================================
// Constants
// ============================================================================

const VARIANT_CLASSES = {
  primary: 'bg-primary-600 active:bg-primary-700',
  secondary: 'bg-secondary-600 active:bg-secondary-700',
  outline: 'bg-transparent border-2 border-primary-600 active:bg-primary-50',
  ghost: 'bg-transparent active:bg-secondary-100',
  danger: 'bg-red-600 active:bg-red-700',
} as const;

const TEXT_COLOR_CLASSES = {
  primary: 'text-white',
  secondary: 'text-white',
  outline: 'text-primary-600',
  ghost: 'text-secondary-700 dark:text-secondary-300',
  danger: 'text-white',
} as const;

const DISABLED_CLASSES = {
  primary: 'bg-primary-300',
  secondary: 'bg-secondary-300',
  outline: 'border-secondary-300',
  ghost: 'bg-transparent',
  danger: 'bg-red-300',
} as const;

const SIZE_CLASSES = {
  sm: 'px-3 py-1.5',
  md: 'px-4 py-2.5',
  lg: 'px-6 py-3.5',
} as const;

const TEXT_SIZE_CLASSES = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
} as const;

const LOADER_COLORS = {
  primary: '#ffffff',
  secondary: '#ffffff',
  outline: '#16a34a',
  ghost: '#16a34a',
  danger: '#ffffff',
} as const;

// ============================================================================
// Component
// ============================================================================

/**
 * Button component with multiple variants and states.
 * Uses NativeWind for cross-platform styling.
 *
 * @example
 * <Button variant="primary" onPress={handleSubmit}>Submit</Button>
 * <Button variant="outline" size="sm">Cancel</Button>
 * <Button variant="primary" isLoading>Processing...</Button>
 */
export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  isFullWidth = false,
  className = '',
  accessibilityLabel,
  children,
  ...props
}: ButtonProps) {
  const hasDisabledState = isDisabled || isLoading;

  const combinedClasses = useMemo(() => {
    const baseClasses = 'rounded-xl items-center justify-center flex-row';
    const stateClasses = hasDisabledState ? DISABLED_CLASSES[variant] : VARIANT_CLASSES[variant];
    const widthClasses = isFullWidth ? 'w-full' : '';
    return `${baseClasses} ${stateClasses} ${SIZE_CLASSES[size]} ${widthClasses} ${className}`.trim();
  }, [variant, size, hasDisabledState, isFullWidth, className]);

  const textClasses = useMemo(() => {
    const colorClass = hasDisabledState ? 'text-secondary-400' : TEXT_COLOR_CLASSES[variant];
    return `${TEXT_SIZE_CLASSES[size]} font-semibold ${colorClass}`;
  }, [variant, size, hasDisabledState]);

  // Generate accessibility label if not provided
  const computedAccessibilityLabel = accessibilityLabel ?? (
    typeof children === 'string' ? children : undefined
  );

  return (
    <Pressable
      className={combinedClasses}
      disabled={hasDisabledState}
      accessibilityRole="button"
      accessibilityLabel={computedAccessibilityLabel}
      accessibilityState={{
        disabled: hasDisabledState,
        busy: isLoading,
      }}
      {...props}
    >
      {isLoading && (
        <ActivityIndicator
          size="small"
          color={LOADER_COLORS[variant]}
          className="mr-2"
        />
      )}
      {typeof children === 'string' ? (
        <Typography className={textClasses}>{children}</Typography>
      ) : (
        children
      )}
    </Pressable>
  );
}

// ============================================================================
// Types
// ============================================================================

export type ButtonVariant = keyof typeof VARIANT_CLASSES;
export type ButtonSize = keyof typeof SIZE_CLASSES;

interface ButtonProps extends Omit<PressableProps, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  isDisabled?: boolean;
  isFullWidth?: boolean;
  className?: string;
  children: ReactNode;
}
