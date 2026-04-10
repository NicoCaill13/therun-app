import type { ReactElement } from "react";

import { Pressable, StyleSheet, Text, View } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";

import { RoutePolylinePreview } from "@/components/ui/RoutePolylinePreview";
import type { RouteLibraryItem } from "@/lib/api/routesListTypes";
import { formatRouteDistanceLabel } from "@/lib/routes/formatRouteDistanceLabel";

const SURFACE_DIM = "#0e0e0e";
const SURFACE_CONTAINER_HIGH = "#201f1f";
const SURFACE_CONTAINER_HIGHEST = "#262626";
const ON_SURFACE = "#ffffff";
const ON_SURFACE_VARIANT = "#adaaaa";
const ON_PRIMARY_FIXED = "#000000";
const PRIMARY = "#ff5722";
const PRIMARY_FIXED_DIM = "#ff5d2b";
const ERROR_CONTAINER = "#9f0519";
const ON_ERROR_CONTAINER = "#ffa8a3";

function routeTypeKindLabel(type: RouteLibraryItem["type"]): string {
  if (type === "TRAIL") {
    return "TRAIL";
  }
  if (type === "MIXED") {
    return "MIXED";
  }
  return "ROAD";
}

function distanceParts(meters: number): { value: string; unit: string } {
  if (meters < 1000) {
    return { value: String(Math.round(meters)), unit: "M" };
  }
  return { value: (meters / 1000).toFixed(1), unit: "KM" };
}

interface LibraryRouteCardMobileProps {
  item: RouteLibraryItem;
  onPress: () => void;
  testID?: string;
}

export function LibraryRouteCardMobile({
  item,
  onPress,
  testID,
}: LibraryRouteCardMobileProps): ReactElement {
  const { value, unit } = distanceParts(item.distanceMeters);
  const slug = item.name.trim().toUpperCase().slice(0, 28);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Select route ${item.name}`}
      testID={testID}
      style={({ pressed }) => [styles.favCard, pressed && styles.cardPressed]}
    >
      <View style={styles.favCardMap}>
        <View style={styles.favPreviewFill}>
          <RoutePolylinePreview encodedPolyline={item.encodedPolyline} />
        </View>
        <View style={styles.favMapScrim} />
        <View style={styles.favBadgeRow}>
          <View style={styles.kindBadge}>
            <Text style={styles.kindBadgeText}>{routeTypeKindLabel(item.type)}</Text>
          </View>
        </View>
      </View>
      <View style={styles.favCardFooter}>
        <View>
          <Text style={styles.favSlug}>{slug || "ROUTE"}</Text>
          <Text style={styles.favTitle}>{item.name}</Text>
        </View>
        <View style={styles.favDistanceBlock}>
          <Text style={styles.favDistanceNum}>{value}</Text>
          <Text style={styles.favKm}>{unit}</Text>
        </View>
      </View>
    </Pressable>
  );
}

interface LibraryRouteCardDesktopProps {
  item: RouteLibraryItem;
  onPress: () => void;
}

export function LibraryRouteCardDesktop({
  item,
  onPress,
}: LibraryRouteCardDesktopProps): ReactElement {
  const kind = routeTypeKindLabel(item.type);
  const badgeIsElite = kind === "MIXED";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Select route ${item.name}`}
      style={({ pressed }) => [styles.deskCard, pressed && styles.cardPressed]}
    >
      <View style={styles.deskAccentBar} />
      <View style={styles.deskImgWrap}>
        <View style={styles.deskPreviewFill}>
          <RoutePolylinePreview encodedPolyline={item.encodedPolyline} />
        </View>
        <View style={styles.deskImgScrim} />
        <View
          style={[
            styles.levelBadgeFloat,
            badgeIsElite ? styles.levelBadgeElite : styles.levelBadgeDefault,
          ]}
        >
          <Text
            style={[styles.levelBadgeText, badgeIsElite && styles.levelBadgeTextElite]}
          >
            {kind}
          </Text>
        </View>
      </View>
      <View style={styles.deskCardBody}>
        <Text style={styles.deskMeta}>{kind}</Text>
        <Text style={styles.deskDistance}>{formatRouteDistanceLabel(item.distanceMeters)}</Text>
        <View style={styles.deskMetaRow}>
          <MaterialIcons name="route" size={16} color={ON_SURFACE_VARIANT} />
          <Text style={styles.deskSmallMeta} numberOfLines={1}>
            {item.name}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  favCard: {
    backgroundColor: "#131313",
    marginBottom: 20,
    overflow: "hidden",
  },
  favCardMap: {
    height: 160,
    backgroundColor: SURFACE_CONTAINER_HIGH,
    position: "relative",
  },
  favPreviewFill: {
    ...StyleSheet.absoluteFillObject,
  },
  favMapScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(19, 19, 19, 0.55)",
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
  deskCard: {
    width: "100%",
    maxWidth: 360,
    minWidth: 260,
    flexGrow: 1,
    flexBasis: 280,
    backgroundColor: "#131313",
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
    position: "relative",
  },
  deskPreviewFill: {
    ...StyleSheet.absoluteFillObject,
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
    flex: 1,
  },
});
