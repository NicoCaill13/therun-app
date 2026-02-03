import { TextInput, TextInputProps, View } from 'react-native';
import { forwardRef, useMemo } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Typography } from './Typography';

// ============================================================================
// Constants
// ============================================================================

const SIZE_CLASSES = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-base',
  lg: 'px-4 py-4 text-lg',
} as const;

// ============================================================================
// Component
// ============================================================================

/**
 * Input component with label, error, and hint support.
 * Uses NativeWind for cross-platform styling.
 *
 * @example
 * <Input
 *   label="Email"
 *   placeholder="Enter your email"
 *   error={errors.email?.message}
 * />
 */
export const Input = forwardRef<TextInput, InputProps>(function Input(
  {
    label,
    error,
    hint,
    size = 'md',
    isDisabled = false,
    className = '',
    containerClassName = '',
    labelClassName = '',
    showErrorIcon = false,
    accessibilityLabel,
    ...props
  },
  ref
) {
  const hasError = Boolean(error);

  const combinedClasses = useMemo(() => {
    const baseClasses = 'rounded-xl border bg-white dark:bg-secondary-800';
    const borderClasses = hasError
      ? 'border-2 border-errorRed'
      : 'border-borderGrey dark:border-secondary-600';
    const disabledClasses = isDisabled ? 'bg-secondary-100 dark:bg-secondary-700 opacity-60' : '';
    const textClasses = 'text-secondary-900 dark:text-secondary-100';

    return `${baseClasses} ${borderClasses} ${disabledClasses} ${textClasses} ${SIZE_CLASSES[size]} ${className}`.trim();
  }, [hasError, isDisabled, size, className]);

  const labelClasses = labelClassName || undefined;

  const computedAccessibilityLabel = accessibilityLabel ?? label;

  return (
    <View className={containerClassName}>
      {label && (
        <Typography variant="label" className={`mb-1.5 ${labelClasses || ''}`.trim()}>
          {label}
        </Typography>
      )}
      <View className="relative">
        <TextInput
          ref={ref}
          className={combinedClasses}
          editable={!isDisabled}
          placeholderTextColor="#94a3b8"
          accessibilityLabel={computedAccessibilityLabel}
          accessibilityState={{
            disabled: isDisabled,
          }}
          accessibilityHint={hint}
          {...props}
        />
        {showErrorIcon && hasError && (
          <View className="absolute right-4 top-0 bottom-0 justify-center" pointerEvents="none">
            <MaterialIcons name="error" size={24} color="#E5484D" />
          </View>
        )}
      </View>
      {error && (
        <Typography
          variant="caption"
          color="error"
          className="mt-1"
          accessibilityRole="alert"
        >
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
  labelClassName?: string;
  showErrorIcon?: boolean;
}
