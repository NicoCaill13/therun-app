import type { ReactElement } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";

import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { AppNavBar } from "@/components/layout/TheRunNavBar";
import { DESKTOP_BREAKPOINT } from "@/lib/constants/breakpoints";
import { shellHorizontalPadding } from "@/lib/constants/layout";
import type { DesktopGridRouteMock, FavoriteRouteMock } from "@/lib/mocks/routeLibrary";
import {
  MOCK_DESKTOP_LOCAL_ROUTES,
  MOCK_FAVORITE_ROUTES,
  ROUTE_LIBRARY_GLOBAL_HERO_URI,
  ROUTE_LIBRARY_PROFILE_URI,
} from "@/lib/mocks/routeLibrary";

const SURFACE_DIM = "#0e0e0e";
const SURFACE_CONTAINER = "#1a1919";
const SURFACE_CONTAINER_LOW = "#131313";
const SURFACE_CONTAINER_HIGH = "#201f1f";
const SURFACE_CONTAINER_HIGHEST = "#262626";
const ON_SURFACE = "#ffffff";
const ON_SURFACE_VARIANT = "#adaaaa";
const ON_PRIMARY_FIXED = "#000000";
const PRIMARY = "#ff5722";
const PRIMARY_DIM = "#ff734a";
const PRIMARY_FIXED_DIM = "#ff5d2b";
const PLACEHOLDER_MUTED = "#3f3f46";
const ERROR_CONTAINER = "#9f0519";
const ON_ERROR_CONTAINER = "#ffa8a3";

const ICON_MD = 22;
const ICON_LG = 28;
const TAB_CHIP_GAP = 8;

type RouteHubTab = "library" | "global";

const FILTER_CHIPS = ["5KM", "10KM", "TRAIL", "ROAD", "MARATHON"] as const;

const DESKTOP_SURFACE_FILTERS = [
  "ALL TERRAIN",
  "URBAN ASPHALT",
  "GRAVEL TRAILS",
  "NIGHT SPRINT",
] as const;

function parseHubTab(raw: string | undefined): RouteHubTab {
  return raw === "global" ? "global" : "library";
}

interface FavoriteRouteCardProps {
  item: FavoriteRouteMock;
  onPress: () => void;
  testID?: string;
}

