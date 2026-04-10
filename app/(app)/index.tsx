import type { ReactElement } from "react";
import { useCallback, useMemo } from "react";

import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { MaterialIcons } from "@expo/vector-icons";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { AppNavBar } from "@/components/layout/TheRunNavBar";
import {
  EventCard,
  type EventParticipationStatus,
} from "@/components/ui/EventCard";
import type { EventKind } from "@/lib/constants/eventKinds";
import { DESKTOP_BREAKPOINT } from "@/lib/constants/breakpoints";
import { shellHorizontalPadding } from "@/lib/constants/layout";

const SURFACE_DIM = "#0e0e0e";
const ON_SURFACE = "#ffffff";
const ON_SURFACE_VARIANT = "#adaaaa";
const ON_PRIMARY = "#000000";
const PRIMARY_FIXED_DIM = "#ff5d2b";

/** Matches `tpl/mobile/dashboard/code.html` hero ~3.5rem at default root font. */
const MOBILE_DASHBOARD_HERO_PX = 56;

const LIST_VERTICAL_GAP = 16;

const FAB_SIZE = 56;
const FAB_ICON_SIZE = 28;

const HERO_CTA_SPACING = 20;
const CTA_EVENTS_SPACING = 24;

interface MockEventRow {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  status: EventParticipationStatus;
  eventKind: EventKind;
}

const MOCK_UPCOMING_EVENTS: MockEventRow[] = [
  {
    id: "1",
    title: "City Limits Sprint",
    date: "Sat, Oct 26",
    time: "18:30",
    location: "Industrial District, Terminal 4",
    organizer: "Marcus Vane",
    status: "GOING",
    eventKind: "social_run",
  },
  {
    id: "2",
    title: "Neon Midnight 10K",
    date: "Tue, Oct 29",
    time: "23:00",
    location: "Riverfront Walkway, Sector B",
    organizer: "Luna Chen",
    status: "NOT GOING",
    eventKind: "technical_run",
  },
  {
    id: "3",
    title: "Ascent Ridge Run",
    date: "Sun, Nov 3",
    time: "06:15",
    location: "East Summit Trailhead",
    organizer: "Trail Masters",
    status: "PLANNED",
    eventKind: "technical_trail",
  },
];

