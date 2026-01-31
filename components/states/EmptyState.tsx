import { View } from 'react-native';
import { Container, Typography, H3, Button } from '@/components/ui';

/**
 * Props for EmptyState component.
 */
interface EmptyStateProps {
  /**
   * Icon or emoji to display.
   * @default "📭"
   */
  icon?: string;

  /**
   * Title to display.
   */
  title: string;

  /**
   * Description text.
   */
  description?: string;

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
 * Standard empty state component.
 * Use this for consistent empty UI across the app.
 *
 * @example
 * // Basic usage
 * <EmptyState title="Aucun resultat" description="Essayez une autre recherche" />
 *
 * // With action button
 * <EmptyState
 *   icon="🏃"
 *   title="Aucune sortie"
 *   description="Creez votre premiere sortie"
 *   actionLabel="Creer une sortie"
 *   onAction={() => router.push('/event/create')}
 * />
 */
export function EmptyState({
  icon = '📭',
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondaryAction,
  hasSafeArea = false,
  className,
}: EmptyStateProps) {
  return (
    <Container
      isCenter
      padding="lg"
      hasSafeArea={hasSafeArea}
      className={`flex-1 ${className ?? ''}`}
    >
      <View className="items-center max-w-xs">
        {/* Icon */}
        <View className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 items-center justify-center mb-6">
          <Typography className="text-4xl">{icon}</Typography>
        </View>

        {/* Title */}
        <H3 className="text-center mb-2">{title}</H3>

        {/* Description */}
        {description && (
          <Typography color="muted" className="text-center mb-8">
            {description}
          </Typography>
        )}

        {/* Primary action */}
        {actionLabel && onAction && (
          <Button
            variant="primary"
            size="lg"
            isFullWidth
            onPress={onAction}
            accessibilityLabel={actionLabel}
          >
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
