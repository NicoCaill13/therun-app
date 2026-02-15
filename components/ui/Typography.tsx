import { Text, TextProps, AccessibilityRole } from 'react-native';
import { ReactNode, useMemo } from 'react';

// ============================================================================
// Constants - Aligned with Stitch maquettes (Inter font, navy/orange palette)
// ============================================================================

const VARIANT_CLASSES = {
  h1: 'text-3xl font-sans-extrabold tracking-tight',
  h2: 'text-2xl font-sans-bold tracking-tight',
  h3: 'text-xl font-sans-semibold',
  h4: 'text-lg font-sans-semibold',
  body: 'text-base font-sans',
  bodySmall: 'text-sm font-sans',
  caption: 'text-xs font-sans',
  label: 'text-xs font-sans-semibold uppercase tracking-widest',
} as const;

const COLOR_CLASSES = {
  default: 'text-primary dark:text-white',
  secondary: 'text-gray-500 dark:text-gray-400',
  muted: 'text-gray-400 dark:text-gray-500',
  error: 'text-error-red',
  orange: 'text-brand-orange',
  white: 'text-white',
  inherit: '',
} as const;

const HEADING_VARIANTS = new Set(['h1', 'h2', 'h3', 'h4']);

// ============================================================================
// Component
// ============================================================================

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
