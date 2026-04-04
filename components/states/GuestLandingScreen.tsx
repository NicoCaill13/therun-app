import { useState } from 'react';
import { ImageBackground, LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Rect, Stop } from 'react-native-svg';

const LOGIN_LANDING_IMAGE = require('../../assets/images/login-landing.png');

const STITCH_PRIMARY_HEX = '#ff5722';
const STITCH_BACKGROUND_HEX = '#0e0e0e';

const styles = StyleSheet.create({
  imageBackground: {
    flex: 1,
    width: '100%',
  },
  absoluteFill: {
    ...StyleSheet.absoluteFillObject,
  },
  rootFallback: {
    backgroundColor: STITCH_BACKGROUND_HEX,
  },
  titleShadow: {
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  primaryButton: {
    backgroundColor: STITCH_PRIMARY_HEX,
  },
  secondaryButton: {
    borderColor: STITCH_PRIMARY_HEX,
    backgroundColor: 'transparent',
  },
  dividerLine: {
    backgroundColor: 'rgba(73, 72, 71, 0.3)',
  },
});

// ============================================================================
// Hero gradient — matches .hero-gradient in tpl/stitch/code.html
// ============================================================================

function HeroGradientOverlay() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((prev: { width: number; height: number }) =>
      prev.width === width && prev.height === height ? prev : { width, height }
    );
  };

  return (
    <View className="absolute inset-0" onLayout={onLayout} pointerEvents="none">
      {size.width > 0 && size.height > 0 ? (
        <Svg width={size.width} height={size.height} style={styles.absoluteFill}>
          <Defs>
            <SvgLinearGradient id="heroGrad" x1="0" y1="1" x2="0" y2="0">
              <Stop offset="0" stopColor={STITCH_BACKGROUND_HEX} stopOpacity={1} />
              <Stop offset="0.25" stopColor={STITCH_BACKGROUND_HEX} stopOpacity={0.95} />
              <Stop offset="0.6" stopColor={STITCH_BACKGROUND_HEX} stopOpacity={0.4} />
              <Stop offset="1" stopColor={STITCH_BACKGROUND_HEX} stopOpacity={0.2} />
            </SvgLinearGradient>
          </Defs>
          <Rect x={0} y={0} width={size.width} height={size.height} fill="url(#heroGrad)" />
        </Svg>
      ) : null}
    </View>
  );
}

// ============================================================================
// Guest landing (unauthenticated) — tpl/stitch/code.html + tpl/unlogued.png
// ============================================================================

export interface GuestLandingScreenProps {
  onJoinRun: () => void;
  onCreateAccount: () => void;
  onLogIn: () => void;
}

export function GuestLandingScreen({
  onJoinRun,
  onCreateAccount,
  onLogIn,
}: GuestLandingScreenProps) {
  return (
    <View className="flex-1" style={styles.rootFallback}>
      <ImageBackground
        source={LOGIN_LANDING_IMAGE}
        style={styles.imageBackground}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      >
        <View className="flex-1 w-full">
          <HeroGradientOverlay />
          <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
            <View className="flex-1 justify-between">
              <View className="flex-1 px-8 justify-center items-center pt-24">
                <Text
                  className="text-white text-center font-black italic tracking-tighter leading-none text-6xl"
                  style={styles.titleShadow}
                  accessibilityRole="header"
                  accessibilityLabel="THE RUN"
                >
                  THE RUN
                </Text>
                <Text className="text-[#adaaaa] text-lg font-light tracking-[0.2em] mt-2 uppercase text-center">
                  Run. Community. Repeat.
                </Text>
              </View>

              <View className="w-full px-8 pb-16 max-w-md self-center">
                <View className="gap-6">
                  <Pressable
                    onPress={onJoinRun}
                    className="w-full rounded-[0.25rem] py-5 px-4 flex-row items-center justify-center gap-3 active:opacity-95"
                    style={styles.primaryButton}
                    accessibilityRole="button"
                    accessibilityLabel="Join a run, scan or enter code"
                  >
                    <MaterialIcons name="qr-code-scanner" size={26} color="#000000" />
                    <Text
                      className="text-black font-black text-lg tracking-tight uppercase flex-shrink"
                      numberOfLines={2}
                    >
                      Join a Run (Scan/Code)
                    </Text>
                  </Pressable>

                  <View className="flex-row items-center gap-4 py-2">
                    <View className="flex-1 h-px" style={styles.dividerLine} />
                    <Text className="text-[#adaaaa] text-xs font-bold tracking-widest uppercase">
                      OR
                    </Text>
                    <View className="flex-1 h-px" style={styles.dividerLine} />
                  </View>

                  <Pressable
                    onPress={onCreateAccount}
                    className="w-full rounded-[0.25rem] py-5 px-4 items-center justify-center border-2 active:opacity-90"
                    style={styles.secondaryButton}
                    accessibilityRole="button"
                    accessibilityLabel="Create full account"
                  >
                    <Text className="text-white font-black text-lg tracking-tight uppercase">
                      Create Full Account
                    </Text>
                  </Pressable>

                  <View className="mt-1 items-center">
                    <View className="flex-row flex-wrap items-center justify-center gap-1">
                      <Text className="text-sm text-[#adaaaa]">Already registered?</Text>
                      <Pressable onPress={onLogIn} accessibilityRole="link" accessibilityLabel="Log in">
                        <Text className="text-sm font-bold text-white">Log in</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </ImageBackground>
    </View>
  );
}
