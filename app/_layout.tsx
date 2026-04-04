import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import '../global.css';

import { UpsellModalProvider } from '@/components/providers';
import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider, useAuthLoading } from '@/lib/auth';
import { QueryProvider } from '@/lib/query';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Auth stitch landing at /; replace to /home when session exists (see app/(auth)/index.tsx).
  initialRouteName: '(auth)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <QueryProvider>
        <AuthProvider>
          <UpsellModalProvider>
            <RootLayoutNav />
          </UpsellModalProvider>
        </AuthProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}

/**
 * Loading screen shown during auth rehydration.
 * Prevents flash of unauthenticated content (DoD 6).
 */
function AuthLoadingScreen() {
  return (
    <View
      className="flex-1 items-center justify-center bg-white dark:bg-secondary-900"
      accessibilityRole="progressbar"
      accessibilityLabel="Chargement de l'application"
    >
      <ActivityIndicator size="large" color="#16a34a" />
    </View>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const isAuthLoading = useAuthLoading();

  // Show loading screen during auth rehydration
  if (isAuthLoading) {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthLoadingScreen />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="join/[code]" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="event/create" options={{ headerShown: true, title: 'Nouvelle sortie' }} />
        <Stack.Screen name="event/[id]" options={{ headerShown: true, title: 'Sortie' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
