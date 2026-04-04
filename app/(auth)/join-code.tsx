import type { ReactElement } from 'react';

import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthNavBar } from '@/components/layout/TheRunNavBar';
import { AUTH_FORM_MAX_WIDTH, DESKTOP_BREAKPOINT } from '@/lib/constants/breakpoints';
import { shellHorizontalPadding } from '@/lib/constants/layout';

const SURFACE_DIM = '#0e0e0e';
const ON_SURFACE_VARIANT = '#adaaaa';

export default function JoinCodeScreen(): ReactElement {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <AuthNavBar />
      <View
        style={[
          styles.body,
          { paddingHorizontal: shellHorizontalPadding(width) },
          isDesktop && styles.bodyDesktop,
        ]}
      >
        <View style={[styles.column, isDesktop && styles.columnDesktop]}>
          <Text style={styles.title}>Join a Run</Text>
          <Text style={styles.hint}>Placeholder — wire join flow next.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: SURFACE_DIM,
  },
  body: {
    flex: 1,
    paddingTop: 16,
    paddingBottom: 32,
  },
  bodyDesktop: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  column: {
    width: '100%',
  },
  columnDesktop: {
    maxWidth: AUTH_FORM_MAX_WIDTH,
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  hint: {
    color: ON_SURFACE_VARIANT,
    marginTop: 8,
    fontSize: 14,
  },
});
