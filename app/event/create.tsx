import { useCallback, useMemo } from 'react';
import { View, Pressable, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useColorScheme } from '@/components/useColorScheme';
import { ScrollContainer, Typography, Button, Input } from '@/components/ui';
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
      <Typography variant="label" className="mb-1.5 uppercase text-charcoal/60 dark:text-white/60 tracking-tight">
        {label}
      </Typography>

      <View className="flex-row gap-2 items-center">
        <View className="flex-1">
          <Input
            placeholder="AAAA-MM-JJ"
            value={dateString}
            onChangeText={handleDateChange}
            keyboardType="numbers-and-punctuation"
            hint={displayDate}
            className="h-14"
          />
        </View>
        <View className="w-24">
          <Input
            placeholder="HH:MM"
            value={timeString}
            onChangeText={handleTimeChange}
            keyboardType="numbers-and-punctuation"
            hint={displayTime}
            className="h-14"
          />
        </View>
        <View className="pb-2">
          <MaterialIcons name="calendar-today" size={24} color="#64748b" />
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

  const colorScheme = useColorScheme();
  const headerIconColor = colorScheme === 'dark' ? '#fff' : '#0a181e';

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-backgroundLight dark:bg-backgroundDark"
      >
        {/* Header (design: sticky, back + title + spacer) */}
        <SafeAreaView
          edges={['top']}
          className="border-b border-borderGrey/50 bg-backgroundLight dark:bg-backgroundDark"
        >
          <View className="flex-row items-center justify-between px-4 pb-4 pt-3">
            <Pressable
              onPress={() => router.back()}
              className="p-2 rounded-full"
              accessibilityRole="button"
              accessibilityLabel="Retour"
            >
              <MaterialIcons name="arrow-back-ios" size={24} color={headerIconColor} />
            </Pressable>
            <Typography className="text-lg font-bold tracking-tight text-charcoal dark:text-white">
              Create Event
            </Typography>
            <View className="w-10" />
          </View>
        </SafeAreaView>

        <ScrollContainer
          hasSafeArea
          safeAreaEdges={['bottom']}
          padding="lg"
          contentClassName="pb-36"
        >
          {/* Title */}
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Event Title"
                placeholder="e.g. Morning Trail Run"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.title?.message}
                containerClassName="mb-4"
                autoCapitalize="sentences"
                returnKeyType="next"
                className="h-14"
              />
            )}
          />

          {/* Date & Time */}
          <Controller
            control={control}
            name="startDateTime"
            render={({ field: { onChange, value } }) => (
              <DateTimeInput
                label="Date & Time"
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
                label="Location"
                placeholder="Search for a location"
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.locationName?.message}
                containerClassName="mb-2"
                autoCapitalize="words"
                returnKeyType="next"
                className="h-14 pr-12"
              />
            )}
          />

          {/* Map preview placeholder (design) */}
          <View className="w-full h-32 rounded-xl bg-secondary-200 dark:bg-secondary-800 border border-borderGrey mb-4 overflow-hidden items-center justify-center">
            <View className="bg-charcoal flex-row items-center gap-1 px-3 py-1 rounded-full">
              <MaterialIcons name="location-on" size={14} color="#fff" />
              <Typography className="text-white text-xs font-bold">View Map</Typography>
            </View>
          </View>

          {/* Location Address - optional, collapsed in design; keep for data */}
          <Controller
            control={control}
            name="locationAddress"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Address"
                placeholder="Full address"
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.locationAddress?.message}
                containerClassName="mb-4"
                autoCapitalize="words"
                returnKeyType="next"
                className="h-14"
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
                placeholder="Tell runners what to expect, pace group info, etc."
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.description?.message}
                containerClassName="mb-4"
                multiline
                numberOfLines={4}
                className="min-h-[100px] p-4 rounded-xl border border-borderGrey"
                textAlignVertical="top"
              />
            )}
          />

          {createEvent.error && (
            <View className="bg-red-50 dark:bg-red-900/30 p-4 rounded-xl mb-4">
              <Typography color="error">
                {createEvent.error.message || 'Une erreur est survenue'}
              </Typography>
            </View>
          )}
        </ScrollContainer>

        {/* Sticky bottom (design) */}
        <SafeAreaView
          edges={['bottom']}
          className="absolute left-0 right-0 bottom-0 bg-white/80 dark:bg-backgroundDark/80 border-t border-borderGrey/50 px-4 pt-4 pb-6"
        >
          <Button
            variant="charcoal"
            size="lg"
            isFullWidth
            isLoading={createEvent.isPending}
            isDisabled={!isValid}
            onPress={handleSubmit(onSubmit)}
            className="h-14"
            accessibilityLabel="Create event"
          >
            Create event
          </Button>
          <Pressable
            onPress={() => router.back()}
            className="h-12 items-center justify-center mt-1"
            accessibilityRole="button"
            accessibilityLabel="Cancel"
          >
            <Typography className="text-charcoal/60 dark:text-white/60 font-semibold text-base">
              Cancel
            </Typography>
          </Pressable>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </>
  );
}
