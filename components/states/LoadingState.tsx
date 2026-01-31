import { ActivityIndicator, View } from 'react-native';
import { Container, Typography } from '@/components/ui';

/**
 * Props for LoadingState component.
 */
interface LoadingStateProps {
  /**
   * Loading message to display.
   * @default "Chargement..."
   */
  message?: string;

  /**
   * Size of the activity indicator.
   * @default "large"
   */
  size?: 'small' | 'large';

  /**
   * Whether to include safe area padding.
   * @default false
   */
  hasSafeArea?: boolean;

  /**
   * Additional className for the container.
   */
  className?: string;
}

/**
 * Standard loading state component.
 * Use this for consistent loading UI across the app.
 *
 * @example
 * // Basic usage
 * <LoadingState />
 *
 * // With custom message
 * <LoadingState message="Chargement de l'evenement..." />
 *
 * // In a screen with safe area
 * <LoadingState hasSafeArea />
 */
export function LoadingState({
  message = 'Chargement...',
  size = 'large',
  hasSafeArea = false,
  className,
}: LoadingStateProps) {
  return (
    <Container
      isCenter
      padding="lg"
      hasSafeArea={hasSafeArea}
      className={className}
    >
      <ActivityIndicator
        size={size}
        color="#16a34a"
        accessibilityLabel={message}
      />
      {message && (
        <Typography color="muted" className="mt-4">
          {message}
        </Typography>
      )}
    </Container>
  );
}
