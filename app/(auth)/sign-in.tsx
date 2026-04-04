import { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const C = {
  background: '#0e0e0e',
  onSurface: '#ffffff',
  muted: '#adaaaa',
  primary: '#ff5722',
} as const;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.background,
  },
  body: {
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 16,
  },
  title: {
    color: C.onSurface,
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: C.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  link: {
    color: C.primary,
    fontSize: 15,
    fontWeight: '700',
  },
});

/**
 * Sign-in shell.
 * This repo has no `lib/api` module for email/password login yet; `spec.md` only documents
 * `POST /auth/guest` for the guest JWT path. Wire this screen once the backend exposes the real sign-in route.
 */
export default function SignInScreen() {
  const router = useRouter();

  const onGoSignUp = useCallback(() => {
    router.push('/(auth)/sign-up');
  }, [router]);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Sign in',
          headerStyle: { backgroundColor: C.background },
          headerTintColor: C.onSurface,
          headerShadowVisible: false,
        }}
      />
      <SafeAreaView style={styles.root} edges={['bottom']}>
        <View style={styles.body}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>
            Full-account authentication endpoints are not defined under lib/api in this workspace. Add the client
            call here when your backend contract is available (see spec.md for the separate guest flow).
          </Text>
          <Pressable onPress={onGoSignUp} accessibilityRole="button" accessibilityLabel="Go to create account">
            <Text style={styles.link}>Create an account</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </>
  );
}
