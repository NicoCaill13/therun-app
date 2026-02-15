import { TextInput, TextInputProps, View, Platform } from 'react-native';
import { forwardRef, useMemo } from 'react';
import { Typography } from './Typography';

// ============================================================================
// Constants - Aligned with Stitch maquettes
// ============================================================================

const SIZE_CLASSES = {
  sm: 'h-10 px-3 text-sm',
  md: 'h-12 px-4 text-base',
  lg: 'h-14 px-4 text-base',
} as const;

// ============================================================================
// Component
// ============================================================================

export const Input = forwardRef<TextInput, InputProps>(function Input(
  {
    label,
    error,
    hint,
    size = 'lg',
    isDisabled = false,
    className = '',
    containerClassName = '',
    accessibilityLabel,
    rightIcon,
    ...props
  },
  ref
) {
  const hasError = Boolean(error);

  const combinedClasses = useMemo(() => {
    const baseClasses =
      'rounded-xl bg-white dark:bg-gray-900 text-primary dark:text-white font-sans';
    const borderClasses = hasError
      ? 'border-2 border-error-red'
      : 'border border-border-grey dark:border-gray-700';
    const disabledClasses = isDisabled ? 'bg-gray-100 dark:bg-gray-800 opacity-60' : '';

    return `${baseClasses} ${borderClasses} ${disabledClasses} ${SIZE_CLASSES[size]} ${className}`.trim();
  }, [hasError, isDisabled, size, className]);

  const computedAccessibilityLabel = accessibilityLabel ?? label;

  return (
    <View className={containerClassName}>
      {label && (
        <Typography variant="label" color="secondary" className="mb-2">
          {label}
        </Typography>
      )}
      <View className="relative">
        <TextInput
          ref={ref}
          className={combinedClasses}
          editable={!isDisabled}
          placeholderTextColor="#9ca3af"
          accessibilityLabel={computedAccessibilityLabel}
          accessibilityState={{ disabled: isDisabled }}
          accessibilityHint={hint}
          style={Platform.OS === 'web' ? { outlineStyle: 'none' } : undefined}
          {...props}
        />
        {rightIcon && (
          <View className="absolute right-4 top-0 bottom-0 justify-center" pointerEvents="none">
            {rightIcon}
          </View>
        )}
      </View>
      {error && (
        <Typography variant="caption" color="error" className="mt-1" accessibilityRole="alert">
          {error}
        </Typography>
      )}
      {hint && !error && (
        <Typography variant="caption" color="muted" className="mt-1">
          {hint}
        </Typography>
      )}
    </View>
  );
});

// ============================================================================
// Types
// ============================================================================

export type InputSize = keyof typeof SIZE_CLASSES;

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  size?: InputSize;
  isDisabled?: boolean;
  className?: string;
  containerClassName?: string;
  rightIcon?: React.ReactNode;
}
