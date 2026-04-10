import type { ReactElement } from 'react';
import { useEffect, useMemo, useState } from 'react';

import { Redirect, Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { View } from 'react-native';

import { getAccessToken } from '@/lib/auth/tokenStorage';
import { createAppQueryClient } from '@/lib/query/queryClient';

const SURFACE_DIM = '#0e0e0e';

type GatePhase = 'loading' | 'authed' | 'guest';

export default function AppGroupLayout(): ReactElement {
  const [phase, setPhase] = useState<GatePhase>('loading');
  const queryClient = useMemo(() => createAppQueryClient(), []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const token = await getAccessToken();
      if (!cancelled) {
        setPhase(token ? 'authed' : 'guest');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (phase === 'loading') {
    return <View style={{ flex: 1, backgroundColor: SURFACE_DIM }} />;
  }

  if (phase === 'guest') {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="create-event" />
        <Stack.Screen name="route-library" />
      </Stack>
    </QueryClientProvider>
  );
}
