import { useCallback, useMemo, useEffect } from 'react';
import { View, Pressable, Platform, KeyboardAvoidingView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScrollContainer, Typography, H1, Button, Input } from '@/components/ui';
import { LoadingState, ErrorState } from '@/components/states';
import {
  useEventDetails,
  useDuplicateEvent,
  DuplicateEventInput,
  DuplicateEventInputSchema,
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
// Main Duplicate Event Screen
// ============================================================================

export default function DuplicateEventScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const eventId = id as string;

  const { data, isLoading, error: fetchError, refetch } = useEventDetails(eventId);
  const duplicateEvent = useDuplicateEvent();

  // Default start time: next week, same time as original
  const defaultStartDate = useMemo(() => {
    if (data?.event?.startDateTime) {
      const originalDate = new Date(data.event.startDateTime);
      originalDate.setDate(originalDate.getDate() + 7);
      return originalDate.toISOString();
    }
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(19, 0, 0, 0);
    return d.toISOString();
  }, [data?.event?.startDateTime]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<DuplicateEventInput>({
    resolver: zodResolver(DuplicateEventInputSchema),
    defaultValues: {
      startDateTime: defaultStartDate,
      copyAllGroups: true,
    },
    mode: 'onChange',
  });

  // Reset form when data is loaded
  useEffect(() => {
    if (data?.event) {
      reset({
        startDateTime: defaultStartDate,
        title: data.event.title,
        description: data.event.description ?? undefined,
        locationName: data.event.locationName ?? undefined,
        locationAddress: data.event.locationAddress ?? undefined,
        locationLat: data.event.locationLat ?? undefined,
        locationLng: data.event.locationLng ?? undefined,
        copyAllGroups: true,
      });
    }
  }, [data, reset, defaultStartDate]);

  const onSubmit = useCallback(
    async (formData: DuplicateEventInput) => {
      try {
        const result = await duplicateEvent.mutateAsync({ eventId, data: formData });
        Alert.alert('Succes', 'Evenement duplique avec succes', [
          { text: 'Voir', onPress: () => router.replace(`/event/${result.event.id}`) },
        ]);
      } catch {
        // Error handling is done in useApiMutation
      }
    },
    [duplicateEvent, eventId, router]
  );

  // Handle loading state
  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Duplication' }} />
        <LoadingState message="Chargement de l'evenement..." />
      </>
    );
  }

  // Handle error state
  if (fetchError) {
    return (
      <>
        <Stack.Screen options={{ title: 'Duplication' }} />
        <ErrorState message={fetchError.message} onRetry={refetch} onBack={() => router.back()} />
      </>
    );
  }

  // Handle not found
  if (!data) {
    return (
      <>
        <Stack.Screen options={{ title: 'Duplication' }} />
        <ErrorState message="Evenement introuvable" onBack={() => router.back()} />
      </>
    );
  }

  const { event } = data;

  // Only COMPLETED events can be duplicated
  if (event.status !== 'COMPLETED') {
    return (
      <>
        <Stack.Screen options={{ title: 'Duplication' }} />
        <ErrorState
          title="Non disponible"
          message="Seuls les evenements termines peuvent etre dupliques."
          onBack={() => router.back()}
        />
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Dupliquer',
          headerBackTitle: 'Retour',
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollContainer hasSafeArea safeAreaEdges={['bottom']} padding="lg" className="bg-backgroundLight dark:bg-backgroundDark">
          <H1 className="mb-2">Dupliquer l'evenement</H1>
          <Typography color="muted" className="mb-6">
            Creer un nouvel evenement base sur "{event.title}"
          </Typography>

          {/* Info */}
          <View className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl mb-6">
            <Typography className="text-blue-700 dark:text-blue-300 text-sm">
              Les parcours et groupes d'allure seront copies. Les participants ne seront pas inclus.
            </Typography>
          </View>

          {/* Title */}
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Titre"
                placeholder="Ex: Run du jeudi soir"
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.title?.message}
                containerClassName="mb-4"
                autoCapitalize="sentences"
                returnKeyType="next"
              />
            )}
          />

          {/* Date & Time */}
          <Controller
            control={control}
            name="startDateTime"
            render={({ field: { onChange, value } }) => (
              <DateTimeInput
                label="Nouvelle date et heure *"
                value={value}
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
                containerClassName="mb-4"
                autoCapitalize="words"
                returnKeyType="next"
              />
            )}
          />

          {/* Description */}
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Description"
                placeholder="Ex: Sortie decontractee, tous niveaux bienvenus"
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.description?.message}
                containerClassName="mb-6"
                multiline
                numberOfLines={3}
                className="min-h-[80px]"
                textAlignVertical="top"
              />
            )}
          />

          {/* Error message */}
          {duplicateEvent.error && (
            <View className="bg-red-50 dark:bg-red-900/30 p-4 rounded-xl mb-4">
              <Typography color="error">
                {duplicateEvent.error.message || 'Une erreur est survenue'}
              </Typography>
            </View>
          )}

          {/* Submit Button */}
          <Button
            variant="primary"
            size="lg"
            isFullWidth
            isLoading={duplicateEvent.isPending}
            isDisabled={!isValid}
            onPress={handleSubmit(onSubmit)}
            accessibilityLabel="Creer la duplication"
          >
            Creer la duplication
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
