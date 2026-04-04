import { useCallback, useState } from 'react';
import type { ReactElement } from 'react';

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthNavBar } from '@/components/layout/TheRunNavBar';
import { TheRunInput } from '@/components/ui/TheRunInput';
import { AUTH_FORM_MAX_WIDTH, DESKTOP_BREAKPOINT } from '@/lib/constants/breakpoints';
import { shellHorizontalPadding } from '@/lib/constants/layout';
import { postLogin } from '@/lib/api/authEndpoints';
import { persistAccessToken } from '@/lib/auth/tokenStorage';
import { signInSchema } from '@/lib/validation/authSchemas';

const SURFACE_DIM = '#0e0e0e';
const ON_SURFACE_VARIANT = '#adaaaa';
const PRIMARY = '#ff5722';
const ON_PRIMARY = '#000000';

export default function SignInScreen(): ReactElement {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = useCallback(async () => {
    setFormError(null);
    const parsed = signInSchema.safeParse({ email: email.trim(), password });
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        email: flat.email?.[0],
        password: flat.password?.[0],
      });
      return;
    }
    setFieldErrors({});
    setIsLoading(true);
    try {
      const data = await postLogin(parsed.data.email, parsed.data.password);
      await persistAccessToken(data.accessToken);
      setFormError(null);
      router.replace('/(app)');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unable to sign in';
      setFormError(message);
    } finally {
      setIsLoading(false);
    }
  }, [email, password]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <AuthNavBar />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: shellHorizontalPadding(width) },
            isDesktop && styles.scrollContentDesktop,
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.formColumn, isDesktop && styles.formColumnDesktop]}>
          <Text style={styles.header}>LOG IN</Text>
          <Text style={styles.subtitle}>Welcome back. Enter your credentials.</Text>

          <TheRunInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            errorMessage={fieldErrors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            testID="sign-in-email"
          />
          <TheRunInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            errorMessage={fieldErrors.password}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            textContentType="password"
            testID="sign-in-password"
          />

          {formError ? <Text style={styles.formError}>{formError}</Text> : null}

          <Pressable
            onPress={handleLogin}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Sign in"
            style={({ pressed }) => [
              styles.submit,
              pressed && styles.submitPressed,
              isLoading && styles.submitDisabled,
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color={ON_PRIMARY} />
            ) : (
              <Text style={styles.submitLabel}>SIGN IN</Text>
            )}
          </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: SURFACE_DIM,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  scrollContentDesktop: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  formColumn: {
    width: '100%',
  },
  formColumnDesktop: {
    maxWidth: AUTH_FORM_MAX_WIDTH,
  },
  header: {
    color: '#ffffff',
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: -1,
    marginBottom: 8,
  },
  subtitle: {
    color: ON_SURFACE_VARIANT,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 28,
  },
  formError: {
    color: '#ff8a80',
    fontSize: 14,
    marginBottom: 16,
  },
  submit: {
    backgroundColor: PRIMARY,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitPressed: {
    opacity: 0.92,
  },
  submitDisabled: {
    opacity: 0.6,
  },
  submitLabel: {
    color: ON_PRIMARY,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
