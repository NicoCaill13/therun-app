import type { ReactElement } from 'react';

import { Redirect, Stack } from 'expo-router';

const isAuthenticated = true;

export default function AppGroupLayout(): ReactElement {
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/landing" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
