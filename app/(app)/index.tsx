import type { ReactElement } from 'react';
import { useCallback, useMemo } from 'react';

import {
  FlatList,
  ListRenderItem,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppNavBar } from '@/components/layout/TheRunNavBar';
import { EventCard, type EventParticipationStatus } from '@/components/ui/EventCard';
import type { EventKind } from '@/lib/constants/eventKinds';
import { DESKTOP_BREAKPOINT } from '@/lib/constants/breakpoints';
import { shellHorizontalPadding } from '@/lib/constants/layout';

const SURFACE_DIM = '#0e0e0e';
const ON_SURFACE = '#ffffff';
const ON_SURFACE_VARIANT = '#adaaaa';
const ON_PRIMARY = '#000000';
const PRIMARY_FIXED_DIM = '#ff5d2b';

/** Matches `tpl/mobile/dashboard/code.html` hero ~3.5rem at default root font. */
const MOBILE_DASHBOARD_HERO_PX = 56;

const LIST_VERTICAL_GAP = 16;

const FAB_SIZE = 56;
const FAB_ICON_SIZE = 28;

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
    id: '1',
    title: 'City Limits Sprint',
    date: 'Sat, Oct 26',
    time: '18:30',
    location: 'Industrial District, Terminal 4',
    organizer: 'Marcus Vane',
    status: 'GOING',
    eventKind: 'social_run',
  },
  {
    id: '2',
    title: 'Neon Midnight 10K',
    date: 'Tue, Oct 29',
    time: '23:00',
    location: 'Riverfront Walkway, Sector B',
    organizer: 'Luna Chen',
    status: 'NOT GOING',
    eventKind: 'technical_run',
  },
  {
    id: '3',
    title: 'Ascent Ridge Run',
    date: 'Sun, Nov 3',
    time: '06:15',
    location: 'East Summit Trailhead',
    organizer: 'Trail Masters',
    status: 'PLANNED',
    eventKind: 'technical_trail',
  },
];

