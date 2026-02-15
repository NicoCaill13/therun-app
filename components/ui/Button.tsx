import { Pressable, PressableProps, ActivityIndicator, Platform } from 'react-native';
import { ReactNode, useMemo } from 'react';
import { Typography } from './Typography';

// ============================================================================
// Constants - Aligned with Stitch maquettes
// ============================================================================

const VARIANT_CLASSES = {
  primary: 'bg-charcoal active:scale-[0.98]',
  secondary: 'bg-transparent border-2 border-charcoal active:bg-gray-50',
  outline: 'bg-transparent border border-border-grey active:bg-gray-50',
  ghost: 'bg-transparent active:bg-gray-100',
  danger: 'bg-error-red active:scale-[0.98]',
  link: 'bg-transparent',
} as const;

const TEXT_COLOR_CLASSES = {
  primary: 'text-white',
  secondary: 'text-primary dark:text-white',
  outline: 'text-primary dark:text-white',
  ghost: 'text-gray-700 dark:text-gray-300',
  danger: 'text-white',
  link: 'text-brand-orange',
} as const;

const DISABLED_CLASSES = {
  primary: 'bg-gray-300',
  secondary: 'border-gray-300',
  outline: 'border-gray-200',
  ghost: 'bg-transparent',
  danger: 'bg-gray-300',
  link: 'bg-transparent',
} as const;

const SIZE_CLASSES = {
  sm: 'h-10 px-4',
  md: 'h-12 px-5',
  lg: 'h-14 px-6',
  xl: 'h-16 px-8',
} as const;

const TEXT_SIZE_CLASSES = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-lg',
} as const;

// ============================================================================
// Component
// ============================================================================

export function Button({
  variant = 'primary',
  size = 'lg',
  isLoading = false,
  isDisabled = false,
  isFullWidth = true,
  className = '',
  accessibilityLabel,
  children,
  leftIcon,
  ...props
}: ButtonProps) {
  const hasDisabledState = isDisabled || isLoading;

  const combinedClasses = useMemo(() => {
    const baseClasses = 'rounded-xl items-center justify-center flex-row';
    const stateClasses = hasDisabledState ? DISABLED_CLASSES[variant] : VARIANT_CLASSES[variant];
    const widthClasses = isFullWidth ? 'w-full' : '';
    const shadowClasses = variant === 'primary' && !hasDisabledState ? 'shadow-lg' : '';
    return `${baseClasses} ${stateClasses} ${SIZE_CLASSES[size]} ${widthClasses} ${shadowClasses} ${className}`.trim();
  }, [variant, size, hasDisabledState, isFullWidth, className]);

  const textClasses = useMemo(() => {
    const colorClass = hasDisabledState ? 'text-gray-400' : TEXT_COLOR_CLASSES[variant];
    const weightClass = variant === 'link' ? 'font-sans-medium' : 'font-sans-bold';
    const decorationClass = variant === 'link' ? 'underline underline-offset-4' : '';
    return `${TEXT_SIZE_CLASSES[size]} ${weightClass} ${colorClass} ${decorationClass}`;
  }, [variant, size, hasDisabledState]);

  const computedAccessibilityLabel =
    accessibilityLabel ?? (typeof children === 'string' ? children : undefined);

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
      style={
        Platform.OS !== 'web'
          ? undefined
          : { cursor: hasDisabledState ? 'not-allowed' : 'pointer' }
      }
      {...props}
    >
      {isLoading && (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' ? '#ffffff' : '#0a181e'}
          className="mr-2"
        />
      )}
      {leftIcon && !isLoading && leftIcon}
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
  leftIcon?: ReactNode;
}
