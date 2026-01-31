import { View } from 'react-native';
import { Container, Typography, H3, Button } from '@/components/ui';

/**
 * Props for SuccessState component.
 */
interface SuccessStateProps {
  /**
   * Title to display.
   * @default "Succes !"
   */
  title?: string;

  /**
   * Primary message or description.
   */
  message?: string;

  /**
   * Secondary message (often the item name/title).
   */
  subtitle?: string;

  /**
   * Icon or emoji to display.
   * @default "✓"
   */
  icon?: string;

  /**
   * Primary action button label.
   */
  actionLabel?: string;

  /**
   * Callback for primary action.
   */
  onAction?: () => void;

  /**
   * Secondary action button label.
   */
  secondaryLabel?: string;

  /**
   * Callback for secondary action.
   */
  onSecondaryAction?: () => void;

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
 * Standard success state component.
 * Use this for consistent success UI across the app.
 *
 * @example
 * // Basic usage
 * <SuccessState
 *   title="Bienvenue !"
 *   message="Vous avez rejoint"
 *   subtitle="Course du dimanche"
 *   actionLabel="Voir l'evenement"
 *   onAction={() => router.push('/event/123')}
 * />
 */
export function SuccessState({
  title = 'Succes !',
  message,
  subtitle,
  icon = '✓',
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondaryAction,
  hasSafeArea = false,
  className,
}: SuccessStateProps) {
  return (
    <Container
      isCenter
      hasSafeArea={hasSafeArea}
      padding="lg"
      className={className}
    >
      <View className="items-center max-w-xs">
        {/* Success icon */}
        <View className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mb-4">
          <Typography className="text-4xl">{icon}</Typography>
        </View>

        {/* Title */}
        <H3 className="text-center mb-2">{title}</H3>

        {/* Message */}
        {message && (
          <Typography color="muted" className="text-center mb-2">
            {message}
          </Typography>
        )}

        {/* Subtitle */}
        {subtitle && (
          <Typography className="text-center font-semibold mb-6">
            "{subtitle}"
          </Typography>
        )}

        {/* Primary action */}
        {actionLabel && onAction && (
          <Button variant="primary" size="lg" isFullWidth onPress={onAction}>
            {actionLabel}
          </Button>
        )}

        {/* Secondary action */}
        {secondaryLabel && onSecondaryAction && (
          <Button
            variant="ghost"
            size="lg"
            isFullWidth
            onPress={onSecondaryAction}
            className="mt-3"
          >
            {secondaryLabel}
          </Button>
        )}
      </View>
    </Container>
  );
}
