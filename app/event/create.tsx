import { useCallback, useMemo } from 'react';
import { View, Pressable, Platform, KeyboardAvoidingView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScrollContainer, Typography, H1, Button, Input } from '@/components/ui';
import { useCreateEvent, CreateEventInput, CreateEventInputSchema } from '@/lib/api';

// ============================================================================
// Date/Time Input Component (simplified for MVP)
// ============================================================================

interface DateTimeInputProps {
  label: string;
  value: string; // ISO string
  onChange: (isoString: string) => void;
  error?: string;
}

function DateTimeInput({ label, value, onChange, error }: DateTimeInputProps) {
  const date = useMemo(() => new Date(value), [value]);

  // Format for display
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

  const handleDateChange = useCallback((text: string) => {
    // Parse YYYY-MM-DD
    const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      const [, year, month, day] = match;
      const newDate = new Date(date);
      newDate.setFullYear(parseInt(year, 10));
      newDate.setMonth(parseInt(month, 10) - 1);
      newDate.setDate(parseInt(day, 10));
      onChange(newDate.toISOString());
    }
  }, [date, onChange]);

  const handleTimeChange = useCallback((text: string) => {
    // Parse HH:MM
    const match = text.match(/^(\d{2}):(\d{2})$/);
    if (match) {
      const [, hours, minutes] = match;
      const newDate = new Date(date);
      newDate.setHours(parseInt(hours, 10));
      newDate.setMinutes(parseInt(minutes, 10));
      onChange(newDate.toISOString());
    }
  }, [date, onChange]);

  // Display formatted date
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
      <Typography variant="label" className="mb-1.5">{label}</Typography>

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
// Main Create Event Screen
// ============================================================================

export default function CreateEventScreen() {
  const router = useRouter();
  const createEvent = useCreateEvent();

  // Default start time: tomorrow at 19:00
  const defaultStartDate = new Date();
  defaultStartDate.setDate(defaultStartDate.getDate() + 1);
  defaultStartDate.setHours(19, 0, 0, 0);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CreateEventInput>({
    resolver: zodResolver(CreateEventInputSchema),
    defaultValues: {
      title: '',
      description: '',
      startDateTime: defaultStartDate.toISOString(),
      locationName: '',
      locationAddress: '',
    },
    mode: 'onChange',
  });

  const onSubmit = useCallback(async (data: CreateEventInput) => {
    try {
      const result = await createEvent.mutateAsync(data);

      // DoD 3: Navigate to event detail immediately (cache already set by hook)
      router.replace(`/event/${result.event.id}`);
    } catch {
      // Error handling is done in useApiMutation (auto upsell on 403)
    }
  }, [createEvent, router]);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Nouvelle sortie',
          headerBackTitle: 'Retour',
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollContainer
          hasSafeArea
          safeAreaEdges={['bottom']}
          padding="lg"
        >
          <H1 className="mb-6">Creer une sortie</H1>

          {/* Title */}
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Titre *"
                placeholder="Ex: Run du jeudi soir"
                value={value}
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
                label="Date et heure *"
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
          {createEvent.error && (
            <View className="bg-red-50 dark:bg-red-900/30 p-4 rounded-xl mb-4">
              <Typography color="error">
                {createEvent.error.message || 'Une erreur est survenue'}
              </Typography>
            </View>
          )}

          {/* Submit Button */}
          <Button
            variant="primary"
            size="lg"
            isFullWidth
            isLoading={createEvent.isPending}
            isDisabled={!isValid}
            onPress={handleSubmit(onSubmit)}
            accessibilityLabel="Creer la sortie"
          >
            Creer la sortie
          </Button>

          {/* Cancel link */}
          <Pressable
            onPress={() => router.back()}
            className="mt-4 py-2"
            accessibilityRole="button"
            accessibilityLabel="Annuler"
          >
            <Typography color="muted" className="text-center">Annuler</Typography>
          </Pressable>
        </ScrollContainer>
      </KeyboardAvoidingView>
    </>
  );
}
