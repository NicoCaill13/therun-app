import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';

import { Redirect, Stack } from 'expo-router';
import { View } from 'react-native';

import { getAccessToken } from '@/lib/auth/tokenStorage';

const SURFACE_DIM = '#0e0e0e';

type GatePhase = 'loading' | 'authed' | 'guest';

export default function AppGroupLayout(): ReactElement {
  const [phase, setPhase] = useState<GatePhase>('loading');

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
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="create-event" />
      <Stack.Screen name="route-library" />
    </Stack>
  );
}
