import { Text, TextProps, AccessibilityRole } from 'react-native';
import { ReactNode, useMemo } from 'react';

// ============================================================================
// Constants
// ============================================================================

const VARIANT_CLASSES = {
  h1: 'text-3xl font-bold',
  h2: 'text-2xl font-bold',
  h3: 'text-xl font-semibold',
  h4: 'text-lg font-semibold',
  body: 'text-base',
  bodySmall: 'text-sm',
  caption: 'text-xs',
  label: 'text-sm font-medium',
} as const;

const COLOR_CLASSES = {
  default: 'text-secondary-900 dark:text-secondary-100',
  primary: 'text-primary-600 dark:text-primary-400',
  secondary: 'text-secondary-600 dark:text-secondary-400',
  muted: 'text-secondary-400 dark:text-secondary-500',
  error: 'text-red-600 dark:text-red-400',
  success: 'text-green-600 dark:text-green-400',
} as const;

const HEADING_VARIANTS = new Set(['h1', 'h2', 'h3', 'h4']);

// ============================================================================
// Component
// ============================================================================

/**
 * Typography component for consistent text styling.
 * Uses NativeWind for cross-platform styling.
 * Automatically sets accessibilityRole="header" for heading variants.
 *
 * @example
 * <Typography variant="h1">Page Title</Typography>
 * <Typography variant="body" color="muted">Description text</Typography>
 */
export function Typography({
  variant = 'body',
  color = 'default',
  className = '',
  accessibilityRole,
  children,
  ...props
}: TypographyProps) {
  const combinedClasses = useMemo(() => {
    const baseClasses = `${VARIANT_CLASSES[variant]} ${COLOR_CLASSES[color]}`;
    return `${baseClasses} ${className}`.trim();
  }, [variant, color, className]);

  // Auto-set header role for heading variants
  const computedAccessibilityRole: AccessibilityRole | undefined =
    accessibilityRole ?? (HEADING_VARIANTS.has(variant) ? 'header' : undefined);

  return (
    <Text
      className={combinedClasses}
      accessibilityRole={computedAccessibilityRole}
      {...props}
    >
      {children}
    </Text>
  );
}

// ============================================================================
// Shorthand Components
// ============================================================================

export function H1(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="h1" {...props} />;
}

export function H2(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="h2" {...props} />;
}

export function H3(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="h3" {...props} />;
}

export function H4(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="h4" {...props} />;
}

export function BodyText(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="body" {...props} />;
}

export function Caption(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="caption" {...props} />;
}

export function Label(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="label" {...props} />;
}

// ============================================================================
// Types
// ============================================================================

export type TypographyVariant = keyof typeof VARIANT_CLASSES;
export type TypographyColor = keyof typeof COLOR_CLASSES;

interface TypographyProps extends Omit<TextProps, 'children'> {
  variant?: TypographyVariant;
  color?: TypographyColor;
  className?: string;
  children: ReactNode;
}
