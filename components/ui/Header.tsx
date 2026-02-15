import { View, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Typography } from './Typography';

// ============================================================================
// Component
// ============================================================================

export function Header({
  title,
  showBack = true,
  onBack,
  rightAction,
  className = '',
}: HeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const paddingTop = Platform.OS === 'web' ? 0 : insets.top;

  function handleBack() {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    }
  }

  return (
    <View
      className={`bg-background-light/80 dark:bg-background-dark/80 px-4 pb-3 ${className}`}
      style={[
        { paddingTop: paddingTop + 12 },
        Platform.OS === 'web'
          ? { backdropFilter: 'blur(12px)', position: 'sticky' as 'relative', top: 0, zIndex: 50 }
          : undefined,
      ]}
    >
      <View className="flex-row items-center justify-between min-h-[44px]">
        {showBack ? (
          <Pressable
            onPress={handleBack}
            className="w-10 h-10 items-center justify-center rounded-full active:bg-gray-200"
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <MaterialIcons name="arrow-back-ios" size={20} color="#0a181e" />
          </Pressable>
        ) : (
          <View className="w-10" />
        )}

        <Typography variant="h4" className="flex-1 text-center">
          {title}
        </Typography>

        {rightAction ? rightAction : <View className="w-10" />}
      </View>
    </View>
  );
}

// ============================================================================
// Types
// ============================================================================

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: ReactNode;
  className?: string;
}
