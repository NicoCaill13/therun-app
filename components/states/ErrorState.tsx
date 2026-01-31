import { View } from 'react-native';
import { Container, Typography, H3, Button } from '@/components/ui';

/**
 * Props for ErrorState component.
 */
interface ErrorStateProps {
  /**
   * Error message to display.
   */
  message: string;

  /**
   * Callback for retry action.
   */
  onRetry?: () => void;

  /**
   * Callback for back navigation.
   */
  onBack?: () => void;

  /**
   * Title to display above the error message.
   * @default "Oups !"
   */
  title?: string;

  /**
   * Retry button label.
   * @default "Reessayer"
   */
  retryLabel?: string;

  /**
   * Back button label.
   * @default "Retour"
   */
  backLabel?: string;

  /**
   * Whether to include safe area padding.
   * @default false
   */
  hasSafeArea?: boolean;

  /**
   * Variant of the error display.
   * - "full": Full screen with icon and buttons
   * - "compact": Just message and retry button
   * @default "full"
   */
  variant?: 'full' | 'compact';

  /**
   * Additional className for the container.
   */
  className?: string;
}

/**
 * Standard error state component.
 * Use this for consistent error UI across the app.
 *
 * @example
 * // Basic usage
 * <ErrorState message="Une erreur est survenue" onRetry={handleRetry} />
 *
 * // With back button
 * <ErrorState
 *   message="Evenement introuvable"
 *   onRetry={refetch}
 *   onBack={() => router.back()}
 * />
 *
 * // Compact variant
 * <ErrorState message={error.message} onRetry={refetch} variant="compact" />
 */
export function ErrorState({
  message,
  onRetry,
  onBack,
  title = 'Oups !',
  retryLabel = 'Reessayer',
  backLabel = 'Retour',
  hasSafeArea = false,
  variant = 'full',
  className,
}: ErrorStateProps) {
  if (variant === 'compact') {
    return (
      <Container isCenter padding="lg" className={className}>
        <Typography color="error" className="text-center mb-4">
          {message}
        </Typography>
        {onRetry && (
          <Button variant="outline" onPress={onRetry}>
            {retryLabel}
          </Button>
        )}
      </Container>
    );
  }

  return (
    <Container
      isCenter
      hasSafeArea={hasSafeArea}
      padding="lg"
      className={className}
    >
      <View className="items-center max-w-xs">
        {/* Error icon */}
        <View className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 items-center justify-center mb-4">
          <Typography className="text-4xl">!</Typography>
        </View>

        {/* Title */}
        <H3 className="text-center mb-2">{title}</H3>

        {/* Message */}
        <Typography color="muted" className="text-center mb-6">
          {message}
        </Typography>

        {/* Actions */}
        {onRetry && (
          <Button
            variant="primary"
            size="lg"
            isFullWidth
            onPress={onRetry}
            className="mb-3"
          >
            {retryLabel}
          </Button>
        )}

        {onBack && (
          <Button variant="ghost" size="lg" isFullWidth onPress={onBack}>
            {backLabel}
          </Button>
        )}
      </View>
    </Container>
  );
}
