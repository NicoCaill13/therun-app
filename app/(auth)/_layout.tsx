import { Stack } from 'expo-router';

/**
 * Auth / pre-login flow (Stitch landing, join code, sign-up).
 * Group name (auth) does not appear in the URL path.
 */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: '#0e0e0e' },
      }}
    />
  );
}
