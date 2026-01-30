import { View, ViewProps, ScrollView, ScrollViewProps } from 'react-native';
import { ReactNode, useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ============================================================================
// Constants
// ============================================================================

const PADDING_CLASSES = {
  none: '',
  sm: 'px-2 py-2',
  md: 'px-4 py-4',
  lg: 'px-6 py-6',
} as const;

// ============================================================================
// Container Component
// ============================================================================

/**
 * Container component for consistent layout.
 * Supports safe area insets and padding variants.
 *
 * @example
 * <Container padding="md" hasSafeArea>
 *   <Typography variant="h1">Page Content</Typography>
 * </Container>
 */
export function Container({
  padding = 'md',
  hasSafeArea = false,
  safeAreaEdges = ['top', 'bottom'],
  isCenter = false,
  className = '',
  children,
  style,
  ...props
}: ContainerProps) {
  const insets = useSafeAreaInsets();

  const safeAreaStyle = useMemo(() => {
    if (!hasSafeArea) return {};

    return {
      paddingTop: safeAreaEdges.includes('top') ? insets.top : 0,
      paddingBottom: safeAreaEdges.includes('bottom') ? insets.bottom : 0,
      paddingLeft: safeAreaEdges.includes('left') ? insets.left : 0,
      paddingRight: safeAreaEdges.includes('right') ? insets.right : 0,
    };
  }, [hasSafeArea, safeAreaEdges, insets]);

  const combinedClasses = useMemo(() => {
    const baseClasses = 'flex-1 bg-white dark:bg-secondary-900';
    const centerClasses = isCenter ? 'items-center justify-center' : '';
    return `${baseClasses} ${PADDING_CLASSES[padding]} ${centerClasses} ${className}`.trim();
  }, [padding, isCenter, className]);

  return (
    <View
      className={combinedClasses}
      style={[safeAreaStyle, style]}
      {...props}
    >
      {children}
    </View>
  );
}

// ============================================================================
// ScrollContainer Component
// ============================================================================

/**
 * Scrollable container component.
 * Useful for long content that may exceed screen height.
 *
 * @example
 * <ScrollContainer padding="md" hasSafeArea>
 *   <Typography variant="h1">Long Form</Typography>
 * </ScrollContainer>
 */
export function ScrollContainer({
  padding = 'md',
  hasSafeArea = false,
  safeAreaEdges = ['top', 'bottom'],
  className = '',
  contentClassName = '',
  children,
  style,
  contentContainerStyle,
  ...props
}: ScrollContainerProps) {
  const insets = useSafeAreaInsets();

  const safeAreaStyle = useMemo(() => {
    if (!hasSafeArea) return {};

    return {
      paddingTop: safeAreaEdges.includes('top') ? insets.top : 0,
      paddingBottom: safeAreaEdges.includes('bottom') ? insets.bottom : 0,
      paddingLeft: safeAreaEdges.includes('left') ? insets.left : 0,
      paddingRight: safeAreaEdges.includes('right') ? insets.right : 0,
    };
  }, [hasSafeArea, safeAreaEdges, insets]);

  const combinedClasses = useMemo(() => {
    const baseClasses = 'flex-1 bg-white dark:bg-secondary-900';
    return `${baseClasses} ${className}`.trim();
  }, [className]);

  const contentClasses = useMemo(() => {
    return `${PADDING_CLASSES[padding]} ${contentClassName}`.trim();
  }, [padding, contentClassName]);

  return (
    <ScrollView
      className={combinedClasses}
      style={style}
      contentContainerStyle={[safeAreaStyle, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      {...props}
    >
      <View className={contentClasses}>{children}</View>
    </ScrollView>
  );
}

// ============================================================================
// Types
// ============================================================================

export type ContainerPadding = keyof typeof PADDING_CLASSES;

type SafeAreaEdge = 'top' | 'bottom' | 'left' | 'right';

interface ContainerProps extends ViewProps {
  padding?: ContainerPadding;
  hasSafeArea?: boolean;
  safeAreaEdges?: SafeAreaEdge[];
  isCenter?: boolean;
  className?: string;
  children: ReactNode;
}

interface ScrollContainerProps extends ScrollViewProps {
  padding?: ContainerPadding;
  hasSafeArea?: boolean;
  safeAreaEdges?: SafeAreaEdge[];
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}
