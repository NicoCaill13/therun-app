import { useMemo } from 'react';
import { View, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Typography } from '@/components/ui';
import { useColorScheme } from '@/components/useColorScheme';

const SCROLL_BOTTOM_EXTRA_PADDING = 48;

// ============================================================================
// Home Hub Header (design: TopAppBar)
// ============================================================================

function HomeHubHeader({ onSettings }: { onSettings: () => void }) {
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#fff' : '#0B1220';

  return (
    <View className="flex-row items-center bg-backgroundLight dark:bg-backgroundDark px-4 pb-2 justify-between">
      <View className="w-12 shrink-0">
        <View className="bg-charcoal flex items-center justify-center rounded-full w-10 h-10">
          <MaterialIcons name="directions-run" size={20} color="#fff" />
        </View>
      </View>
      <Typography
        className="text-charcoal dark:text-white text-xl font-extrabold leading-tight tracking-tight flex-1 text-center uppercase italic"
        accessibilityRole="header"
      >
        THE RUN
      </Typography>
      <Pressable
        onPress={onSettings}
        className="w-12 h-10 items-center justify-end rounded-full bg-secondary-100 dark:bg-secondary-800"
        accessibilityRole="button"
        accessibilityLabel="Settings"
      >
        <MaterialIcons name="settings" size={24} color={iconColor} />
      </Pressable>
    </View>
  );
}

// ============================================================================
// Hero Graphic Placeholder (design: 4:3 map placeholder + progress bar)
// ============================================================================

function HeroPlaceholder() {
  return (
    <View className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-secondary-100 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 items-center justify-center">
      <MaterialIcons name="map" size={80} color="#9ca3af" />
      <View className="absolute bottom-4 left-4 right-4 h-1 bg-white/30 rounded-full overflow-hidden">
        <View className="w-1/3 h-full bg-brandOrange rounded-full" />
      </View>
    </View>
  );
}

// ============================================================================
// How It Works Section (design: 3 steps, vertical timeline)
// ============================================================================

const HOW_IT_WORKS_STEPS: Array<{
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  title: string;
  description: string;
}> = [
  { icon: 'edit-note', title: 'Create', description: 'Set your route and time.' },
  { icon: 'qr-code-2', title: 'Share Code', description: 'Invite your crew via link.' },
  { icon: 'bolt', title: 'Run', description: 'Track and compete live.' },
];

function HowItWorks() {
  return (
    <View className="bg-white dark:bg-secondary-900 rounded-xl p-6 border border-secondary-100 dark:border-secondary-800">
      <Typography
        variant="label"
        className="text-charcoal dark:text-white uppercase tracking-widest mb-6"
      >
        How it works
      </Typography>
      <View className="flex-row gap-4">
        <View className="items-center">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <View key={step.title} className="items-center">
              <View className="bg-brandOrange/10 rounded-full p-1.5">
                <MaterialIcons name={step.icon} size={20} color="#FF5A1F" />
              </View>
              {index < HOW_IT_WORKS_STEPS.length - 1 && (
                <View className="w-px bg-secondary-100 dark:bg-secondary-800 h-10 my-1" />
              )}
            </View>
          ))}
        </View>
        <View className="flex-1 gap-0">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <View key={step.title} className={index < HOW_IT_WORKS_STEPS.length - 1 ? 'pb-6' : ''}>
              <Typography className="text-charcoal dark:text-white text-base font-bold leading-none mb-1">
                {step.title}
              </Typography>
              <Typography color="muted" variant="bodySmall">
                {step.description}
              </Typography>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

// ============================================================================
// Home Hub Empty State (full screen)
// ============================================================================

export interface HomeHubEmptyStateProps {
  onCreateEvent: () => void;
  onJoinWithCode: () => void;
  onSettings: () => void;
}

export function HomeHubEmptyState({
  onCreateEvent,
  onJoinWithCode,
  onSettings,
}: HomeHubEmptyStateProps) {
  const insets = useSafeAreaInsets();
  const scrollContentStyle = useMemo(
    () =>
      StyleSheet.create({
        scrollContent: {
          paddingBottom: insets.bottom + SCROLL_BOTTOM_EXTRA_PADDING,
        },
      }),
    [insets.bottom]
  );

  return (
    <SafeAreaView
      className="flex-1 bg-backgroundLight dark:bg-backgroundDark"
      edges={['top']}
    >
      <HomeHubHeader onSettings={onSettings} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={scrollContentStyle.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 py-10">
          <View className="items-center gap-8">
            <HeroPlaceholder />

            <View className="items-center gap-3">
              <Typography className="text-charcoal dark:text-white text-3xl font-extrabold leading-tight tracking-tight text-center">
                Create your next run
              </Typography>
              <Typography
                color="muted"
                className="text-base text-center max-w-[280px]"
              >
                Start a group run and invite others in seconds.
              </Typography>
            </View>

            <View className="w-full gap-4">
              <Pressable
                onPress={onCreateEvent}
                className="w-full h-16 rounded-xl bg-charcoal items-center justify-center flex-row active:opacity-90"
                accessibilityRole="button"
                accessibilityLabel="Create an event"
              >
                <View className="mr-2">
                  <MaterialIcons name="add-circle" size={22} color="#fff" />
                </View>
                <Typography className="text-white text-lg font-bold">Create an event</Typography>
              </Pressable>

              <Pressable
                onPress={onJoinWithCode}
                className="py-2 items-center"
                accessibilityRole="button"
                accessibilityLabel="Join with a code"
              >
                <Typography className="text-brandOrange text-sm font-bold underline decoration-2 underline-offset-4">
                  Join with a code
                </Typography>
              </Pressable>
            </View>
          </View>
        </View>

        <View className="px-6 pb-12 mt-auto">
          <HowItWorks />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
