import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { isApiErrorKind, usePublicEventByCode, type PublicEventByCode } from '@/lib/api';

const C = {
  background: '#0e0e0e',
  primary: '#ff5722',
  onSurface: '#ffffff',
  muted: '#adaaaa',
  error: '#ff8a80',
  onPrimary: '#000000',
} as const;

/** Minimum characters before calling GET /public/events/by-code/:eventCode */
const MIN_EVENT_CODE_LENGTH = 4;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 16,
  },
  sectionTitle: {
    color: C.onSurface,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: C.onSurface,
    fontSize: 18,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  lookupBtn: {
    backgroundColor: C.primary,
    borderRadius: 4,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  lookupLabel: {
    color: C.onPrimary,
    fontSize: 15,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  errorText: {
    color: C.error,
    fontSize: 14,
    lineHeight: 20,
  },
  successCard: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    padding: 14,
    gap: 8,
  },
  successTitle: {
    color: C.onSurface,
    fontSize: 17,
    fontWeight: '700',
  },
  successMeta: {
    color: C.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  continueBtn: {
    marginTop: 8,
    backgroundColor: C.primary,
    borderRadius: 4,
    paddingVertical: 14,
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginVertical: 8,
  },
  primaryBtn: {
    backgroundColor: C.primary,
    borderRadius: 4,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ghostBtn: {
    borderWidth: 2,
    borderColor: C.primary,
    borderRadius: 4,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryLabel: {
    color: C.onPrimary,
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  ghostLabel: {
    color: C.onSurface,
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  hint: {
    color: C.muted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  retryWrap: {
    marginTop: 8,
  },
  retryLink: {
    color: C.error,
    fontSize: 14,
    lineHeight: 20,
    textDecorationLine: 'underline',
  },
});

/**
 * JSON body for GET /public/events/by-code/:eventCode (validated by PublicEventByCodeSchema in lib/api/join/types.ts).
 */
export type EventByCodeApiResponse = PublicEventByCode;

function normalizeEventCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '');
}

function formatStartLabel(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

export default function JoinCodeScreen() {
  const router = useRouter();
  const [draftCode, setDraftCode] = useState('');
  const [submittedCode, setSubmittedCode] = useState('');

  const normalizedDraft = useMemo(() => normalizeEventCode(draftCode), [draftCode]);

  const shouldFetch = submittedCode.length >= MIN_EVENT_CODE_LENGTH;

  const {
    data: eventByCode,
    error: lookupError,
    isFetching,
    isSuccess,
    isError,
    refetch,
  } = usePublicEventByCode(submittedCode, { enabled: shouldFetch });

  const onSubmitCode = useCallback(() => {
    const next = normalizeEventCode(draftCode);
    if (next.length < MIN_EVENT_CODE_LENGTH) {
      return;
    }
    setSubmittedCode(next);
  }, [draftCode]);

  const onContinueToJoin = useCallback(() => {
    if (!eventByCode) return;
    const code = eventByCode.join.eventCode;
    router.push(`/join/${code}`);
  }, [eventByCode, router]);

  const onScanQr = useCallback(() => {
    router.push('/scan');
  }, [router]);

  const onEnterCodeCamera = useCallback(() => {
    router.push({ pathname: '/scan', params: { mode: 'manual' } });
  }, [router]);

  const resultStale =
    submittedCode.length > 0 && normalizedDraft.length > 0 && normalizedDraft !== submittedCode;

  const showError = shouldFetch && isError && lookupError && !isFetching;
  const showSuccess =
    shouldFetch && isSuccess && eventByCode && !isFetching && !resultStale;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Join a Run',
          headerStyle: { backgroundColor: C.background },
          headerTintColor: C.onSurface,
          headerShadowVisible: false,
        }}
      />
      <SafeAreaView style={styles.root} edges={['bottom']}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Enter event code</Text>
          <TextInput
            value={draftCode}
            onChangeText={setDraftCode}
            placeholder="e.g. ABC123"
            placeholderTextColor={C.muted}
            style={styles.input}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={32}
            accessibilityLabel="Event code"
            returnKeyType="done"
            onSubmitEditing={onSubmitCode}
          />

          <Pressable
            onPress={onSubmitCode}
            style={styles.lookupBtn}
            disabled={normalizedDraft.length < MIN_EVENT_CODE_LENGTH || isFetching}
            accessibilityRole="button"
            accessibilityLabel="Look up event by code"
          >
            {isFetching ? (
              <ActivityIndicator color={C.onPrimary} accessibilityLabel="Loading event" />
            ) : (
              <Text style={styles.lookupLabel}>Look up event</Text>
            )}
          </Pressable>

          {showError && lookupError ? (
            <View>
              <Text style={styles.errorText} accessibilityRole="alert">
                {isApiErrorKind(lookupError, 'NOT_FOUND')
                  ? 'No event found for this code.'
                  : lookupError.message}
              </Text>
              <Pressable
                onPress={() => refetch()}
                accessibilityRole="button"
                accessibilityLabel="Retry lookup"
                style={styles.retryWrap}
              >
                <Text style={styles.retryLink}>Try again</Text>
              </Pressable>
            </View>
          ) : null}

          {resultStale ? (
            <Text style={styles.hint}>Code changed — tap Look up event to refresh.</Text>
          ) : null}

          {showSuccess && eventByCode ? (
            <View style={styles.successCard}>
              <Text style={styles.successTitle}>{eventByCode.title}</Text>
              <Text style={styles.successMeta}>Code: {eventByCode.eventCode}</Text>
              <Text style={styles.successMeta}>Status: {eventByCode.status}</Text>
              <Text style={styles.successMeta}>Starts: {formatStartLabel(eventByCode.startDateTime)}</Text>
              <Pressable
                onPress={onContinueToJoin}
                style={styles.continueBtn}
                accessibilityRole="button"
                accessibilityLabel="Continue to join this event"
              >
                <Text style={styles.lookupLabel}>Continue to join</Text>
              </Pressable>
            </View>
          ) : null}

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Or use camera</Text>
          <Pressable
            onPress={onScanQr}
            style={styles.primaryBtn}
            accessibilityRole="button"
            accessibilityLabel="Scan QR code"
          >
            <Text style={styles.primaryLabel}>Scan QR code</Text>
          </Pressable>

          <Pressable
            onPress={onEnterCodeCamera}
            style={styles.ghostBtn}
            accessibilityRole="button"
            accessibilityLabel="Open scanner for manual code entry"
          >
            <Text style={styles.ghostLabel}>Enter code with camera flow</Text>
          </Pressable>

          <Text style={styles.hint}>
            Manual lookup calls GET /public/events/by-code/:eventCode (see lib/api/join/hooks.ts).
          </Text>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
