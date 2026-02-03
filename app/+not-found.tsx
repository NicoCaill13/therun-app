import { Link, Stack } from 'expo-router';
import { View, Pressable } from 'react-native';
import { Typography } from '@/components/ui';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center px-6 bg-backgroundLight dark:bg-backgroundDark">
        <Typography variant="h2" className="text-center text-charcoal dark:text-white mb-2">
          This screen doesn't exist.
        </Typography>
        <Link href="/" asChild>
          <Pressable className="mt-4 py-3 px-4 rounded-xl bg-charcoal dark:bg-white active:opacity-80">
            <Typography className="text-white dark:text-charcoal font-semibold">
              Go to home screen
            </Typography>
          </Pressable>
        </Link>
      </View>
    </>
  );
}
