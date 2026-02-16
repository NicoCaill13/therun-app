import { View, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useCallback, useEffect } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useResolveEventCode, useParticipate } from '@/lib/api/join';
import { useAuth } from '@/lib/auth';
import { normalizeApiError } from '@/lib/api/normalizeApiError';
import {
  Header,
  Typography,
  CodeInput,
  Button,
  Card,
} from '@/components/ui';

// ============================================================================
// Join by Code / Success flow (maquettes: join_by_code_input + join_success_confirmation)
// ============================================================================

export default function JoinByCodeScreen() {
  const { code: initialCode } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [code, setCode] = useState(initialCode === 'code' ? '' : initialCode ?? '');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const resolveQuery = useResolveEventCode(code.length >= 4 ? code : undefined);
  const participate = useParticipate(code);

  // Clear error when code changes
  useEffect(() => {
    if (error) setError('');
  }, [code]);

  const handleContinue = useCallback(async () => {
    if (code.length < 4) {
      setError('Please enter the full code');
      return;
    }

    if (resolveQuery.isError) {
      setError('Invalid code. Please check and try again');
      return;
    }

    if (!resolveQuery.data) {
      setError('Checking code...');
      return;
    }

    // If authenticated, participate directly
    if (isAuthenticated) {
      try {
        await participate.mutateAsync();
        setShowSuccess(true);
      } catch (err) {
        const normalized = normalizeApiError(err);
        setError(normalized.message);
      }
    } else {
      // Redirect to login, preserving the code for post-auth join
      router.push(`/auth/login?redirect=/join/${code}` as '/auth/login');
    }
  }, [code, resolveQuery, isAuthenticated, participate]);

  if (showSuccess && resolveQuery.data) {
    return <JoinSuccessScreen event={resolveQuery.data} onDone={() => router.replace('/(tabs)')} />;
  }

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <View className={Platform.OS === 'web' ? 'max-w-md mx-auto w-full flex-1' : 'flex-1'}>
        <Header title="Join with Code" />

        <View className="flex-1 px-4 pt-6">
          <Typography variant="h1" className="mb-2">
            Enter Club Code
          </Typography>
          <Typography variant="body" color="secondary" className="mb-8">
            Enter the 6-character code provided by your organizer to join the session.
          </Typography>

          <CodeInput value={code} onChange={setCode} error={error} />
        </View>

        <View className="px-4 pb-8">
          <Button
            onPress={handleContinue}
            isLoading={participate.isPending}
          >
            Continue
          </Button>
          <Typography
            variant="bodySmall"
            color="secondary"
            className="text-center mt-4"
          >
            Where do I find the code?
          </Typography>
        </View>
      </View>
    </View>
  );
}

// ============================================================================
// Join Success Confirmation (maquette: join_success_confirmation)
// ============================================================================

function JoinSuccessScreen({
  event,
  onDone,
}: {
  event: { title: string; startDateTime: string; locationName: string | null };
  onDone: () => void;
}) {
  const dateStr = new Date(event.startDateTime).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <View className={`flex-1 items-center justify-center px-6 ${Platform.OS === 'web' ? 'max-w-md mx-auto w-full' : ''}`}>
        {/* Checkmark */}
        <View className="w-24 h-24 rounded-full bg-charcoal items-center justify-center mb-6">
          <MaterialIcons name="check" size={48} color="#ffffff" />
        </View>

        <Typography variant="label" color="secondary" className="mb-2">
          REGISTRATION CONFIRMED
        </Typography>
        <Typography variant="h1" className="text-center mb-8">
          You're in!
        </Typography>

        {/* Event card */}
        <Card padding="none" className="w-full overflow-hidden mb-6">
          <View className="h-40 bg-gray-200 dark:bg-gray-700 items-center justify-center">
            <MaterialIcons name="image" size={48} color="#d1d5db" />
          </View>
          <View className="p-4">
            <Typography variant="label" color="orange" className="mb-1">
              UPCOMING EVENT
            </Typography>
            <Typography variant="h3" className="mb-2">
              {event.title}
            </Typography>
            <View className="flex-row items-center gap-1 mb-1">
              <MaterialIcons name="calendar-today" size={14} color="#6b7280" />
              <Typography variant="bodySmall" color="secondary">
                {dateStr}
              </Typography>
            </View>
            {event.locationName && (
              <View className="flex-row items-center gap-1">
                <MaterialIcons name="location-on" size={14} color="#6b7280" />
                <Typography variant="bodySmall" color="secondary">
                  {event.locationName}
                </Typography>
              </View>
            )}
          </View>
        </Card>

        <Typography variant="bodySmall" color="secondary" className="text-center mb-8">
          A confirmation email has been sent to your inbox. Please check your spam folder if you
          don't see it.
        </Typography>

        <Button onPress={onDone}>Open in app</Button>
      </View>
    </View>
  );
}