export default function UpcomingRunsDashboard(): ReactElement {
  const router = useRouter();
  const { width: winWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  /** `useWindowDimensions` can report `0` on first paint (web); fall back to `Dimensions`. */
  const width = Math.max(winWidth, Dimensions.get("window").width);
  const isDesktop = width >= DESKTOP_BREAKPOINT;

  const horizontalPad = shellHorizontalPadding(width);
  const desktopHeroSize = Math.min(120, Math.round(width * 0.062));

  const handleCreateEventPress = useCallback((): void => {
    router.push("/(app)/create-event");
  }, [router]);

  const [featuredEvent, ...railEvents] = MOCK_UPCOMING_EVENTS;

  // ─── Desktop ──────────────────────────────────────────────────────────────

  const heroBlockDesktop = useMemo(
    () => (
      <View style={styles.headerWrap}>
        <View style={styles.headerTopDesktop}>
          <View style={styles.heroTextBlockDesktop}>
            <Text
              style={[
                styles.heroDesktopLine,
                {
                  fontSize: desktopHeroSize,
                  lineHeight: desktopHeroSize * 0.85,
                },
              ]}
            >
              UPCOMING{"\n"}RUNS
            </Text>
          </View>
          <View style={styles.desktopHeaderRailSlot}>
            <Pressable
              onPress={handleCreateEventPress}
              accessibilityRole="button"
              accessibilityLabel="Create Event"
              style={({ pressed }) => [
                styles.ctaDesktop,
                styles.ctaDesktopRailWidth,
                pressed && styles.ctaPressed,
              ]}
            >
              <MaterialIcons name="add" size={26} color={ON_PRIMARY} />
              <Text style={styles.ctaLabel}>Create Event</Text>
            </Pressable>
          </View>
        </View>
        <View style={{ height: 32 }} />
      </View>
    ),
    [desktopHeroSize, handleCreateEventPress],
  );

  const desktopEventsGrid = useMemo(
    () => (
      <View style={styles.desktopGrid}>
        <View style={styles.desktopFeaturedCol}>
          <EventCard
            variant="featured"
            fillAvailableHeight
            title={featuredEvent.title}
            date={featuredEvent.date}
            time={featuredEvent.time}
            location={featuredEvent.location}
            organizer={featuredEvent.organizer}
            status={featuredEvent.status}
            eventKind={featuredEvent.eventKind}
          />
        </View>
        <View style={styles.desktopRailCol}>
          {railEvents.map((item) => (
            <EventCard
              key={item.id}
              variant="rail"
              title={item.title}
              date={item.date}
              time={item.time}
              location={item.location}
              organizer={item.organizer}
              status={item.status}
              eventKind={item.eventKind}
            />
          ))}
        </View>
      </View>
    ),
    [featuredEvent, railEvents],
  );

  if (isDesktop) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <AppNavBar />
        <ScrollView
          style={styles.desktopScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: horizontalPad,
            paddingBottom: 48,
            paddingTop: 8,
          }}
        >
          {heroBlockDesktop}
          {desktopEventsGrid}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── Mobile ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <AppNavBar />
      <ScrollView
        style={styles.mobileScroll}
        contentContainerStyle={[
          styles.mobileContent,
          styles.mobileScrollContent,
          {
            paddingHorizontal: horizontalPad,
            paddingBottom: 32 + FAB_SIZE + insets.bottom,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero */}
        <Text
          style={[
            styles.heroMobileLine1,
            {
              fontSize: MOBILE_DASHBOARD_HERO_PX,
              lineHeight: MOBILE_DASHBOARD_HERO_PX * 0.9,
            },
          ]}
        >
          UPCOMING
        </Text>
        <Text
          style={[
            styles.heroMobileLine2,
            {
              fontSize: MOBILE_DASHBOARD_HERO_PX,
              lineHeight: MOBILE_DASHBOARD_HERO_PX * 0.9,
            },
          ]}
        >
          RUNS
        </Text>

        <View style={{ height: HERO_CTA_SPACING }} />

        {/*
          Visual chrome lives on an inner `View`. RN Web often mishandles
          background + row layout when applied directly on `Pressable`.
        */}
        <Pressable
          onPress={handleCreateEventPress}
          accessibilityRole="button"
          accessibilityLabel="Create Event"
          testID="dashboard-create-event-cta"
        >
          {({ pressed }) => (
            <View
              style={[
                styles.ctaMobileFace,
                pressed ? styles.ctaPressedFace : null,
              ]}
            >
              <MaterialIcons name="add" size={26} color={ON_PRIMARY} />
              <Text style={[styles.ctaLabel, styles.ctaLabelTrailingSpace]}>
                Create Event
              </Text>
            </View>
          )}
        </Pressable>

        <View style={{ height: CTA_EVENTS_SPACING }} />

        {/* Event list */}
        {MOCK_UPCOMING_EVENTS.map((item, index) => (
          <View key={item.id}>
            {index > 0 && <View style={{ height: LIST_VERTICAL_GAP }} />}
            <EventCard
              title={item.title}
              date={item.date}
              time={item.time}
              location={item.location}
              organizer={item.organizer}
              status={item.status}
              eventKind={item.eventKind}
              variant="feed"
              narrowLayout
            />
          </View>
        ))}
      </ScrollView>

      {/* FAB — second access point after scrolling */}
      <Pressable
        onPress={handleCreateEventPress}
        accessibilityRole="button"
        accessibilityLabel="Create Event"
        style={({ pressed }) => [
          styles.fabMobile,
          { right: horizontalPad, bottom: insets.bottom + 24 },
          pressed && styles.ctaPressed,
        ]}
      >
        <MaterialIcons name="add" size={FAB_ICON_SIZE} color={ON_PRIMARY} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: SURFACE_DIM,
  },

  // ─── Desktop ──────────────────────────────────────────────────────────────
  desktopScroll: {
    flex: 1,
  },
  headerWrap: {
    width: "100%",
  },
  headerTopDesktop: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 24,
    width: "100%",
  },
  /** Same flex basis as `desktopFeaturedCol` so the CTA column matches `desktopRailCol` width. */
  heroTextBlockDesktop: {
    flex: 8,
    minWidth: 0,
  },
  desktopHeaderRailSlot: {
    flex: 4,
    minWidth: 260,
  },
  heroDesktopLine: {
    color: ON_SURFACE,
    fontWeight: "900",
    fontStyle: "italic",
    letterSpacing: -4,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  heroBlurbDesktop: {
    color: ON_SURFACE_VARIANT,
    fontSize: 18,
    lineHeight: 28,
    marginTop: 20,
    maxWidth: 560,
  },
  ctaDesktop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: PRIMARY_FIXED_DIM,
    paddingVertical: 18,
    paddingHorizontal: 28,
    marginBottom: 4,
  },
  ctaDesktopRailWidth: {
    width: "100%",
    alignSelf: "stretch",
  },
  desktopGrid: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 24,
    width: "100%",
  },
  desktopFeaturedCol: {
    flex: 8,
    minWidth: 0,
    minHeight: 0,
  },
  desktopRailCol: {
    flex: 4,
    minWidth: 260,
    gap: LIST_VERTICAL_GAP,
  },

  // ─── Mobile ───────────────────────────────────────────────────────────────
  mobileScroll: {
    flex: 1,
  },
  mobileContent: {
    paddingTop: 8,
  },
  /** Lets `width: '100%'` children match the ScrollView inner width on web + native. */
  mobileScrollContent: {
    alignItems: "stretch",
    width: "100%",
  },
  heroMobileLine1: {
    color: ON_SURFACE,
    fontWeight: "900",
    letterSpacing: -2,
    textTransform: "uppercase",
  },
  heroMobileLine2: {
    color: PRIMARY_FIXED_DIM,
    fontWeight: "900",
    letterSpacing: -2,
    textTransform: "uppercase",
  },
  ctaMobileFace: {
    width: "100%",
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PRIMARY_FIXED_DIM,
    paddingVertical: 18,
    paddingHorizontal: 28,
    minHeight: 56,
  },
  ctaPressedFace: {
    opacity: 0.92,
  },
  fabMobile: {
    position: "absolute",
    width: FAB_SIZE,
    height: FAB_SIZE,
    backgroundColor: PRIMARY_FIXED_DIM,
    justifyContent: "center",
    alignItems: "center",
  },
  ctaPressed: {
    opacity: 0.92,
  },
  ctaLabel: {
    color: ON_PRIMARY,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  /** Replaces deprecated `gap` between icon and label for older RN Web flex rows. */
  ctaLabelTrailingSpace: {
    marginLeft: 10,
  },
});
