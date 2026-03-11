import { useCallback } from 'react';
import { View, Pressable, KeyboardAvoidingView, Platform, ScrollView, Keyboard } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography, Button, Input } from '@/components/ui';
import { useRegister, RegisterInputSchema, type RegisterInput } from '@/lib/api';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const register = useRegister();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterInputSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      acceptTerms: true as const,
    },
    mode: 'onChange',
  });

  const onSubmit = useCallback(
    async (data: RegisterInput) => {
      Keyboard.dismiss();
      try {
        await register.mutateAsync(data);
        // useRegister hook handles signIn via onSuccess; always land on profile after signup
        router.replace('/(tabs)/profile');
      } catch {
        // Error shown via register.error in UI
      }
    },
    [register, router]
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
          <Pressable onPress={() => router.back()} className="p-2" accessibilityLabel="Retour" testID="button-register-cancel">
            <Typography className="text-brandOrange font-semibold">Annuler</Typography>
          </Pressable>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 320 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Typography variant="h1" className="mb-1">
            Creer un compte
          </Typography>
          <Typography color="muted" className="mb-6">
            Inscrivez-vous pour creer et gerer vos sorties
          </Typography>

          <Controller
            control={control}
            name="firstName"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Prenom"
                placeholder="Jean"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.firstName?.message}
                containerClassName="mb-4"
                autoCapitalize="words"
                testID="input-register-firstName"
              />
            )}
          />

          <Controller
            control={control}
            name="lastName"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Nom (optionnel)"
                placeholder="Dupont"
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.lastName?.message}
                containerClassName="mb-4"
                autoCapitalize="words"
                testID="input-register-lastName"
              />
            )}
          />

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
                testID="input-register-email"
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Mot de passe (min. 8 caracteres)"
                placeholder="********"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                containerClassName="mb-4"
                secureTextEntry
                autoComplete="new-password"
                testID="input-register-password"
              />
            )}
          />

          <Controller
            control={control}
            name="acceptTerms"
            render={({ field: { onChange, value } }) => (
              <Pressable
                onPress={() => onChange(!value)}
                className="mb-6 flex-row items-center"
                accessibilityLabel="Accepter les conditions d'utilisation"
                testID="checkbox-register-acceptTerms"
                accessibilityRole="checkbox"
                accessibilityState={{ checked: value === true }}
              >
                <View
                  className="mr-3 h-5 w-5 items-center justify-center rounded border border-outlineLight dark:border-outlineDark"
                  style={{ backgroundColor: value === true ? 'rgba(0,0,0,0.2)' : 'transparent' }}
                >
                  {value === true && <Typography className="text-xs">✓</Typography>}
                </View>
                <Typography color="muted" className="flex-1">
                  J'accepte les conditions d'utilisation et la politique de confidentialite
                </Typography>
              </Pressable>
            )}
          />
          {errors.acceptTerms && (
            <View className="-mt-4 mb-2">
              <Typography color="error">{errors.acceptTerms.message}</Typography>
            </View>
          )}

          {register.error && (
            <View className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
              <Typography color="error">{register.error.message}</Typography>
            </View>
          )}

          <Button
            variant="primary"
            size="lg"
            isFullWidth
            isLoading={register.isPending}
            onPress={handleSubmit(onSubmit)}
            testID="button-register-submit"
          >
            Creer mon compte
          </Button>

          <Pressable
            onPress={() => {
              const params = redirect ? `?redirect=${encodeURIComponent(redirect)}` : '';
              router.push(`/auth/login${params}` as '/auth/login');
            }}
            className="mt-6 items-center"
            accessibilityLabel="Deja un compte ? Se connecter"
            testID="link-login"
          >
            <Typography className="text-brandOrange font-semibold">Deja un compte ? Se connecter</Typography>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
