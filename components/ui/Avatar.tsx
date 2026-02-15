import { View, Image } from 'react-native';
import { useMemo } from 'react';
import { Typography } from './Typography';

// ============================================================================
// Constants
// ============================================================================

const SIZE_MAP = {
  sm: { container: 'w-8 h-8', text: 'text-xs', imageSize: 32 },
  md: { container: 'w-10 h-10', text: 'text-sm', imageSize: 40 },
  lg: { container: 'w-14 h-14', text: 'text-lg', imageSize: 56 },
  xl: { container: 'w-20 h-20', text: 'text-2xl', imageSize: 80 },
} as const;

const COLORS = [
  'bg-brand-orange-bg',
  'bg-blue-100',
  'bg-green-100',
  'bg-purple-100',
  'bg-yellow-100',
  'bg-pink-100',
];

// ============================================================================
// Component
// ============================================================================

export function Avatar({ uri, name, size = 'md', className = '' }: AvatarProps) {
  const sizeConfig = SIZE_MAP[size];

  const initials = useMemo(() => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  }, [name]);

  const bgColor = useMemo(() => {
    if (!name) return COLORS[0];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return COLORS[hash % COLORS.length];
  }, [name]);

  if (uri) {
    return (
      <Image
        source={{ uri }}
        className={`${sizeConfig.container} rounded-full ${className}`}
        style={{ width: sizeConfig.imageSize, height: sizeConfig.imageSize }}
        accessibilityLabel={name ?? 'User avatar'}
      />
    );
  }

  return (
    <View
      className={`${sizeConfig.container} ${bgColor} rounded-full items-center justify-center ${className}`}
    >
      <Typography
        className={`${sizeConfig.text} font-sans-bold text-gray-700`}
      >
        {initials}
      </Typography>
    </View>
  );
}

// ============================================================================
// Types
// ============================================================================

export type AvatarSize = keyof typeof SIZE_MAP;

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: AvatarSize;
  className?: string;
}
