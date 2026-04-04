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
 * Sign-up shell. No register endpoint exists under lib/api yet; add the client when the backend exposes it.
 */
export default function SignUpScreen() {
  const router = useRouter();

  const onGoSignIn = useCallback(() => {
    router.push('/(auth)/sign-in');
  }, [router]);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Create account',
          headerStyle: { backgroundColor: C.background },
          headerTintColor: C.onSurface,
          headerShadowVisible: false,
        }}
      />
      <SafeAreaView style={styles.root} edges={['bottom']}>
        <View style={styles.body}>
          <Text style={styles.title}>Create Full Account</Text>
          <Text style={styles.subtitle}>
            Registration UI will connect to your auth service once the API contract is added to lib/api. If you
            already have an account, use Sign in.
          </Text>
          <Pressable onPress={onGoSignIn} accessibilityRole="button" accessibilityLabel="Go to sign in">
            <Text style={styles.link}>Sign in</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </>
  );
}
