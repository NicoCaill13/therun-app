import { useCallback } from 'react';
import { View, Pressable, KeyboardAvoidingView, Platform, ScrollView, Keyboard } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography, Button, Input } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { useLogin, LoginInputSchema, type LoginInput } from '@/lib/api';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const login = useLogin();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginInputSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onChange',
  });

  const onSubmit = useCallback(
    async (data: LoginInput) => {
      Keyboard.dismiss();
      try {
        const result = await login.mutateAsync(data);
        await signIn(result.accessToken, result.user);
        router.replace('/(tabs)');
      } catch {
        // Error shown via login.error in UI
      }
    },
    [login, signIn, router]
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-backgroundLight dark:bg-backgroundDark"
        style={{ paddingTop: insets.top }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View className="flex-row items-center px-4 py-4">
          <Pressable onPress={() => router.back()} className="p-2" accessibilityLabel="Retour" testID="button-login-cancel">
            <Typography className="text-brandOrange font-semibold">Annuler</Typography>
          </Pressable>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 240 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Typography variant="h1" className="mb-1">
            Connexion
          </Typography>
          <Typography color="muted" className="mb-6">
            Entrez vos identifiants pour acceder a votre compte
          </Typography>

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Email"
                placeholder="vous@exemple.com"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
                containerClassName="mb-4"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                testID="input-login-email"
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Mot de passe"
                placeholder="********"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                containerClassName="mb-6"
                secureTextEntry
                autoComplete="password"
                testID="input-login-password"
              />
            )}
          />

          {login.error && (
            <View className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
              <Typography color="error">{login.error.message}</Typography>
            </View>
          )}

          <Button
            variant="charcoal"
            size="lg"
            isFullWidth
            isLoading={login.isPending}
            isDisabled={!isValid}
            onPress={handleSubmit(onSubmit)}
            testID="button-login-submit"
          >
            Se connecter
          </Button>

          <Pressable
            onPress={() => router.push('/auth/register')}
            className="mt-6 items-center"
            accessibilityLabel="Creer un compte"
            testID="link-register"
          >
            <Typography className="text-brandOrange font-semibold">Creer un compte</Typography>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
