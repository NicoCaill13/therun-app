import { View, Animated, Platform } from 'react-native';
import { useEffect, useRef, useMemo } from 'react';

// ============================================================================
// Component
// ============================================================================

export function Skeleton({ width, height, borderRadius = 8, className = '' }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  const style = useMemo(
    () => ({
      width,
      height,
      borderRadius,
    }),
    [width, height, borderRadius]
  );

  if (Platform.OS === 'web') {
    return (
      <View
        className={`bg-skeleton ${className}`}
        style={[
          style,
          {
            // @ts-expect-error - web only CSS animation
            animation: 'pulse 1.5s ease-in-out infinite',
          },
        ]}
      />
    );
  }

  return (
    <Animated.View className={`bg-skeleton ${className}`} style={[style, { opacity }]} />
  );
}

// ============================================================================
// Skeleton Variants
// ============================================================================

export function SkeletonText({
  lines = 3,
  className = '',
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <View className={`gap-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? '60%' : '100%'}
          height={14}
          borderRadius={4}
        />
      ))}
    </View>
  );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <View
      className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 gap-3 ${className}`}
    >
      <Skeleton width="100%" height={160} borderRadius={12} />
      <Skeleton width="70%" height={20} borderRadius={4} />
      <Skeleton width="50%" height={14} borderRadius={4} />
    </View>
  );
}

// ============================================================================
// Types
// ============================================================================

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  className?: string;
}
