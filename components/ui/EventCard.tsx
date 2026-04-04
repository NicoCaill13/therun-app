import type { ReactElement, ReactNode } from 'react';

import {
  Platform,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';

import {
  EVENT_KIND_LABEL,
  type EventKind,
  getEventKindIllustrationSource,
} from '@/lib/constants/eventKinds';

const SURFACE_CONTAINER_LOW = '#131313';
const SURFACE_CONTAINER_HIGHEST = '#262626';
const ON_SURFACE = '#ffffff';
const ON_SURFACE_VARIANT = '#adaaaa';
const PRIMARY = '#ff5722';
const ON_PRIMARY = '#000000';
const PRIMARY_FIXED_DIM = '#ff5d2b';

const ACCENT_WIDTH = 4;
const ICON_SM = 16;
const ICON_MD = 18;

/** Background image fades like desktop template (shared featured + rail). */
const PHOTO_BACKDROP_OPACITY = 0.5;

/** Tonal scrim over illustration — same for primary and secondary photo cards. */
const PHOTO_SCRIM = 'rgba(14, 14, 14, 0.72)';

const RAIL_CARD_MIN_HEIGHT = 240;

/** Full-perimeter primary border when `showPerimeterFrame` is true (non-desktop dashboard). */
const CARD_FRAME_BORDER_WIDTH = 1;

/** Drop web focus outline on the card shell; does not strip intentional borders. */
const WEB_OUTLINE_RESET: ViewStyle =
  Platform.OS === 'web' ? { outlineStyle: 'none', outlineWidth: 0 } : {};

const CARD_SHADOW_RESET: ViewStyle = {
  elevation: 0,
  shadowOpacity: 0,
  shadowRadius: 0,
  shadowOffset: { width: 0, height: 0 },
};

/** Depth lift when `showPerimeterFrame` (non-desktop); host has no overflow so shadow is not clipped. */
const CARD_NARROW_SHADOW_OFFSET_Y = 8;
const CARD_NARROW_SHADOW_BLUR = 22;
const CARD_NARROW_SHADOW_OPACITY_WEB = 0.42;
const CARD_NARROW_SHADOW_OPACITY_IOS = 0.38;
const CARD_NARROW_SHADOW_COLOR = '#000000';
const CARD_NARROW_ELEVATION_ANDROID = 12;

const CARD_NARROW_DROP_SHADOW: ViewStyle =
  Platform.select<ViewStyle>({
    ios: {
      shadowColor: CARD_NARROW_SHADOW_COLOR,
      shadowOffset: { width: 0, height: CARD_NARROW_SHADOW_OFFSET_Y },
      shadowOpacity: CARD_NARROW_SHADOW_OPACITY_IOS,
      shadowRadius: CARD_NARROW_SHADOW_BLUR,
    },
    android: {
      elevation: CARD_NARROW_ELEVATION_ANDROID,
      shadowColor: CARD_NARROW_SHADOW_COLOR,
    },
    web: {
      boxShadow: `0px ${CARD_NARROW_SHADOW_OFFSET_Y}px ${CARD_NARROW_SHADOW_BLUR}px rgba(0, 0, 0, ${CARD_NARROW_SHADOW_OPACITY_WEB})`,
    },
    default: {
      elevation: CARD_NARROW_ELEVATION_ANDROID,
    },
  }) ?? { elevation: CARD_NARROW_ELEVATION_ANDROID };

function NarrowShadowHost({ children }: { children: ReactNode }): ReactElement {
  return (
    <View style={[styles.cardShadowHost, CARD_NARROW_DROP_SHADOW]} testID="event-card-shadow-host">
      {children}
    </View>
  );
}

export type EventParticipationStatus = 'PLANNED' | 'GOING' | 'NOT GOING';

export type EventCardVariant = 'feed' | 'featured' | 'rail';

export interface EventCardProps {
  title: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  status: EventParticipationStatus;
  eventKind: EventKind;
  /** `feed`: text-only list (no images); `featured` / `rail`: desktop photo cards with illustrations. */
  variant?: EventCardVariant;
  /** Featured only: grow with parent so height matches stacked rail column (desktop grid). */
  fillAvailableHeight?: boolean;
  /** Merged onto the root `View` of the card (after base styles). */
  containerStyle?: StyleProp<ViewStyle>;
  /**
   * Orange perimeter border and drop shadow on the card shell. Narrow (non-desktop) layouts
   * use `true`; wide grid typically passes `false`.
   * @default true
   */
  showPerimeterFrame?: boolean;
}

interface PillStyle {
  backgroundColor: string;
  color: string;
}

function getStatusPillStyle(status: EventParticipationStatus): PillStyle {
  if (status === 'GOING') {
    return { backgroundColor: 'rgba(255, 87, 34, 0.16)', color: PRIMARY };
  }
  if (status === 'PLANNED') {
    return { backgroundColor: PRIMARY, color: ON_PRIMARY };
  }
  return { backgroundColor: SURFACE_CONTAINER_HIGHEST, color: ON_SURFACE_VARIANT };
}

function FeedEventCard(props: Omit<EventCardProps, 'variant'>): ReactElement {
  const {
    title,
    date,
    time,
    location,
    organizer,
    status,
    eventKind,
    containerStyle,
    showPerimeterFrame = true,
  } = props;
  const pill = getStatusPillStyle(status);
  const dateTimeLine = `${date.toUpperCase()} • ${time}`;

  const inner = (
    <View
      style={[
        styles.cardRow,
        showPerimeterFrame && styles.cardFrame,
        showPerimeterFrame && WEB_OUTLINE_RESET,
        !showPerimeterFrame && CARD_SHADOW_RESET,
        containerStyle,
      ]}
      testID="event-card"
    >
      <View style={styles.bodyFeed}>
        <View style={styles.topRowFeed}>
          <Text style={[styles.statusPill, pill]}>{status}</Text>
        </View>

        <Text style={styles.kindLabel}>{EVENT_KIND_LABEL[eventKind]}</Text>
        <Text style={styles.titleFeed}>{title}</Text>
        <Text style={styles.dateTimeFeed}>{dateTimeLine}</Text>

        <View style={styles.locationRow}>
          <MaterialIcons name="place" size={ICON_SM} color={PRIMARY_FIXED_DIM} />
          <Text style={styles.locationText}>{location}</Text>
        </View>

        <View style={styles.organizerBlock}>
          <Text style={styles.organizerLabel}>ORGANIZER</Text>
          <Text style={styles.organizerName}>{organizer}</Text>
        </View>
      </View>
    </View>
  );

  if (showPerimeterFrame) {
    return <NarrowShadowHost>{inner}</NarrowShadowHost>;
  }
  return inner;
}

function FeaturedEventCard(props: Omit<EventCardProps, 'variant'>): ReactElement {
  const {
    title,
    date,
    time,
    location,
    organizer,
    status,
    eventKind,
    fillAvailableHeight,
    containerStyle,
    showPerimeterFrame = true,
  } = props;
  const pill = getStatusPillStyle(status);
  const dateLabel = `${date} · ${time}`;
  const illustration = getEventKindIllustrationSource(eventKind);

  const rootStyle: StyleProp<ViewStyle> = [
    styles.cardPhoto,
    fillAvailableHeight ? styles.cardPhotoFill : styles.cardFeaturedMinHeight,
    showPerimeterFrame && styles.cardFrame,
    showPerimeterFrame && WEB_OUTLINE_RESET,
    !showPerimeterFrame && CARD_SHADOW_RESET,
    containerStyle,
  ];

  const foregroundStyle: StyleProp<ViewStyle> = [
    styles.photoForeground,
    fillAvailableHeight ? styles.photoForegroundFill : styles.photoForegroundFeatured,
  ];

  const inner = (
    <View style={rootStyle} testID="event-card">
      <Image
        source={illustration}
        style={[styles.photoBackdrop, styles.photoBackdropChrome]}
        contentFit="cover"
      />
      <View style={styles.photoScrim} />

      <View style={foregroundStyle}>
        <View style={styles.accentBar} testID="event-card-accent" />
        <View style={styles.bodyFeatured}>
          <Text style={styles.kindLabelPhotoCard}>{EVENT_KIND_LABEL[eventKind]}</Text>

          <View style={styles.topRowFeatured}>
            <Text style={[styles.statusPillFeatured, pill]}>{status}</Text>
            <View style={styles.calendarRow}>
              <MaterialIcons name="event" size={14} color={ON_SURFACE_VARIANT} />
              <Text style={styles.featuredDateMuted}>{dateLabel.toUpperCase()}</Text>
            </View>
          </View>

          <Text style={styles.titleFeatured}>{title}</Text>

          <View style={styles.metaRowFeatured}>
            <View style={styles.metaItem}>
              <MaterialIcons name="place" size={ICON_MD} color={PRIMARY} />
              <Text style={styles.metaTextFeatured}>{location}</Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialIcons name="person" size={ICON_MD} color={PRIMARY} />
              <Text style={styles.metaTextFeatured}>{organizer}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  if (showPerimeterFrame) {
    return <NarrowShadowHost>{inner}</NarrowShadowHost>;
  }
  return inner;
}

function RailEventCard(props: Omit<EventCardProps, 'variant'>): ReactElement {
  const {
    title,
    time,
    location,
    organizer,
    status,
    eventKind,
    containerStyle,
    showPerimeterFrame = true,
  } = props;
  const pill = getStatusPillStyle(status);
  const illustration = getEventKindIllustrationSource(eventKind);

  const inner = (
    <View
      style={[
        styles.cardPhoto,
        styles.cardRailMinHeight,
        showPerimeterFrame && styles.cardFrame,
        showPerimeterFrame && WEB_OUTLINE_RESET,
        !showPerimeterFrame && CARD_SHADOW_RESET,
        containerStyle,
      ]}
      testID="event-card"
    >
      <Image
        source={illustration}
        style={[styles.photoBackdrop, styles.photoBackdropChrome]}
        contentFit="cover"
      />
      <View style={styles.photoScrim} />

      <View style={[styles.photoForeground, styles.photoForegroundRail]}>
        <View style={styles.accentBar} testID="event-card-accent" />
        <View style={styles.bodyRail}>
          <Text style={styles.kindLabelPhotoCard}>{EVENT_KIND_LABEL[eventKind]}</Text>

          <View style={styles.topRowRail}>
            <Text style={[styles.statusPillRail, pill]}>{status}</Text>
            <Text style={styles.railTime}>{time}</Text>
          </View>

          <Text style={styles.titleRail}>{title}</Text>

          <Text style={styles.locationRail}>{location}</Text>

          <View style={styles.hostRow}>
            <Text style={styles.hostLabel}>HOST: </Text>
            <Text style={styles.hostNameOnPhoto}>{organizer.toUpperCase()}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  if (showPerimeterFrame) {
    return <NarrowShadowHost>{inner}</NarrowShadowHost>;
  }
  return inner;
}

export function EventCard({
  variant = 'feed',
  fillAvailableHeight,
  containerStyle,
  showPerimeterFrame = true,
  ...rest
}: EventCardProps): ReactElement {
  const shared = { ...rest, containerStyle, showPerimeterFrame };
  if (variant === 'featured') {
    return <FeaturedEventCard {...shared} fillAvailableHeight={fillAvailableHeight} />;
  }
  if (variant === 'rail') {
    return <RailEventCard {...shared} />;
  }
  return <FeedEventCard {...shared} />;
}

const styles = StyleSheet.create({
  cardShadowHost: {
    alignSelf: 'stretch',
  },
  cardRow: {
    flexDirection: 'row',
    backgroundColor: SURFACE_CONTAINER_LOW,
    overflow: 'hidden',
  },
  cardPhoto: {
    position: 'relative',
    backgroundColor: SURFACE_CONTAINER_LOW,
    overflow: 'hidden',
  },
  cardFrame: {
    borderWidth: CARD_FRAME_BORDER_WIDTH,
    borderColor: PRIMARY,
  },
  cardFeaturedMinHeight: {
    minHeight: 360,
  },
  /** Featured in desktop grid: same stretched height as stacked rail cards. */
  cardPhotoFill: {
    flex: 1,
    minHeight: 0,
  },
  cardRailMinHeight: {
    minHeight: RAIL_CARD_MIN_HEIGHT,
  },
  photoBackdrop: {
    ...StyleSheet.absoluteFillObject,
    opacity: PHOTO_BACKDROP_OPACITY,
  },
  photoBackdropChrome: {
    borderWidth: 0,
    borderColor: 'transparent',
    ...(Platform.OS === 'web' ? { outlineStyle: 'none', outlineWidth: 0 } : {}),
  },
  photoScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: PHOTO_SCRIM,
  },
  photoForeground: {
    flexDirection: 'row',
    flex: 1,
    zIndex: 1,
  },
  photoForegroundFeatured: {
    minHeight: 360,
  },
  photoForegroundFill: {
    flex: 1,
    minHeight: 0,
  },
  photoForegroundRail: {
    minHeight: RAIL_CARD_MIN_HEIGHT,
  },
  accentBar: {
    width: ACCENT_WIDTH,
    backgroundColor: PRIMARY,
    alignSelf: 'stretch',
  },
  bodyFeed: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  bodyFeatured: {
    flex: 1,
    paddingHorizontal: 28,
    paddingVertical: 28,
    justifyContent: 'flex-end',
  },
  bodyRail: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 24,
    paddingVertical: 24,
    justifyContent: 'flex-end',
  },
  topRowFeed: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  topRowFeatured: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  topRowRail: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  kindLabel: {
    color: PRIMARY,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  /** Kind line on full-bleed photo cards (featured + rail). */
  kindLabelPhotoCard: {
    color: PRIMARY_FIXED_DIM,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  statusPill: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    paddingVertical: 6,
    paddingHorizontal: 12,
    overflow: 'hidden',
  },
  statusPillFeatured: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    paddingVertical: 8,
    paddingHorizontal: 14,
    overflow: 'hidden',
  },
  statusPillRail: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingVertical: 6,
    paddingHorizontal: 10,
    overflow: 'hidden',
  },
  calendarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featuredDateMuted: {
    color: ON_SURFACE_VARIANT,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.6,
  },
  titleFeed: {
    color: ON_SURFACE,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  titleFeatured: {
    color: ON_SURFACE,
    fontSize: 44,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: -2,
    textTransform: 'uppercase',
    lineHeight: 42,
    marginBottom: 20,
  },
  titleRail: {
    color: ON_SURFACE,
    fontSize: 24,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: -1,
    textTransform: 'uppercase',
    marginBottom: 10,
    lineHeight: 26,
  },
  dateTimeFeed: {
    color: PRIMARY_FIXED_DIM,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  locationText: {
    flex: 1,
    color: ON_SURFACE_VARIANT,
    fontSize: 14,
    lineHeight: 20,
  },
  locationRail: {
    color: ON_SURFACE_VARIANT,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  metaRowFeatured: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaTextFeatured: {
    color: ON_SURFACE_VARIANT,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  railTime: {
    color: PRIMARY,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  hostLabel: {
    color: ON_SURFACE_VARIANT,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  hostNameOnPhoto: {
    color: ON_SURFACE,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  organizerBlock: {
    marginTop: 16,
    paddingTop: 16,
  },
  organizerLabel: {
    color: ON_SURFACE_VARIANT,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  organizerName: {
    color: ON_SURFACE,
    fontSize: 14,
    fontWeight: '800',
  },
});
