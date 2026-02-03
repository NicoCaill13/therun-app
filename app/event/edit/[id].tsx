import { useCallback, useMemo, useEffect } from 'react';
import { View, Pressable, Platform, KeyboardAvoidingView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScrollContainer, Typography, H1, Button, Input } from '@/components/ui';
import { LoadingState, ErrorState } from '@/components/states';
import {
  useEventDetails,
  useUpdateEvent,
  UpdateEventInput,
  UpdateEventInputSchema,
} from '@/lib/api';

// ============================================================================
// Date/Time Input Component
// ============================================================================

interface DateTimeInputProps {
  label: string;
  value: string;
  onChange: (isoString: string) => void;
  error?: string;
}

function DateTimeInput({ label, value, onChange, error }: DateTimeInputProps) {
  const date = useMemo(() => new Date(value), [value]);

  const dateString = useMemo(() => {
    const d = date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, [date]);

  const timeString = useMemo(() => {
    const d = date;
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }, [date]);

  const handleDateChange = useCallback(
    (text: string) => {
      const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (match) {
        const [, year, month, day] = match;
        const newDate = new Date(date);
        newDate.setFullYear(parseInt(year, 10));
        newDate.setMonth(parseInt(month, 10) - 1);
        newDate.setDate(parseInt(day, 10));
        onChange(newDate.toISOString());
      }
    },
    [date, onChange]
  );

  const handleTimeChange = useCallback(
    (text: string) => {
      const match = text.match(/^(\d{2}):(\d{2})$/);
      if (match) {
        const [, hours, minutes] = match;
        const newDate = new Date(date);
        newDate.setHours(parseInt(hours, 10));
        newDate.setMinutes(parseInt(minutes, 10));
        onChange(newDate.toISOString());
      }
    },
    [date, onChange]
  );

  const displayDate = useMemo(() => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [date]);

  const displayTime = useMemo(() => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [date]);

  return (
    <View className="mb-4">
      <Typography variant="label" className="mb-1.5">
        {label}
      </Typography>

      <View className="flex-row gap-2">
        <View className="flex-1">
          <Input
            placeholder="AAAA-MM-JJ"
            value={dateString}
            onChangeText={handleDateChange}
            keyboardType="numbers-and-punctuation"
            hint={displayDate}
          />
        </View>

        <View className="w-24">
          <Input
            placeholder="HH:MM"
            value={timeString}
            onChangeText={handleTimeChange}
            keyboardType="numbers-and-punctuation"
            hint={displayTime}
          />
        </View>
      </View>

      {error && (
        <Typography variant="caption" color="error" className="mt-1" accessibilityRole="alert">
          {error}
        </Typography>
      )}
    </View>
  );
}

// ============================================================================
// Main Edit Event Screen
// ============================================================================

export default function EditEventScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const eventId = id as string;

  const { data, isLoading, error: fetchError, refetch } = useEventDetails(eventId);
  const updateEvent = useUpdateEvent();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm<UpdateEventInput>({
    resolver: zodResolver(UpdateEventInputSchema),
    mode: 'onChange',
  });

  // Reset form when data is loaded
  useEffect(() => {
    if (data?.event) {
      reset({
        startDateTime: data.event.startDateTime,
        locationName: data.event.locationName ?? undefined,
        locationAddress: data.event.locationAddress ?? undefined,
        locationLat: data.event.locationLat ?? undefined,
        locationLng: data.event.locationLng ?? undefined,
      });
    }
  }, [data, reset]);

  const onSubmit = useCallback(
    async (formData: UpdateEventInput) => {
      try {
        await updateEvent.mutateAsync({ eventId, data: formData });
        Alert.alert('Succes', 'Evenement mis a jour', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } catch {
        // Error handling is done in useApiMutation
      }
    },
    [updateEvent, eventId, router]
  );

  const handleCancel = useCallback(() => {
    if (isDirty) {
      Alert.alert(
        'Modifications non enregistrees',
        'Voulez-vous vraiment quitter sans enregistrer ?',
        [
          { text: 'Continuer a editer', style: 'cancel' },
          { text: 'Quitter', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  }, [isDirty, router]);

  // Handle loading state
  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Modification' }} />
        <LoadingState message="Chargement de l'evenement..." />
      </>
    );
  }

  // Handle error state
  if (fetchError) {
    return (
      <>
        <Stack.Screen options={{ title: 'Modification' }} />
        <ErrorState message={fetchError.message} onRetry={refetch} onBack={() => router.back()} />
      </>
    );
  }

  // Handle not found
  if (!data) {
    return (
      <>
        <Stack.Screen options={{ title: 'Modification' }} />
        <ErrorState message="Evenement introuvable" onBack={() => router.back()} />
      </>
    );
  }

  const { event } = data;
  const isCompleted = event.status === 'COMPLETED';
  const isCancelled = event.status === 'CANCELLED';
  const isEditable = !isCompleted && !isCancelled;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Modifier',
          headerBackTitle: 'Retour',
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollContainer hasSafeArea safeAreaEdges={['bottom']} padding="lg" className="bg-backgroundLight dark:bg-backgroundDark">
          <H1 className="mb-2">Modifier l'evenement</H1>
          <Typography color="muted" className="mb-6">
            {event.title}
          </Typography>

          {/* Warning for non-editable events */}
          {!isEditable && (
            <View className="bg-amber-50 dark:bg-amber-900/30 p-4 rounded-xl mb-6">
              <Typography className="text-amber-700 dark:text-amber-300">
                {isCompleted
                  ? 'Cet evenement est termine et ne peut plus etre modifie.'
                  : 'Cet evenement est annule et ne peut plus etre modifie.'}
              </Typography>
            </View>
          )}

          {/* Date & Time */}
          <Controller
            control={control}
            name="startDateTime"
            render={({ field: { onChange, value } }) => (
              <DateTimeInput
                label="Date et heure"
                value={value || event.startDateTime}
                onChange={onChange}
                error={errors.startDateTime?.message}
              />
            )}
          />

          {/* Location Name */}
          <Controller
            control={control}
            name="locationName"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Lieu de rendez-vous"
                placeholder="Ex: Parc Borely"
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.locationName?.message}
                containerClassName="mb-4"
                autoCapitalize="words"
                returnKeyType="next"
                editable={isEditable}
              />
            )}
          />

          {/* Location Address */}
          <Controller
            control={control}
            name="locationAddress"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Adresse"
                placeholder="Ex: Avenue du Prado, 13008 Marseille"
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.locationAddress?.message}
                containerClassName="mb-6"
                autoCapitalize="words"
                returnKeyType="done"
                editable={isEditable}
              />
            )}
          />

          {/* Info about notifications */}
          <View className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl mb-6">
            <Typography className="text-blue-700 dark:text-blue-300 text-sm">
              Les participants seront automatiquement notifies des changements d'heure ou de lieu.
            </Typography>
          </View>

          {/* Error message */}
          {updateEvent.error && (
            <View className="bg-red-50 dark:bg-red-900/30 p-4 rounded-xl mb-4">
              <Typography color="error">
                {updateEvent.error.message || 'Une erreur est survenue'}
              </Typography>
            </View>
          )}

          {/* Submit Button */}
          {isEditable && (
            <Button
              variant="primary"
              size="lg"
              isFullWidth
              isLoading={updateEvent.isPending}
              isDisabled={!isDirty}
              onPress={handleSubmit(onSubmit)}
              accessibilityLabel="Enregistrer les modifications"
            >
              Enregistrer
            </Button>
          )}

          {/* Cancel link */}
          <Pressable
            onPress={handleCancel}
            className="mt-4 py-2"
            accessibilityRole="button"
            accessibilityLabel="Annuler"
          >
            <Typography color="muted" className="text-center">
              {isDirty ? 'Annuler' : 'Retour'}
            </Typography>
          </Pressable>
        </ScrollContainer>
      </KeyboardAvoidingView>
    </>
  );
}
