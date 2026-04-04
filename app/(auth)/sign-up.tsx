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
import { postRegister } from '@/lib/api/authEndpoints';
import { persistAccessToken } from '@/lib/auth/tokenStorage';
import { signUpSchema, splitDisplayName } from '@/lib/validation/authSchemas';

const SURFACE_DIM = '#0e0e0e';
const ON_SURFACE_VARIANT = '#adaaaa';
const PRIMARY = '#ff5722';
const ON_PRIMARY = '#000000';

export default function SignUpScreen(): ReactElement {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    acceptTerms?: string;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const toggleTerms = useCallback(() => {
    setAcceptTerms((v) => !v);
  }, []);

  const handleSignUp = useCallback(async () => {
    setFormError(null);
    const parsed = signUpSchema.safeParse({
      name: name.trim(),
      email: email.trim(),
      password,
      acceptTerms,
    });
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        name: flat.name?.[0],
        email: flat.email?.[0],
        password: flat.password?.[0],
        acceptTerms: flat.acceptTerms?.[0],
      });
      return;
    }
    setFieldErrors({});
    setIsLoading(true);
    try {
      const { firstName, lastName } = splitDisplayName(parsed.data.name);
      const data = await postRegister({
        email: parsed.data.email,
        firstName,
        lastName,
        acceptTerms: parsed.data.acceptTerms,
      });
      await persistAccessToken(data.accessToken);
      setFormError(null);
      router.replace('/(app)');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unable to create account';
      setFormError(message);
    } finally {
      setIsLoading(false);
    }
  }, [acceptTerms, email, name, password]);

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
          <Text style={styles.header}>JOIN THE RUN</Text>
          <Text style={styles.subtitle}>Create your account to unlock the full experience.</Text>

          <TheRunInput
            label="Name"
            value={name}
            onChangeText={setName}
            errorMessage={fieldErrors.name}
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
            testID="sign-up-name"
          />
          <TheRunInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            errorMessage={fieldErrors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            testID="sign-up-email"
          />
          <TheRunInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            errorMessage={fieldErrors.password}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password-new"
            textContentType="newPassword"
            testID="sign-up-password"
          />

          <Pressable
            onPress={toggleTerms}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: acceptTerms }}
            style={styles.termsRow}
          >
            <View style={[styles.checkbox, acceptTerms && styles.checkboxOn]} />
            <Text style={styles.termsText}>
              I accept the terms{' '}
              <Text style={styles.termsHighlight}>(required)</Text>
            </Text>
          </Pressable>
          {fieldErrors.acceptTerms ? (
            <Text style={styles.termsError}>{fieldErrors.acceptTerms}</Text>
          ) : null}

          {formError ? <Text style={styles.formError}>{formError}</Text> : null}

          <Pressable
            onPress={handleSignUp}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Create account"
            style={({ pressed }) => [
              styles.submit,
              pressed && styles.submitPressed,
              isLoading && styles.submitDisabled,
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color={ON_PRIMARY} />
            ) : (
              <Text style={styles.submitLabel}>CREATE ACCOUNT</Text>
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
    fontSize: 40,
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
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    backgroundColor: '#262626',
  },
  checkboxOn: {
    backgroundColor: PRIMARY,
  },
  termsText: {
    flex: 1,
    color: ON_SURFACE_VARIANT,
    fontSize: 14,
    lineHeight: 20,
  },
  termsHighlight: {
    color: PRIMARY,
    fontWeight: '700',
  },
  termsError: {
    color: '#ff8a80',
    fontSize: 13,
    marginBottom: 12,
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