function FavoriteRouteCard({ item, onPress, testID }: FavoriteRouteCardProps): ReactElement {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Select route ${item.title}`}
      testID={testID}
      style={({ pressed }) => [styles.favCard, pressed && styles.cardPressed]}
    >
      <View style={styles.favCardMap}>
        <Image source={{ uri: item.mapUri }} style={styles.favMapImg} contentFit="cover" />
        <View style={styles.favMapScrim} />
        <View style={styles.favPathWrap} pointerEvents="none">
          <Svg width="100%" height="100%" viewBox="0 0 100 100">
            <Path
              d={item.pathD}
              fill="none"
              stroke={PRIMARY_DIM}
              strokeWidth={3}
              strokeLinecap="round"
            />
          </Svg>
        </View>
        <View style={styles.favBadgeRow}>
          <View style={styles.kindBadge}>
            <Text style={styles.kindBadgeText}>{item.kindLabel}</Text>
          </View>
        </View>
      </View>
      <View style={styles.favCardFooter}>
        <View>
          <Text style={styles.favSlug}>{item.slugLabel}</Text>
          <Text style={styles.favTitle}>{item.title}</Text>
        </View>
        <View style={styles.favDistanceBlock}>
          <Text style={styles.favDistanceNum}>{item.distanceKm}</Text>
          <Text style={styles.favKm}>KM</Text>
        </View>
      </View>
    </Pressable>
  );
}

interface DesktopRouteCardProps {
  item: DesktopGridRouteMock;
  onPress: () => void;
}

function DesktopRouteCard({ item, onPress }: DesktopRouteCardProps): ReactElement {
  const badgeIsElite = item.levelBadge === "ELITE";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Select route ${item.metaLabel}`}
      style={({ pressed }) => [styles.deskCard, pressed && styles.cardPressed]}
    >
      <View style={styles.deskAccentBar} />
      <View style={styles.deskImgWrap}>
        <Image source={{ uri: item.mapUri }} style={styles.deskImg} contentFit="cover" />
        <View style={styles.deskImgScrim} />
        <View
          style={[
            styles.levelBadgeFloat,
            badgeIsElite ? styles.levelBadgeElite : styles.levelBadgeDefault,
          ]}
        >
          <Text
            style={[
              styles.levelBadgeText,
              badgeIsElite && styles.levelBadgeTextElite,
            ]}
          >
            {item.levelBadge}
          </Text>
        </View>
      </View>
      <View style={styles.deskCardBody}>
        <Text style={styles.deskMeta}>{item.metaLabel}</Text>
        <Text style={styles.deskDistance}>{item.distanceLabel}</Text>
        <View style={styles.deskMetaRow}>
          <MaterialIcons name="trending-up" size={16} color={ON_SURFACE_VARIANT} />
          <Text style={styles.deskSmallMeta}>{item.elevation}</Text>
          <MaterialIcons name="timer" size={16} color={ON_SURFACE_VARIANT} />
          <Text style={styles.deskSmallMeta}>{item.duration}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function RouteLibraryScreen(): ReactElement {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ source?: string }>();
  const { width: winWidth } = useWindowDimensions();
  const width = Math.max(winWidth, Dimensions.get("window").width);
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const horizontalPad = shellHorizontalPadding(width);

  const paramHub = useMemo(() => parseHubTab(params.source), [params.source]);
  const [hub, setHub] = useState<RouteHubTab>(paramHub);
  const [search, setSearch] = useState("");
  const [chipActive, setChipActive] = useState<string>(FILTER_CHIPS[0]);
  const [surfaceIdx, setSurfaceIdx] = useState(0);

  useEffect(() => {
    setHub(paramHub);
  }, [paramHub]);

  const onBack = useCallback((): void => {
    router.back();
  }, [router]);

  const onRoutePick = useCallback((): void => {
    router.back();
  }, [router]);

  const mainBottomPad = useMemo(() => {
    if (isDesktop) return 40;
    return 100 + insets.bottom;
  }, [isDesktop, insets.bottom]);

  const content = (
    <>
      <View style={[styles.toolRow, { paddingHorizontal: horizontalPad }]}>
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          testID="route-library-back"
        >
          <MaterialIcons name="arrow-back" size={ICON_MD} color={PRIMARY} />
        </Pressable>
        <Text style={styles.screenTitle}>SELECT ROUTE</Text>
        <Image
          source={{ uri: ROUTE_LIBRARY_PROFILE_URI }}
          style={styles.avatar}
          contentFit="cover"
        />
      </View>

      {isDesktop ? null : (
        <View style={[styles.tabRow, { marginHorizontal: horizontalPad }]}>
          <Pressable
            onPress={() => setHub("library")}
            style={[
              styles.tabBtn,
              hub === "library" ? styles.tabBtnOn : styles.tabBtnOff,
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: hub === "library" }}
            testID="route-library-tab-my"
          >
            <Text style={[styles.tabLabel, hub === "library" && styles.tabLabelOn]}>MY LIBRARY</Text>
          </Pressable>
          <Pressable
            onPress={() => setHub("global")}
            style={[
              styles.tabBtn,
              hub === "global" ? styles.tabBtnOn : styles.tabBtnOff,
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: hub === "global" }}
            testID="route-library-tab-global"
          >
            <Text style={[styles.tabLabel, hub === "global" && styles.tabLabelOn]}>GLOBAL LIBRARY</Text>
          </Pressable>
        </View>
      )}

      {isDesktop ? (
        <View style={[styles.desktopShell, { paddingHorizontal: horizontalPad, gap: 28 }]}>
          <View style={styles.desktopAside}>
            <Text style={styles.asideHeading}>SEARCH ROUTES</Text>
            <View style={styles.searchWrap}>
              <MaterialIcons name="search" size={20} color={ON_SURFACE_VARIANT} style={styles.searchIcon} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="BERLIN SUBURBS..."
                placeholderTextColor={PLACEHOLDER_MUTED}
                style={styles.searchInputDesktop}
                autoCapitalize="characters"
              />
            </View>
            <Text style={styles.asideHeading}>SURFACE TYPE</Text>
            <View style={styles.surfaceList}>
              {DESKTOP_SURFACE_FILTERS.map((label, i) => {
                const on = i === surfaceIdx;
                return (
                  <Pressable
                    key={label}
                    onPress={() => setSurfaceIdx(i)}
                    style={({ pressed }) => [
                      styles.surfaceRow,
                      on ? styles.surfaceRowOn : styles.surfaceRowOff,
                      pressed && styles.cardPressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                  >
                    <Text style={[styles.surfaceRowLabel, on && styles.surfaceRowLabelOn]}>{label}</Text>
                    {on ? (
                      <MaterialIcons name="check-circle" size={18} color={ON_PRIMARY_FIXED} />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.asideHeading}>DIFFICULTY RANGE</Text>
            <View style={styles.diffRow}>
              {["0-10KM", "10-25KM", "25KM+"].map((label) => (
                <View
                  key={label}
                  style={[
                    styles.diffChip,
                    label === "10-25KM" ? styles.diffChipHighlight : styles.diffChipIdle,
                  ]}
                >
                  <Text
                    style={[
                      styles.diffChipText,
                      label === "10-25KM" && styles.diffChipTextHighlight,
                    ]}
                  >
                    {label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.desktopMain}>
            <View style={styles.deskHubTabs}>
              <Pressable
                onPress={() => setHub("library")}
                style={[styles.deskHubTab, hub === "library" && styles.deskHubTabOn]}
                accessibilityRole="tab"
                accessibilityState={{ selected: hub === "library" }}
                testID="route-library-desk-tab-my"
              >
                <Text style={[styles.deskHubTabText, hub === "library" && styles.deskHubTabTextOn]}>
                  MY LIBRARY
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setHub("global")}
                style={[styles.deskHubTab, hub === "global" && styles.deskHubTabOn]}
                accessibilityRole="tab"
                accessibilityState={{ selected: hub === "global" }}
                testID="route-library-desk-tab-global"
              >
                <Text style={[styles.deskHubTabText, hub === "global" && styles.deskHubTabTextOn]}>
                  GLOBAL LIBRARY
                </Text>
              </Pressable>
            </View>

            {hub === "library" ? (
              <>
                <Text style={styles.deskHero}>LOCAL SESSIONS</Text>
                <Text style={styles.deskSub}>
                  Curated performance routes within 50km of your current GPS lock.
                </Text>
                <View style={styles.deskGrid}>
                  {MOCK_DESKTOP_LOCAL_ROUTES.map((item) => (
                    <DesktopRouteCard key={item.id} item={item} onPress={onRoutePick} />
                  ))}
                </View>
              </>
            ) : (
              <View style={styles.premiumWrap}>
                <Image
                  source={{ uri: ROUTE_LIBRARY_GLOBAL_HERO_URI }}
                  style={styles.premiumBg}
                  contentFit="cover"
                />
                <View style={styles.premiumScrim} />
                <View style={styles.premiumInner}>
                  <View style={styles.premiumBadge}>
                    <MaterialIcons name="star" size={14} color={ON_PRIMARY_FIXED} />
                    <Text style={styles.premiumBadgeText}>ELITE ACCESS</Text>
                  </View>
                  <Text style={styles.premiumTitle}>GLOBAL ROUTES</Text>
                  <Text style={styles.premiumBody}>
                    {
                      "Unlock iconic runs in Tokyo, London, and New York. Experience the world's most aggressive performance paths with zero latency."
                    }
                  </Text>
                  <Pressable
                    style={({ pressed }) => [styles.premiumCta, pressed && styles.cardPressed]}
                    accessibilityRole="button"
                    accessibilityLabel="Unlock global routes"
                  >
                    <Text style={styles.premiumCtaText}>UNLOCK THE WORLD</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        </View>
      ) : (
        <View style={{ paddingHorizontal: horizontalPad, gap: 20 }}>
          <View style={styles.searchWrap}>
            <MaterialIcons name="search" size={20} color={ON_SURFACE_VARIANT} style={styles.searchIcon} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search routes..."
              placeholderTextColor={PLACEHOLDER_MUTED}
              style={styles.searchInputMobile}
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {FILTER_CHIPS.map((c) => {
              const on = c === chipActive;
              return (
                <Pressable
                  key={c}
                  onPress={() => setChipActive(c)}
                  style={[styles.filterChip, on ? styles.filterChipOn : styles.filterChipOff]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                >
                  <Text style={[styles.filterChipText, on && styles.filterChipTextOn]}>{c}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {hub === "library" ? (
            <>
              <Text style={styles.sectionTitle}>FAVORITES</Text>
              {MOCK_FAVORITE_ROUTES.map((item, idx) => (
                <FavoriteRouteCard
                  key={item.id}
                  item={item}
                  onPress={onRoutePick}
                  testID={idx === 0 ? "route-library-card-1" : undefined}
                />
              ))}
            </>
          ) : null}

          {hub === "global" ? (
            <View style={styles.globalLocked}>
              <View style={styles.globalHeader}>
                <Text style={styles.globalTitle}>GLOBAL HUB</Text>
                <MaterialIcons name="lock" size={22} color={PRIMARY} />
              </View>
              <View style={styles.globalGhostStack}>
                <View style={styles.globalGhostRow} />
                <View style={styles.globalGhostRow} />
              </View>
              <View style={styles.globalOverlay}>
                <View style={styles.upgradeCard}>
                  <Text style={styles.upgradeTitle}>Unlock 500+ Pro Routes</Text>
                  <Pressable
                    style={({ pressed }) => [styles.upgradeBtn, pressed && styles.cardPressed]}
                    accessibilityRole="button"
                    accessibilityLabel="Upgrade to premium"
                  >
                    <Text style={styles.upgradeBtnText}>UPGRADE TO PREMIUM</Text>
                  </Pressable>
                  <Text style={styles.upgradeHint}>START 7-DAY FREE TRIAL</Text>
                </View>
              </View>
            </View>
          ) : null}
        </View>
      )}
    </>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <AppNavBar />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={{
          paddingBottom: mainBottomPad,
          paddingTop: 12,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {content}
      </ScrollView>

      {isDesktop ? null : (
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Close library"
          style={[
            styles.fabClose,
            { bottom: 28 + insets.bottom, right: horizontalPad },
          ]}
          testID="route-library-fab-close"
        >
          <MaterialIcons name="close" size={ICON_LG} color={ON_PRIMARY_FIXED} />
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: SURFACE_DIM,
  },
  flex: {
    flex: 1,
  },
  toolRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  screenTitle: {
    flex: 1,
    textAlign: "center",
    color: PRIMARY,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  avatar: {
    width: 32,
    height: 32,
    backgroundColor: SURFACE_CONTAINER_HIGHEST,
  },
  tabRow: {
    flexDirection: "row",
    gap: TAB_CHIP_GAP,
    padding: 4,
    backgroundColor: SURFACE_CONTAINER,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  tabBtnOn: {
    backgroundColor: SURFACE_CONTAINER_LOW,
  },
  tabBtnOff: {
    backgroundColor: "transparent",
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    color: ON_SURFACE_VARIANT,
  },
  tabLabelOn: {
    color: PRIMARY,
  },
  searchWrap: {
    backgroundColor: SURFACE_CONTAINER_HIGHEST,
    flexDirection: "row",
    alignItems: "center",
  },
  searchIcon: {
    marginLeft: 14,
  },
  searchInputMobile: {
    flex: 1,
    color: ON_SURFACE,
    fontSize: 15,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  searchInputDesktop: {
    flex: 1,
    color: ON_SURFACE,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    textTransform: "uppercase",
  },
  chipsRow: {
    gap: 12,
    paddingBottom: 4,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 22,
  },
  filterChipOn: {
    backgroundColor: PRIMARY_FIXED_DIM,
  },
  filterChipOff: {
    backgroundColor: SURFACE_CONTAINER_HIGHEST,
  },
  filterChipText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    color: ON_SURFACE_VARIANT,
  },
  filterChipTextOn: {
    color: ON_PRIMARY_FIXED,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: "900",
    fontStyle: "italic",
    color: ON_SURFACE,
    marginBottom: 12,
    letterSpacing: -1,
  },
  favCard: {
    backgroundColor: SURFACE_CONTAINER_LOW,
    marginBottom: 20,
    overflow: "hidden",
  },
  favCardMap: {
    height: 160,
    backgroundColor: SURFACE_CONTAINER_HIGH,
    position: "relative",
  },
  favMapImg: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.45,
  },
  favMapScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(19, 19, 19, 0.55)",
  },
  favPathWrap: {
    ...StyleSheet.absoluteFillObject,
    margin: 28,
  },
  favBadgeRow: {
    position: "absolute",
    left: 14,
    bottom: 14,
    flexDirection: "row",
    gap: 8,
  },
  kindBadge: {
    backgroundColor: PRIMARY_FIXED_DIM,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  kindBadgeText: {
    color: ON_PRIMARY_FIXED,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },
  favCardFooter: {
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  favSlug: {
    color: PRIMARY,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  favTitle: {
    color: ON_SURFACE,
    fontSize: 18,
    fontWeight: "700",
  },
  favDistanceBlock: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  favDistanceNum: {
    color: ON_SURFACE,
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -1,
  },
  favKm: {
    color: ON_SURFACE_VARIANT,
    fontSize: 11,
    fontWeight: "800",
    marginLeft: 4,
  },
  cardPressed: {
    opacity: 0.94,
  },
  globalLocked: {
    marginTop: 28,
    position: "relative",
    minHeight: 280,
  },
  globalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  globalTitle: {
    fontSize: 28,
    fontWeight: "900",
    fontStyle: "italic",
    color: ON_SURFACE,
    opacity: 0.4,
  },
  globalGhostStack: {
    gap: 16,
    opacity: 0.22,
  },
  globalGhostRow: {
    height: 88,
    backgroundColor: SURFACE_CONTAINER_LOW,
    paddingHorizontal: 20,
  },
  globalOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 32,
  },
  upgradeCard: {
    backgroundColor: "rgba(23, 23, 23, 0.92)",
    padding: 28,
    alignItems: "center",
    maxWidth: 340,
    width: "100%",
  },
  upgradeTitle: {
    color: ON_SURFACE,
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 16,
  },
  upgradeBtn: {
    borderWidth: 2,
    borderColor: PRIMARY,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: "100%",
    alignItems: "center",
  },
  upgradeBtnText: {
    color: PRIMARY,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
  },
  upgradeHint: {
    marginTop: 14,
    color: ON_SURFACE_VARIANT,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 2,
  },
  fabClose: {
    position: "absolute",
    width: 56,
    height: 56,
    backgroundColor: PRIMARY_FIXED_DIM,
    alignItems: "center",
    justifyContent: "center",
  },
  desktopShell: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  desktopAside: {
    width: 288,
    gap: 20,
  },
  asideHeading: {
    color: PRIMARY,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 3,
  },
  surfaceList: {
    gap: 8,
  },
  surfaceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  surfaceRowOn: {
    backgroundColor: PRIMARY_FIXED_DIM,
  },
  surfaceRowOff: {
    backgroundColor: SURFACE_CONTAINER_LOW,
  },
  surfaceRowLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: ON_SURFACE_VARIANT,
  },
  surfaceRowLabelOn: {
    color: ON_PRIMARY_FIXED,
  },
  diffRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  diffChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  diffChipIdle: {
    backgroundColor: SURFACE_CONTAINER_HIGHEST,
  },
  diffChipHighlight: {
    backgroundColor: "rgba(255, 87, 34, 0.22)",
    borderWidth: 1,
    borderColor: "rgba(255, 87, 34, 0.35)",
  },
  diffChipText: {
    fontSize: 10,
    fontWeight: "800",
    color: ON_SURFACE_VARIANT,
  },
  diffChipTextHighlight: {
    color: PRIMARY,
  },
  desktopMain: {
    flex: 1,
    minWidth: 0,
  },
  deskHubTabs: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
    backgroundColor: SURFACE_CONTAINER,
    padding: 4,
    alignSelf: "flex-start",
  },
  deskHubTab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "transparent",
  },
  deskHubTabOn: {
    backgroundColor: SURFACE_CONTAINER_LOW,
  },
  deskHubTabText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    color: ON_SURFACE_VARIANT,
  },
  deskHubTabTextOn: {
    color: PRIMARY,
  },
  deskHero: {
    fontSize: 48,
    fontWeight: "900",
    color: ON_SURFACE,
    letterSpacing: -2,
    lineHeight: 52,
    marginBottom: 8,
  },
  deskSub: {
    color: ON_SURFACE_VARIANT,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
    maxWidth: 520,
  },
  deskGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 22,
  },
  deskCard: {
    width: "100%",
    maxWidth: 360,
    minWidth: 260,
    flexGrow: 1,
    flexBasis: 280,
    backgroundColor: SURFACE_CONTAINER_LOW,
    overflow: "hidden",
    position: "relative",
  },
  deskAccentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: PRIMARY,
    zIndex: 2,
  },
  deskImgWrap: {
    height: 224,
    backgroundColor: SURFACE_DIM,
    overflow: "hidden",
  },
  deskImg: {
    width: "100%",
    height: "100%",
    opacity: 0.55,
  },
  deskImgScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(19, 19, 19, 0.35)",
  },
  levelBadgeFloat: {
    position: "absolute",
    top: 14,
    right: 14,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  levelBadgeDefault: {
    backgroundColor: SURFACE_CONTAINER_HIGHEST,
  },
  levelBadgeElite: {
    backgroundColor: ERROR_CONTAINER,
  },
  levelBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: ON_SURFACE,
  },
  levelBadgeTextElite: {
    color: ON_ERROR_CONTAINER,
  },
  deskCardBody: {
    padding: 22,
    paddingTop: 12,
  },
  deskMeta: {
    color: PRIMARY,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 6,
  },
  deskDistance: {
    color: ON_SURFACE,
    fontSize: 30,
    fontWeight: "900",
    fontStyle: "italic",
    letterSpacing: -1,
    marginBottom: 10,
  },
  deskMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deskSmallMeta: {
    color: ON_SURFACE_VARIANT,
    fontSize: 10,
    fontWeight: "700",
  },
  premiumWrap: {
    marginTop: 12,
    backgroundColor: SURFACE_CONTAINER_LOW,
    overflow: "hidden",
    minHeight: 320,
    position: "relative",
  },
  premiumBg: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.28,
  },
  premiumScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(14, 14, 14, 0.72)",
  },
  premiumInner: {
    padding: 36,
    zIndex: 1,
    gap: 14,
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: PRIMARY_FIXED_DIM,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  premiumBadgeText: {
    color: ON_PRIMARY_FIXED,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 2,
  },
  premiumTitle: {
    color: ON_SURFACE,
    fontSize: 40,
    fontWeight: "900",
    fontStyle: "italic",
    letterSpacing: -1,
  },
  premiumBody: {
    color: ON_SURFACE_VARIANT,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 560,
  },
  premiumCta: {
    backgroundColor: PRIMARY_FIXED_DIM,
    paddingVertical: 18,
    paddingHorizontal: 28,
    alignSelf: "flex-start",
  },
  premiumCtaText: {
    color: ON_PRIMARY_FIXED,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },
});
