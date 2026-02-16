import { View, Platform, KeyboardAvoidingView } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useCreateEvent, CreateEventInputSchema } from '@/lib/api/events';
import { normalizeApiError, shouldShowUpsell } from '@/lib/api/normalizeApiError';
import { useAuth } from '@/lib/auth';
import {
  Header,
  ScrollContainer,
  Input,
  Button,
  Typography,
} from '@/components/ui';
import type { CreateEventInput } from '@/lib/api/events';

// ============================================================================
// Create Event Form (maquette: create_event_form)
// Auth guard: redirect to login if not authenticated
// ============================================================================

export default function CreateEventScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const createEvent = useCreateEvent();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateEventInput>({
    resolver: zodResolver(CreateEventInputSchema),
    defaultValues: {
      title: '',
      description: '',
      startDateTime: new Date(Date.now() + 86400000).toISOString(),
      locationName: '',
      locationAddress: '',
    },
  });

  // Auth guard: redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Redirect href="/auth/login?redirect=/event/create" />;
  }

  async function onSubmit(data: CreateEventInput) {
    try {
      const result = await createEvent.mutateAsync(data);
      router.replace(`/event/${result.event.id}`);
    } catch (error) {
      const normalized = normalizeApiError(error);
      if (shouldShowUpsell(normalized)) {
        // UpsellModalProvider will handle the display
      }
    }
  }

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <View className={Platform.OS === 'web' ? 'max-w-md mx-auto w-full flex-1' : 'flex-1'}>
        <Header title="Create Event" />

        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollContainer padding="md" contentClassName="gap-5 pb-32">
            {/* Title */}
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="EVENT TITLE"
                  placeholder="e.g. Morning Trail Run"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.title?.message}
                  rightIcon={
                    errors.title ? (
                      <MaterialIcons name="error" size={22} color="#E5484D" />
                    ) : undefined
                  }
                  testID="input-event-title"
                />
              )}
            />

            {/* Date & Time */}
            <Controller
              control={control}
              name="startDateTime"
              render={({ field: { onChange, value } }) => (
                <View>
                  <Typography variant="label" color="secondary" className="mb-2">
                    DATE & TIME
                  </Typography>
                  <View className="flex-row items-center h-14 rounded-xl border border-border-grey bg-white dark:bg-gray-900 px-4">
                    <Typography variant="body" className="flex-1">
                      {new Date(value).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                    <MaterialIcons name="calendar-today" size={20} color="#9ca3af" />
                  </View>
                </View>
              )}
            />

            {/* Location */}
            <Controller
              control={control}
              name="locationName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="LOCATION"
                  placeholder="Search for a location"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  rightIcon={<MaterialIcons name="map" size={20} color="#9ca3af" />}
                  testID="input-event-location"
                />
              )}
            />

            {/* Map placeholder */}
            <View className="h-40 rounded-xl bg-gray-100 dark:bg-gray-800 items-center justify-center">
              <View className="bg-charcoal/80 rounded-full px-4 py-2 flex-row items-center gap-2">
                <MaterialIcons name="location-on" size={16} color="#ffffff" />
                <Typography variant="bodySmall" color="white">
                  View Map
                </Typography>
              </View>
            </View>

            {/* Description */}
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="DESCRIPTION"
                  placeholder="Tell runners what to expect, pace group info, etc."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={4}
                  className="h-32"
                  testID="input-event-description"
                />
              )}
            />
          </ScrollContainer>
        </KeyboardAvoidingView>

        {/* Bottom buttons */}
        <View className="px-4 pb-8 pt-4 bg-background-light dark:bg-background-dark border-t border-gray-100">
          <Button
            onPress={handleSubmit(onSubmit)}
            isLoading={createEvent.isPending}
            testID="button-create-event"
          >
            Create event
          </Button>
          <Button
            variant="link"
            onPress={() => router.back()}
            className="mt-3"
          >
            Cancel
          </Button>
        </View>
      </View>
    </View>
  );
}
