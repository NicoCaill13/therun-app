import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Rect, Stop } from 'react-native-svg';

import { useAuth } from '@/lib/auth';

// Local asset (same hero as guest landing; replace if Stitch exports a dedicated asset)
const HERO_SOURCE = require('../../assets/images/login-landing.png');

// Stitch theme tokens (tpl/stitch/code.html)
const C = {
  primary: '#ff5722',
  background: '#0e0e0e',
  onPrimary: '#000000',
  onSurface: '#ffffff',
  onSurfaceVariant: '#adaaaa',
  outlineVariantRgb: '73, 72, 71',
} as const;

const BORDER_RADIUS_BUTTON = 4;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.background,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  absoluteFill: {
    ...StyleSheet.absoluteFillObject,
  },
  titleShadow: {
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  primaryButton: {
    backgroundColor: C.primary,
  },
  secondaryButton: {
    borderColor: C.primary,
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  dividerLine: {
    backgroundColor: `rgba(${C.outlineVariantRgb}, 0.3)`,
  },
  bottomBlock: {
    maxWidth: 448,
    width: '100%',
    alignSelf: 'center',
  },
  authGateCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTopBlock: {
    width: '100%',
    maxWidth: 768,
    alignSelf: 'center',
  },
});

// --- Hero gradient: matches .hero-gradient in Stitch HTML ---

interface HeroGradientOverlayProps {
  width: number;
  height: number;
}

function HeroGradientOverlay({ width, height }: HeroGradientOverlayProps) {
  if (width <= 0 || height <= 0) return null;

  return (
    <Svg width={width} height={height} style={styles.absoluteFill} pointerEvents="none">
      <Defs>
        <SvgLinearGradient id="authHeroGrad" x1="0" y1="1" x2="0" y2="0">
          <Stop offset="0" stopColor={C.background} stopOpacity={1} />
          <Stop offset="0.25" stopColor={C.background} stopOpacity={0.95} />
          <Stop offset="0.6" stopColor={C.background} stopOpacity={0.4} />
          <Stop offset="1" stopColor={C.background} stopOpacity={0.2} />
        </SvgLinearGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={height} fill="url(#authHeroGrad)" />
    </Svg>
  );
}

interface HeroLayerProps {
  children: ReactNode;
}

function HeroLayer({ children }: HeroLayerProps) {
  const [layout, setLayout] = useState({ width: 0, height: 0 });

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setLayout((prev) =>
      prev.width === width && prev.height === height ? prev : { width, height }
    );
  }, []);

  return (
    <View className="flex-1 w-full" onLayout={onLayout}>
      <Image source={HERO_SOURCE} style={styles.heroImage} contentFit="cover" priority="high" />
      <View style={styles.absoluteFill} pointerEvents="none">
        <HeroGradientOverlay width={layout.width} height={layout.height} />
      </View>
      {children}
    </View>
  );
}

/**
 * Universal auth welcome (Stitch → React Native).
 * Primary CTA → /join-code (scan or manual code). Create account → /sign-up.
 */
export default function AuthWelcomeScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const titleFontSize = isWide ? 96 : 56;
  const taglineFontSize = isWide ? 24 : 18;

  const dynamicText = useMemo(
    () =>
      StyleSheet.create({
        title: {
          fontSize: titleFontSize,
          lineHeight: titleFontSize * 1.05,
        },
        tagline: {
          color: C.onSurfaceVariant,
          fontSize: taglineFontSize,
          letterSpacing: taglineFontSize * 0.1,
        },
        primaryCtaLabel: {
          color: C.onPrimary,
          fontSize: 18,
          letterSpacing: 0.2,
        },
        orLabel: {
          color: C.onSurfaceVariant,
          letterSpacing: 4,
        },
        secondaryCtaLabel: {
          color: C.onSurface,
          fontSize: 18,
          letterSpacing: 0.2,
        },
        footerMuted: { color: C.onSurfaceVariant },
        footerLink: { color: C.onSurface },
        buttonRadius: { borderRadius: BORDER_RADIUS_BUTTON },
      }),
    [titleFontSize, taglineFontSize]
  );

  const onJoinRun = useCallback(() => {
    router.push('/(auth)/join-code');
  }, [router]);

  const onCreateAccount = useCallback(() => {
    router.push('/(auth)/sign-up');
  }, [router]);

  const onLogIn = useCallback(() => {
    router.push('/(auth)/sign-in');
  }, [router]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/(tabs)/home');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <View style={[styles.root, styles.authGateCenter]}>
        <ActivityIndicator size="large" color={C.primary} accessibilityLabel="Loading session" />
      </View>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <View style={styles.root}>
      <HeroLayer>
        <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
          <View className="flex-1 justify-between">
            <View className="flex-1 px-8 justify-center items-center pt-24 w-full" style={styles.heroTopBlock}>
              <Text
                className="text-center font-black italic text-white"
                style={[styles.titleShadow, dynamicText.title]}
                accessibilityRole="header"
                accessibilityLabel="THE RUN"
              >
                THE RUN
              </Text>
              <Text className="text-center font-light uppercase mt-2" style={dynamicText.tagline}>
                Run. Community. Repeat.
              </Text>
            </View>

            <View className="w-full px-8 pb-16 gap-6" style={styles.bottomBlock}>
              <Pressable
                onPress={onJoinRun}
                className="w-full flex-row items-center justify-center gap-3 active:opacity-95 py-5 px-4"
                style={[styles.primaryButton, dynamicText.buttonRadius]}
                accessibilityRole="button"
                accessibilityHint="Opens join options with scan or code entry"
                accessibilityLabel="Join a run, scan or enter code"
              >
                <MaterialIcons name="qr-code-scanner" size={26} color={C.onPrimary} />
                <Text className="font-black uppercase flex-shrink" style={dynamicText.primaryCtaLabel} numberOfLines={2}>
                  Join a Run (Scan/Code)
                </Text>
              </Pressable>

              <View className="flex-row items-center gap-4 py-2">
                <View className="flex-1 h-px" style={styles.dividerLine} />
                <Text className="text-xs font-bold uppercase" style={dynamicText.orLabel}>
                  OR
                </Text>
                <View className="flex-1 h-px" style={styles.dividerLine} />
              </View>

              <Pressable
                onPress={onCreateAccount}
                className="w-full items-center justify-center active:opacity-90 py-5 px-4"
                style={[styles.secondaryButton, dynamicText.buttonRadius]}
                accessibilityRole="button"
                accessibilityLabel="Create full account"
              >
                <Text className="font-black uppercase" style={dynamicText.secondaryCtaLabel}>
                  Create Full Account
                </Text>
              </Pressable>

              <View className="mt-1 items-center">
                <View className="flex-row flex-wrap items-center justify-center gap-1">
                  <Text className="text-sm" style={dynamicText.footerMuted}>
                    Already registered?
                  </Text>
                  <Pressable onPress={onLogIn} accessibilityRole="link" accessibilityLabel="Log in">
                    <Text className="text-sm font-bold" style={dynamicText.footerLink}>
                      Log in
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </HeroLayer>
    </View>
  );
}
