import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Typography } from '@/components/ui';
import { useColorScheme } from '@/components/useColorScheme';

// ============================================================================
// Home Hub Loading Header (design: TopAppBar with menu + THE RUN + account)
// ============================================================================

function HomeHubLoadingHeader() {
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#fff' : '#0B1220';

  return (
    <View className="flex-row items-center bg-backgroundLight dark:bg-backgroundDark px-4 pb-2 justify-between">
      <View className="w-12 h-12 items-center justify-center">
        <MaterialIcons name="menu" size={24} color={iconColor} />
      </View>
      <Typography className="text-charcoal dark:text-white text-lg font-bold tracking-tight flex-1 text-center">
        THE RUN
      </Typography>
      <View className="w-12 items-end justify-center">
        <MaterialIcons name="account-circle" size={24} color={iconColor} />
      </View>
    </View>
  );
}

// ============================================================================
// Home Hub Loading State (skeleton matching home empty layout)
// ============================================================================

export function HomeHubLoadingState() {
  return (
    <SafeAreaView
      className="flex-1 bg-backgroundLight dark:bg-backgroundDark"
      edges={['top']}
    >
      <HomeHubLoadingHeader />

      <View className="flex-1 px-4 pt-6">
        <View className="h-10 w-3/4 bg-skeleton dark:bg-white/10 rounded-lg mb-3" />
        <View className="h-4 w-1/2 bg-skeleton dark:bg-white/10 rounded-lg mb-8" />
        <View className="w-full h-16 bg-skeleton dark:bg-white/10 rounded-xl mb-10" />

        <View className="h-7 w-40 bg-skeleton dark:bg-white/10 rounded-lg mb-4" />
        <View className="w-full bg-white dark:bg-white/5 rounded-xl p-6 border border-borderGrey dark:border-white/10 mb-6">
          <View className="h-3 w-full bg-skeleton dark:bg-white/10 rounded-full mb-4" />
          <View className="h-3 w-5/6 bg-skeleton dark:bg-white/10 rounded-full mb-4" />
          <View className="h-3 w-4/6 bg-skeleton dark:bg-white/10 rounded-full" />
        </View>

        <View className="w-full bg-white dark:bg-white/5 rounded-xl p-6 border border-borderGrey dark:border-white/10">
          <View className="flex-row items-center gap-4 mb-4">
            <View className="w-10 h-10 bg-skeleton dark:bg-white/10 rounded-full" />
            <View className="flex-1 gap-2">
              <View className="h-3 w-1/3 bg-skeleton dark:bg-white/10 rounded-full" />
              <View className="h-2 w-1/4 bg-skeleton dark:bg-white/10 rounded-full" />
            </View>
          </View>
          <View className="h-24 w-full bg-skeleton dark:bg-white/10 rounded-lg" />
        </View>
      </View>
    </SafeAreaView>
  );
}
