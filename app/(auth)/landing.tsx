/**
 * =============================================================================
 * BACKEND API ENDPOINTS — Discovery summary (do not hardcode these in components)
 * Base URL: process.env.EXPO_PUBLIC_API_URL (e.g. http://127.0.0.1:3000)
 * All responses are wrapped: { statusCode, path, data, timestamp }
 *
 * [1] JOIN A RUN (guest, no auth required)
 *   Step 1 — Resolve event by code:
 *     GET  /api/join/:eventCode
 *     Response.data: JoinEventSummaryDto { eventId, title, startDateTime,
 *       locationName, locationLat, locationLng, organiserId,
 *       organiserFirstName, organiserLastName }
 *   Step 2 — Guest participate (public, no JWT):
 *     POST /api/public/events/:eventId/guest-join
 *     Body: { firstName: string, lastName?: string, email?: string }
 *     Response.data: { eventId, participantId, userId, isGuest }
 *   Step 2b — Authenticated participate (requires Bearer JWT):
 *     POST /api/join/:eventCode/participate
 *     Headers: Authorization: Bearer <accessToken>
 *     Response.data: { participantId, eventId, userId, role, status }
 *
 * [2] CREATE FULL ACCOUNT (sign up)
 *   POST /api/user/register
 *   Body: { email: string, firstName: string, lastName?: string, acceptTerms: boolean }
 *   Response.data: { accessToken, user: { id, email, firstName, lastName, isGuest, plan }, mergedFromGuest }
 *
 * [3] LOG IN (sign in)
 *   NOTE: No dedicated login endpoint found in backend controllers at discovery time.
 *   The backend issues a JWT on register. Login flow TBD — check with backend team.
 *   Placeholder route: /api/auth/login (to confirm with backend).
 * =============================================================================
 */

import { useCallback } from "react";
import type { ReactElement } from "react";

import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthNavBar } from "@/components/layout/TheRunNavBar";
import { DESKTOP_BREAKPOINT } from "@/lib/constants/breakpoints";
import { SHELL_PADDING_X_DESKTOP, SHELL_PADDING_X_MOBILE } from "@/lib/constants/layout";

const COLORS = {
  surface_dim: "#0e0e0e",
  surface_container: "#1a1919",
  surface_container_highest: "#262626",
  on_surface: "#ffffff",
  on_surface_variant: "#adaaaa",
  primary: "#ff5722",
  outline_variant: "#494847",
} as const;

const DESKTOP_CREATE_ACCOUNT_LIFT = 200;
const HERO_IMAGE_EXTRA_HEIGHT = 200;

