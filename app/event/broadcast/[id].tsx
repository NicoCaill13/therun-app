import { useCallback } from 'react';
import { View, Pressable, Platform, KeyboardAvoidingView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScrollContainer, Typography, H1, Button, Input } from '@/components/ui';
import { LoadingState, ErrorState } from '@/components/states';
import {
  useEventDetails,
  useBroadcastEvent,
  BroadcastEventInput,
  BroadcastEventInputSchema,
} from '@/lib/api';

// ============================================================================
// Main Broadcast Screen
// ============================================================================

export default function BroadcastEventScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const eventId = id as string;

  const { data, isLoading, error: fetchError, refetch } = useEventDetails(eventId);
  const broadcastEvent = useBroadcastEvent();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<BroadcastEventInput>({
    resolver: zodResolver(BroadcastEventInputSchema),
    defaultValues: {
      title: '',
      body: '',
    },
    mode: 'onChange',
  });

  const onSubmit = useCallback(
    async (formData: BroadcastEventInput) => {
      try {
        const result = await broadcastEvent.mutateAsync({ eventId, data: formData });
        Alert.alert(
          'Message envoye',
          `${result.sentCount} participant${result.sentCount > 1 ? 's' : ''} notifie${result.sentCount > 1 ? 's' : ''}`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } catch {
        // Error handling is done in useApiMutation
      }
    },
    [broadcastEvent, eventId, router]
  );

  // Handle loading state
  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Message' }} />
        <LoadingState message="Chargement..." />
      </>
    );
  }

  // Handle error state
  if (fetchError) {
    return (
      <>
        <Stack.Screen options={{ title: 'Message' }} />
        <ErrorState message={fetchError.message} onRetry={refetch} onBack={() => router.back()} />
      </>
    );
  }

  // Handle not found
  if (!data) {
    return (
      <>
        <Stack.Screen options={{ title: 'Message' }} />
        <ErrorState message="Evenement introuvable" onBack={() => router.back()} />
      </>
    );
  }

  const { event, participants } = data;
  const goingCount = participants.filter((p) => p.status === 'GOING').length;
  const invitedCount = participants.filter((p) => p.status === 'INVITED').length;
  const totalRecipients = goingCount + invitedCount;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Envoyer un message',
          headerBackTitle: 'Retour',
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollContainer hasSafeArea safeAreaEdges={['bottom']} padding="lg">
          <H1 className="mb-2">Envoyer un message</H1>
          <Typography color="muted" className="mb-6">
            {event.title}
          </Typography>

          {/* Recipients info */}
          <View className="bg-secondary-50 dark:bg-secondary-800 p-4 rounded-xl mb-6">
            <Typography className="font-semibold mb-2">Destinataires</Typography>
            <View className="flex-row flex-wrap gap-2">
              <View className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded-md">
                <Typography className="text-green-700 dark:text-green-300 text-sm">
                  {goingCount} present{goingCount > 1 ? 's' : ''}
                </Typography>
              </View>
              <View className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-md">
                <Typography className="text-blue-700 dark:text-blue-300 text-sm">
                  {invitedCount} invite{invitedCount > 1 ? 's' : ''}
                </Typography>
              </View>
            </View>
            <Typography color="muted" className="text-sm mt-2">
              Les participants ayant decline ne recevront pas ce message.
            </Typography>
          </View>

          {/* Title (optional) */}
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Titre (optionnel)"
                placeholder="Ex: Information importante"
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.title?.message}
                containerClassName="mb-4"
                autoCapitalize="sentences"
                returnKeyType="next"
                maxLength={120}
              />
            )}
          />

          {/* Message body */}
          <Controller
            control={control}
            name="body"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Message *"
                placeholder="Ex: Le depart est decale de 10 minutes, rendez-vous a 19h10."
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.body?.message}
                containerClassName="mb-6"
                multiline
                numberOfLines={5}
                className="min-h-[120px]"
                textAlignVertical="top"
                maxLength={1000}
              />
            )}
          />

          {/* Character count */}
          <View className="mb-6">
            <Typography color="muted" className="text-right text-sm">
              {(control._formValues.body?.length || 0)} / 1000 caracteres
            </Typography>
          </View>

          {/* Error message */}
          {broadcastEvent.error && (
            <View className="bg-red-50 dark:bg-red-900/30 p-4 rounded-xl mb-4">
              <Typography color="error">
                {broadcastEvent.error.message || 'Une erreur est survenue'}
              </Typography>
            </View>
          )}

          {/* Submit Button */}
          <Button
            variant="primary"
            size="lg"
            isFullWidth
            isLoading={broadcastEvent.isPending}
            isDisabled={!isValid || totalRecipients === 0}
            onPress={handleSubmit(onSubmit)}
            accessibilityLabel="Envoyer le message"
          >
            Envoyer a {totalRecipients} participant{totalRecipients > 1 ? 's' : ''}
          </Button>

          {/* Cancel link */}
          <Pressable
            onPress={() => router.back()}
            className="mt-4 py-2"
            accessibilityRole="button"
            accessibilityLabel="Annuler"
          >
            <Typography color="muted" className="text-center">
              Annuler
            </Typography>
          </Pressable>
        </ScrollContainer>
      </KeyboardAvoidingView>
    </>
  );
}