export default function UpcomingRunsDashboard(): ReactElement {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isDesktop = width >= DESKTOP_BREAKPOINT;

  const horizontalPad = shellHorizontalPadding(width);

  const desktopHeroSize = Math.min(120, Math.round(width * 0.062));

  const listPad = useMemo(
    () => ({
      paddingHorizontal: horizontalPad,
      paddingBottom: isDesktop ? 48 : 32 + FAB_SIZE + insets.bottom,
      paddingTop: 8,
    }),
    [horizontalPad, insets.bottom, isDesktop],
  );

  const scrollPadDesktop = useMemo(
    () => ({
      paddingHorizontal: horizontalPad,
      paddingBottom: 48,
      paddingTop: 8,
    }),
    [horizontalPad],
  );

  const handleCreateEventPress = useCallback((): void => {
    // Mocked flow: real navigation/API wiring comes later.
  }, []);

  const renderFeedItem: ListRenderItem<MockEventRow> = useCallback(({ item }) => {
    return (
      <EventCard
        title={item.title}
        date={item.date}
        time={item.time}
        location={item.location}
        organizer={item.organizer}
        status={item.status}
        eventKind={item.eventKind}
        variant="feed"
        showPerimeterFrame={!isDesktop}
      />
    );
  }, [isDesktop]);

  const separator = useCallback(
    (): ReactElement => <View style={{ height: LIST_VERTICAL_GAP }} />,
    [],
  );

  const [featuredEvent, ...railEvents] = MOCK_UPCOMING_EVENTS;

  const heroBlock = useMemo(() => {
    if (isDesktop) {
      return (
        <View style={styles.headerWrap}>
          <View style={styles.headerTopDesktop}>
            <View style={styles.heroTextBlockDesktop}>
              <Text
                style={[
                  styles.heroDesktopLine,
                  { fontSize: desktopHeroSize, lineHeight: desktopHeroSize * 0.85 },
                ]}
              >
                UPCOMING{'\n'}RUNS
              </Text>
              <Text style={styles.heroBlurbDesktop}>
                Join the collective. From midnight urban sprints to sunrise industrial trails, find
                your next pace-maker in the concrete jungle.
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
      );
    }

    return (
      <View style={styles.headerWrap}>
        <View style={styles.heroMobileStack}>
          <Text
            style={[
              styles.heroMobileLine1,
              { fontSize: MOBILE_DASHBOARD_HERO_PX, lineHeight: MOBILE_DASHBOARD_HERO_PX * 0.9 },
            ]}
          >
            UPCOMING
          </Text>
          <Text
            style={[
              styles.heroMobileLine2,
              { fontSize: MOBILE_DASHBOARD_HERO_PX, lineHeight: MOBILE_DASHBOARD_HERO_PX * 0.9 },
            ]}
          >
            RUNS
          </Text>
          <Text style={styles.kicker}>Urban Kineticism / Explore Phase</Text>
        </View>
        <View style={{ height: 24 }} />
      </View>
    );
  }, [desktopHeroSize, handleCreateEventPress, isDesktop]);

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
            showPerimeterFrame={!isDesktop}
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
              showPerimeterFrame={!isDesktop}
            />
          ))}
        </View>
      </View>
    ),
    [featuredEvent, isDesktop, railEvents],
  );

  if (isDesktop) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <AppNavBar />
        <ScrollView
          style={styles.desktopScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={scrollPadDesktop}
        >
          {heroBlock}
          {desktopEventsGrid}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.mobileRoot}>
        <AppNavBar />
        <FlatList
          style={styles.mobileList}
          data={MOCK_UPCOMING_EVENTS}
          keyExtractor={(item) => item.id}
          renderItem={renderFeedItem}
          ListHeaderComponent={heroBlock}
          ItemSeparatorComponent={separator}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={listPad}
        />
        <Pressable
          onPress={handleCreateEventPress}
          accessibilityRole="button"
          accessibilityLabel="Create Event"
          style={({ pressed }) => [
            styles.fabMobile,
            {
              right: horizontalPad,
              bottom: insets.bottom + 24,
            },
            pressed && styles.ctaPressed,
          ]}
        >
          <MaterialIcons name="add" size={FAB_ICON_SIZE} color={ON_PRIMARY} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: SURFACE_DIM,
  },
  desktopScroll: {
    flex: 1,
  },
  mobileRoot: {
    flex: 1,
  },
  mobileList: {
    flex: 1,
  },
  headerWrap: {
    width: '100%',
  },
  headerTopDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 24,
    width: '100%',
  },
  /** Same flex basis as `desktopFeaturedCol` (hero / main column). */
  heroTextBlockDesktop: {
    flex: 8,
    minWidth: 0,
    maxWidth: 960,
  },
  /** Same flex basis as `desktopRailCol` so Create Event matches secondary card width. */
  desktopHeaderRailSlot: {
    flex: 4,
    minWidth: 260,
  },
  heroDesktopLine: {
    color: ON_SURFACE,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: -4,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  heroMobileStack: {
    alignItems: 'flex-start',
    width: '100%',
  },
  heroMobileLine1: {
    color: ON_SURFACE,
    fontWeight: '900',
    letterSpacing: -2,
    textTransform: 'uppercase',
  },
  heroMobileLine2: {
    color: PRIMARY_FIXED_DIM,
    fontWeight: '900',
    letterSpacing: -2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  kicker: {
    color: ON_SURFACE_VARIANT,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  heroBlurbDesktop: {
    color: ON_SURFACE_VARIANT,
    fontSize: 18,
    lineHeight: 28,
    marginTop: 20,
    maxWidth: 560,
  },
  ctaDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: PRIMARY_FIXED_DIM,
    paddingVertical: 18,
    paddingHorizontal: 28,
    marginBottom: 4,
  },
  ctaDesktopRailWidth: {
    width: '100%',
    alignSelf: 'stretch',
  },
  fabMobile: {
    position: 'absolute',
    width: FAB_SIZE,
    height: FAB_SIZE,
    backgroundColor: PRIMARY_FIXED_DIM,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaPressed: {
    opacity: 0.92,
  },
  ctaLabel: {
    color: ON_PRIMARY,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  desktopGrid: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 24,
    width: '100%',
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
});