export default function UnloguedIndex(): ReactElement {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const mobileActionLiftPadding = Math.max(104, Math.round(height * 0.18));

  const handleJoinRun = useCallback(() => {
    router.push("/(auth)/join-code");
  }, [router]);

  const handleCreateAccount = useCallback(() => {
    router.push("/(auth)/sign-up");
  }, [router]);

  const handleLogin = useCallback(() => {
    router.push("/(auth)/sign-in");
  }, [router]);

  const renderHero = (): ReactElement => (
    <>
      <Text
        style={[
          styles.heroTitle,
          isDesktop ? styles.heroTitleDesktop : styles.heroTitleMobile,
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        THE RUN
      </Text>
      <Text
        style={[styles.heroTagline, isDesktop && styles.heroTaglineDesktop]}
      >
        RUN. COMMUNITY. REPEAT.
      </Text>
    </>
  );

  const renderCtas = (): ReactElement => (
    <>
      {!isDesktop && (
        <>
          <Pressable
            onPress={handleJoinRun}
            accessibilityRole="button"
            accessibilityLabel="Join a Run (Scan/Code)"
            style={styles.primaryButtonHitArea}
            android_ripple={{ color: "rgba(0,0,0,0.15)" }}
          >
            {({ pressed }) => (
              <View
                style={[
                  styles.primaryButton,
                  pressed && styles.btnPressed,
                ]}
              >
                <MaterialIcons
                  name="qr-code-scanner"
                  size={22}
                  color="#000000"
                  accessibilityElementsHidden
                  importantForAccessibility="no"
                  style={styles.primaryButtonIcon}
                />
                <Text style={styles.btnPrimaryText}>JOIN A RUN</Text>
              </View>
            )}
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>OR</Text>
            <View style={styles.dividerLine} />
          </View>
        </>
      )}

      <Pressable
        onPress={handleCreateAccount}
        accessibilityRole="button"
        accessibilityLabel="Create Full Account"
        style={styles.ctaButtonHitArea}
        android_ripple={{ color: "rgba(0,0,0,0.15)" }}
      >
        {({ pressed }) => (
          <View
            style={[
              isDesktop ? styles.createAccountButtonDesktop : styles.btnSecondary,
              pressed && styles.btnPressed,
            ]}
          >
            <Text
              style={
                isDesktop ? styles.btnPrimaryText : styles.btnSecondaryText
              }
            >
              CREATE FULL ACCOUNT
            </Text>
          </View>
        )}
      </Pressable>

      <Pressable
        style={styles.loginRow}
        onPress={handleLogin}
        accessibilityRole="button"
        accessibilityLabel="Log in"
      >
        <Text style={styles.loginPrompt}>Already registered? </Text>
        <Text style={styles.loginLink}>Log in</Text>
      </Pressable>
    </>
  );

  return (
    <View style={styles.root}>
      <ImageBackground
        source={require("../../assets/images/bg-runners.png")}
        style={styles.heroBackground}
        resizeMode="cover"
        imageStyle={[
          styles.heroBackgroundImage,
          {
            height: height + HERO_IMAGE_EXTRA_HEIGHT,
            transform: [{ translateY: -HERO_IMAGE_EXTRA_HEIGHT / 2 }],
          },
        ]}
      >
        <View style={styles.heroOverlay} />
        <SafeAreaView
          style={[
            styles.safeArea,
            isDesktop ? styles.safeAreaDesktop : styles.safeAreaMobile,
          ]}
          edges={["top", "bottom"]}
        >
          <AuthNavBar variant="transparent" />

          {isDesktop ? (
            <>
              <View style={[styles.heroSection, styles.heroSectionDesktop]}>
                {renderHero()}
              </View>
              <View style={[styles.ctaSection, styles.ctaSectionDesktop]}>
                {renderCtas()}
              </View>
            </>
          ) : (
            <View
              style={[
                styles.mobileActionSheet,
                { paddingBottom: mobileActionLiftPadding },
              ]}
            >
              <View style={[styles.heroSection, styles.heroSectionMobile]}>
                {renderHero()}
              </View>
              <View style={styles.ctaSectionMobile}>{renderCtas()}</View>
            </View>
          )}
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.surface_dim,
  },
  heroBackground: {
    flex: 1,
    width: "100%",
    minHeight: "100%",
    backgroundColor: COLORS.surface_dim,
    overflow: "hidden",
  },
  heroBackgroundImage: {
    width: "100%",
    alignSelf: "center",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(14, 14, 14, 0.65)",
  },
  safeArea: {
    flex: 1,
  },
  safeAreaDesktop: {
    justifyContent: "space-between",
  },
  safeAreaMobile: {
    justifyContent: "flex-start",
  },
  mobileActionSheet: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
  },

  // Hero section
  heroSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SHELL_PADDING_X_MOBILE,
  },
  heroSectionDesktop: {
    justifyContent: "center",
  },
  heroSectionMobile: {
    flex: 0,
    flexGrow: 0,
    flexShrink: 1,
    justifyContent: "flex-end",
    paddingBottom: 16,
    alignItems: "center",
    width: "100%",
  },
  ctaSectionMobile: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
    alignItems: "center",
    paddingHorizontal: SHELL_PADDING_X_MOBILE,
    marginBottom: 112,
  },
  heroTitle: {
    fontFamily: "System",
    fontWeight: "900",
    fontStyle: "italic",
    letterSpacing: -4,
    lineHeight: undefined,
    color: COLORS.on_surface,
    textAlign: "center",
  },
  heroTitleMobile: {
    fontSize: 80,
    lineHeight: 72,
  },
  heroTitleDesktop: {
    fontSize: 160,
    lineHeight: 144,
  },
  heroTagline: {
    fontFamily: "System",
    fontSize: 13,
    fontWeight: "300",
    letterSpacing: 5,
    color: COLORS.on_surface_variant,
    textAlign: "center",
    marginTop: 12,
    textTransform: "uppercase",
  },
  heroTaglineDesktop: {
    fontSize: 20,
    letterSpacing: 8,
    marginTop: 16,
  },

  // CTA section
  ctaSection: {
    paddingHorizontal: SHELL_PADDING_X_MOBILE,
    paddingBottom: 12,
    gap: 0,
    alignItems: "stretch",
  },
  ctaSectionDesktop: {
    alignSelf: "center",
    width: 480,
    paddingHorizontal: 0,
    paddingBottom: 40,
  },

  /* Hit area: NativeWind can break styles on Pressable; visuals on inner View */
  primaryButtonHitArea: {
    alignSelf: "stretch",
  },
  ctaButtonHitArea: {
    alignSelf: "stretch",
  },
  /* Primary CTA — solid athletic orange (inner View; mobile Join a Run) */
  primaryButton: {
    backgroundColor: "#ff5722",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    height: 60,
    marginBottom: 24,
    alignSelf: "stretch",
    overflow: "hidden",
  },
  primaryButtonIcon: {
    marginRight: 10,
  },
  btnPrimaryText: {
    fontFamily: "System",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#000000",
    textTransform: "uppercase",
  },

  // Divider
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 16,
    alignSelf: "stretch",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.surface_dim,
    opacity: 0.85,
  },
  dividerLabel: {
    fontFamily: "System",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 4,
    color: COLORS.on_surface_variant,
    textTransform: "uppercase",
  },

  // Secondary button
  btnSecondary: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: COLORS.primary,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
    alignSelf: "stretch",
  },
  btnSecondaryText: {
    fontFamily: "System",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 2,
    color: COLORS.on_surface,
    textTransform: "uppercase",
  },
  createAccountButtonDesktop: {
    backgroundColor: "#ff5722",
    justifyContent: "center",
    alignItems: "center",
    height: 60,
    marginTop: -DESKTOP_CREATE_ACCOUNT_LIFT,
    marginBottom: 28,
    alignSelf: "stretch",
    overflow: "hidden",
    borderWidth: 0,
  },

  // Pressed state
  btnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },

  // Login link
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 4,
  },
  loginPrompt: {
    fontFamily: "System",
    fontSize: 13,
    color: COLORS.on_surface_variant,
    letterSpacing: 0.5,
  },
  loginLink: {
    fontFamily: "System",
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.on_surface,
    letterSpacing: 0.5,
  },

  // Desktop ambient decor
  desktopAmbient: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: SHELL_PADDING_X_DESKTOP,
    paddingBottom: 40,
  },
  ambientLeft: {
    gap: 4,
  },
  ambientRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  ambientLabel: {
    fontFamily: "System",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 5,
    color: COLORS.primary,
    textTransform: "uppercase",
  },
  ambientStat: {
    fontFamily: "System",
    fontSize: 44,
    fontWeight: "900",
    fontStyle: "italic",
    letterSpacing: -2,
    color: COLORS.on_surface,
  },
  ambientUnit: {
    fontSize: 18,
    fontStyle: "italic",
    opacity: 0.5,
  },
  ambientCoords: {
    fontFamily: "System",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
    color: `${COLORS.on_surface}40`,
  },
});
