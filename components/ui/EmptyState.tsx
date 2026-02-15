import { View } from 'react-native';
import { ReactNode } from 'react';
import { Typography } from './Typography';

// ============================================================================
// Component
// ============================================================================

export function EmptyState({
  title,
  description,
  icon,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <View className={`flex-1 items-center justify-center px-6 py-10 ${className}`}>
      {icon && <View className="mb-6">{icon}</View>}
      <Typography variant="h2" className="text-center mb-2">
        {title}
      </Typography>
      {description && (
        <Typography variant="body" color="secondary" className="text-center mb-8">
          {description}
        </Typography>
      )}
      {action && <View className="w-full">{action}</View>}
    </View>
  );
}

// ============================================================================
// Types
// ============================================================================

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}
