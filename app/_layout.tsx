import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import '../global.css';

import { QueryProvider } from '@/lib/query';
import { AuthProvider, useAuthLoading } from '@/lib/auth';
import { UpsellModalProvider } from '@/components/providers';
import { useColorScheme } from '@/components/useColorScheme';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

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

function AuthLoadingScreen() {
  return (
    <View
      className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark"
      accessibilityRole="progressbar"
      accessibilityLabel="Loading application"
    >
      <ActivityIndicator size="large" color="#FF5A1F" />
    </View>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const isAuthLoading = useAuthLoading();

  if (isAuthLoading) {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthLoadingScreen />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="event/create" options={{ presentation: 'modal' }} />
        <Stack.Screen name="event/[id]" />
        <Stack.Screen name="event/share/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="event/participants/[eventId]" />
        <Stack.Screen name="event/broadcast/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="event/edit/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="event/duplicate/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="join/index" options={{ presentation: 'modal' }} />
        <Stack.Screen name="join/[code]" />
        <Stack.Screen name="scan" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="invitations" />
        <Stack.Screen name="notifications" />
      </Stack>
    </ThemeProvider>
  );
}
