import type { ReactElement } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { useQuery } from "@tanstack/react-query";

import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { AppNavBar } from "@/components/layout/TheRunNavBar";
import { EventDateCalendarModal } from "@/components/ui/EventDateCalendarModal";
import { EventTimeClockModal } from "@/components/ui/EventTimeClockModal";
import { RoutePolylinePreview } from "@/components/ui/RoutePolylinePreview";
import { postAddEventRoute } from "@/lib/api/eventRoutesEndpoints";
import { postCreateEvent } from "@/lib/api/eventsEndpoints";
import { listRoutes } from "@/lib/api/routesEndpoints";
import { getAccessToken } from "@/lib/auth/tokenStorage";
import { DESKTOP_BREAKPOINT } from "@/lib/constants/breakpoints";
import { shellHorizontalPadding } from "@/lib/constants/layout";
import { buildCreateEventRequestBody } from "@/lib/events/buildCreateEventPayload";
import {
  DEFAULT_EVENT_TYPE,
  EVENT_TYPE_OPTIONS,
  type EventType,
} from "@/lib/events/eventType";
import { GpxParseError } from "@/lib/gpx/buildGpxRouteFromXml";
import { GpxImportCancelledError } from "@/lib/gpx/gpxImportErrors";
import type { GpxRouteDraft } from "@/lib/gpx/gpxRouteDraft";
import { pickAndBuildGpxRoute } from "@/lib/gpx/pickAndBuildGpxRoute";
import { showAppAlert } from "@/lib/showAppAlert";
import { createDefaultStartTime, formatTimeOfDay } from "@/lib/time/timeOfDay";
import { createEventTitleSchema } from "@/lib/validation/createEventSchema";

const SURFACE_DIM = "#0e0e0e";
const SURFACE_CONTAINER = "#1a1919";
const SURFACE_CONTAINER_LOW = "#131313";
const SURFACE_CONTAINER_HIGH = "#201f1f";
const SURFACE_CONTAINER_HIGHEST = "#262626";
const ON_SURFACE = "#ffffff";
const ON_SURFACE_VARIANT = "#adaaaa";
const ON_PRIMARY_FIXED = "#000000";
const PRIMARY = "#ff5722";
const PRIMARY_FIXED_DIM = "#ff5d2b";
const PLACEHOLDER_MUTED = "#3f3f46";
const ZINC_MUTED = "#71717a";
const PREMIUM_GOLD = "#eab308";
const GHOST_OUTLINE = "rgba(73, 72, 71, 0.2)";

const MOBILE_HERO_TITLE_PX = 56;

const FORM_MAX_WIDTH_DESKTOP = 896;
const ROUTE_CARD_MIN_HEIGHT_DESKTOP = 220;
const ROUTE_CARD_MIN_HEIGHT_MOBILE = 140;

const MAP_PREVIEW_URI =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCw_vT9qESpz8h_Yar9h_P0eWGQ15Bpkgx1rxZ3q_FVF75G7Nd8Ozc-6mkuY5QaHcgZZNzANQJOwlDBOJjwG6G_dkMDgyAEgktG0_jwEA-Qd2AlowtMmUsP9ipaogrPnFCTDur9eC9IM3KdqT08p2WFHDE_MZZv908UtNRiRZ8l3UR6w2yxOQA6k9t5UYhOW_5jCKJKSj6YgrZYZ157SgZq_DPH20SGZwP3-wc-H-M1KpVkgfEFhAanIs2aDfhGAtxPqc4d_Cc9fSQ";

const LIBRARY_PHOTO_URI =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCxGT5pb_No9RuD7ShyZoA0AFyV1N-GQg7Ex3-Mm-mAkwK3REnWGPLes1_9YnkRXLjgrXJT2aSwv8barH1vG6uI5l5a_0j7QPBLBAEPn76avlhWU06fquI71EM8LbUqo2E00NmMrFTrVWH3-sn27Qo4TDpSV4NoOxDycsZVo1dnnNkDhlY3v7ZnZ4cBVPZGqGZsJuTD12i9_rkWD5EQOk_rUmvE33AuMNBE69HwxogTGjJzHFH6O2RwFrIR_4yE3JLtyr4POFrPLq4";

const GLOBAL_PHOTO_URI =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDQgEqdpncydJFEXzQfssWWGdqzL-hakhDuNo6f4V9VmkzAFun9a_UKEmowFD56z0onSnMAc1dSkeFCK5ygGvLFzVmMMLFUXCjJ3sgJh64AoJ80gLCgqzyGFx-6ape13cvB7Ml0YIcNqUZTnBCRGF2DBoFsL1F1KKFZuk3CxVJ1CYXnYZtK3NEzhhgSeAPtV_TFDvAaooM-Vm_Nph1-4A7y0sZYRmvNMp0pU7JFAhJzUejqaJLs7W_lf75VEjuhiXd7G8lCc6ZdG_g";

const ICON_LG = 28;
const ICON_MD = 22;
const ICON_SM = 18;

function formatEventDateLabel(d: Date): string {
  const month = d.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  return `${month} ${d.getDate()}`;
}

function formatDistanceLabel(meters: number): string {
  if (meters < 1000) {
    return `${meters} M`;
  }
  return `${(meters / 1000).toFixed(2)} KM`;
}

function createDefaultEventDate(): Date {
  const y = new Date().getFullYear();
  return new Date(y, 9, 24, 12, 0, 0, 0);
}

type RouteHubId = "library" | "global";

interface FieldLabelProps {
  children: string;
  accent?: boolean;
}

function FieldLabel({ children, accent }: FieldLabelProps): ReactElement {
  return (
    <Text style={[styles.fieldLabel, accent && styles.fieldLabelAccent]}>
      {children}
    </Text>
  );
}

export default function CreateEventScreen(): ReactElement {
  const router = useRouter();
  const { width: winWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const width = Math.max(winWidth, Dimensions.get("window").width);
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const horizontalPad = shellHorizontalPadding(width);

  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState<EventType>(DEFAULT_EVENT_TYPE);
  const [eventDate, setEventDate] = useState<Date>(createDefaultEventDate);
  const [isDateCalendarVisible, setIsDateCalendarVisible] = useState(false);
  const [startTime, setStartTime] = useState(createDefaultStartTime);
  const [isTimeClockVisible, setIsTimeClockVisible] = useState(false);
  const [meetingPoint, setMeetingPoint] = useState("");
  const [description, setDescription] = useState("");
  const [routeHub, setRouteHub] = useState<RouteHubId | null>(null);
  const [gpxDraft, setGpxDraft] = useState<GpxRouteDraft | null>(null);
  const saveInFlightRef = useRef(false);
  const gpxPickInFlightRef = useRef(false);

  const desktopHeroSize = useMemo(
    () => Math.min(112, Math.round(width * 0.065)),
    [width],
  );

  const { data: mineRoutesData } = useQuery({
    queryKey: ["routes", "mine"],
    queryFn: async () => {
      const token = await getAccessToken();
      if (!token) {
        throw new Error("Unauthorized");
      }
      return listRoutes({ createdByMe: true, page: 1, pageSize: 50 }, token);
    },
  });

  const userLibraryRouteCount = mineRoutesData?.items.length ?? 0;
  const showUserLibraryHub = userLibraryRouteCount > 0;

  useEffect(() => {
    if (!showUserLibraryHub && routeHub === "library") {
      setRouteHub(null);
    }
  }, [showUserLibraryHub, routeHub]);

  const eventDateLabel = useMemo(
    () => formatEventDateLabel(eventDate),
    [eventDate],
  );

  const startTimeLabel = useMemo(() => formatTimeOfDay(startTime), [startTime]);

  const onCancel = useCallback((): void => {
    router.back();
  }, [router]);

  const onPickGpx = useCallback((): void => {
    void (async () => {
      if (gpxPickInFlightRef.current) {
        return;
      }
      gpxPickInFlightRef.current = true;
      try {
        const draft = await pickAndBuildGpxRoute();
        setGpxDraft(draft);
      } catch (e) {
        if (e instanceof GpxImportCancelledError) {
          return;
        }
        const message =
          e instanceof GpxParseError || e instanceof Error
            ? e.message
            : "Could not read GPX file";
        showAppAlert("GPX", message);
      } finally {
        gpxPickInFlightRef.current = false;
      }
    })();
  }, []);

  const onClearGpx = useCallback((): void => {
    setGpxDraft(null);
  }, []);

  const onPlanRun = useCallback((): void => {
    void (async () => {
      const titleResult = createEventTitleSchema.safeParse(title);
      if (!titleResult.success) {
        showAppAlert("Cannot save", "Event title is required.");
        return;
      }

      const token = await getAccessToken();
      if (!token) {
        showAppAlert("Session", "Sign in again to create an event.");
        return;
      }

      if (saveInFlightRef.current) {
        return;
      }
      saveInFlightRef.current = true;
      try {
        const body = buildCreateEventRequestBody({
          title: titleResult.data,
          eventType,
          description,
          eventDate,
          startTime,
          meetingPoint,
        });
        const created = await postCreateEvent(body, token);
        if (gpxDraft) {
          try {
            await postAddEventRoute(
              created.id,
              {
                mode: "NEW",
                encodedPolyline: gpxDraft.encodedPolyline,
                name: gpxDraft.displayName,
              },
              token,
            );
          } catch (routeErr) {
            const routeMessage =
              routeErr instanceof Error
                ? routeErr.message
                : "Route upload failed";
            showAppAlert(
              "Route",
              `The event was created, but the GPX route could not be attached (${routeMessage}).`,
            );
          }
        }
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace("/(app)");
        }
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Unable to create event";
        showAppAlert("Error", message);
      } finally {
        saveInFlightRef.current = false;
      }
    })();
  }, [
    title,
    eventType,
    description,
    eventDate,
    startTime,
    meetingPoint,
    gpxDraft,
    router,
  ]);

  const contentPadBottom = useMemo(() => {
    if (isDesktop) return 56;
    return 32 + 88 + insets.bottom;
  }, [isDesktop, insets.bottom]);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <AppNavBar />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          style={[
            styles.toolbar,
            {
              paddingHorizontal: horizontalPad,
            },
          ]}
        >
          {isDesktop ? (
            <Pressable
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel="Back"
              hitSlop={8}
              style={styles.toolbarLeadingCluster}
            >
              <MaterialIcons name="arrow-back" size={ICON_MD} color={PRIMARY} />
            </Pressable>
          ) : null}
          <Pressable
            onPress={onCancel}
            accessibilityRole="button"
            accessibilityLabel="Cancel create event"
            hitSlop={8}
          >
            <Text style={styles.toolbarCancel}>CANCEL</Text>
          </Pressable>
          <View style={styles.toolbarSpacer} />
          <Pressable
            onPress={onPlanRun}
            accessibilityRole="button"
            accessibilityLabel="Save event draft"
            hitSlop={8}
            testID="create-event-header-save"
          >
            <MaterialIcons
              name="check"
              size={ICON_LG}
              color={PRIMARY_FIXED_DIM}
            />
          </Pressable>
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={{
            paddingHorizontal: horizontalPad,
            paddingTop: 12,
            paddingBottom: contentPadBottom,
            width: "100%",
            maxWidth: isDesktop
              ? FORM_MAX_WIDTH_DESKTOP + horizontalPad * 2
              : undefined,
            alignSelf: isDesktop ? "center" : undefined,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {isDesktop ? (
            <View style={styles.desktopHeroRow}>
              <View>
                <Text
                  style={[
                    styles.heroDesktopLine1,
                    {
                      fontSize: desktopHeroSize,
                      lineHeight: desktopHeroSize * 0.95,
                    },
                  ]}
                >
                  CREATE
                </Text>
                <Text
                  style={[
                    styles.heroDesktopLine2,
                    {
                      fontSize: desktopHeroSize,
                      lineHeight: desktopHeroSize * 0.95,
                    },
                  ]}
                >
                  RUN
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.heroMobileBlock}>
              <Text
                style={[
                  styles.heroMobileLine,
                  {
                    fontSize: MOBILE_HERO_TITLE_PX,
                    lineHeight: MOBILE_HERO_TITLE_PX * 0.9,
                  },
                ]}
              >
                CREATE{"\n"}RUN
              </Text>
              <View style={styles.heroAccentBar} />
            </View>
          )}

          <View
            style={[styles.formStack, isDesktop && styles.formStackDesktop]}
          >
            <View style={styles.fieldBlock}>
              <FieldLabel accent={isDesktop}>
                {isDesktop ? "EVENT IDENTITY" : "EVENT TITLE"}
              </FieldLabel>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder={
                  isDesktop ? "CHASE THE MIDNIGHT" : "URBAN MIDNIGHT SPRINT"
                }
                placeholderTextColor={PLACEHOLDER_MUTED}
                style={[
                  styles.inputTitle,
                  isDesktop && styles.inputTitleDesktop,
                ]}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.fieldBlock}>
              <FieldLabel>EVENT TYPE</FieldLabel>
              <View
                style={
                  isDesktop
                    ? styles.eventTypeGridDesktop
                    : styles.eventTypeGridMobile
                }
              >
                {EVENT_TYPE_OPTIONS.map((opt) => {
                  const selected = eventType === opt.value;
                  return (
                    <Pressable
                      key={opt.value}
                      onPress={() => setEventType(opt.value)}
                      accessibilityRole="button"
                      accessibilityLabel={`Event type ${opt.label}`}
                      accessibilityState={{ selected }}
                      testID={`create-event-type-${opt.value}`}
                      style={({ pressed }) => [
                        styles.eventTypeCell,
                        isDesktop && styles.eventTypeCellDesktop,
                        selected && styles.eventTypeCellSelected,
                        pressed && styles.eventTypeCellPressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.eventTypeLabel,
                          selected && styles.eventTypeLabelSelected,
                        ]}
                        numberOfLines={2}
                      >
                        {opt.label}
                      </Text>
                      <Text style={styles.eventTypeSubtitle} numberOfLines={2}>
                        {opt.subtitle}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View
              style={
                isDesktop ? styles.dateTimeRowDesktop : styles.dateTimeRowMobile
              }
            >
              <View style={styles.fieldBlockFlex}>
                <FieldLabel>{isDesktop ? "TARGET DATE" : "DATE"}</FieldLabel>
                <Pressable
                  onPress={() => setIsDateCalendarVisible(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Choose target date"
                  testID="create-event-target-date"
                  style={({ pressed }) => [
                    styles.dateTimeFace,
                    pressed && styles.dateTimeFacePressed,
                  ]}
                >
                  <MaterialIcons
                    name="calendar-today"
                    size={ICON_MD}
                    color={PRIMARY}
                  />
                  <Text style={styles.dateDisplayText} numberOfLines={1}>
                    {eventDateLabel}
                  </Text>
                </Pressable>
              </View>
              <View style={styles.fieldBlockFlex}>
                <FieldLabel>START TIME</FieldLabel>
                <Pressable
                  onPress={() => setIsTimeClockVisible(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Choose start time"
                  testID="create-event-start-time"
                  style={({ pressed }) => [
                    styles.dateTimeFace,
                    pressed && styles.dateTimeFacePressed,
                  ]}
                >
                  <MaterialIcons
                    name="schedule"
                    size={ICON_MD}
                    color={PRIMARY}
                  />
                  <Text style={styles.dateDisplayText} numberOfLines={1}>
                    {startTimeLabel}
                  </Text>
                </Pressable>
              </View>
            </View>

            <View
              style={[
                styles.fieldBlock,
                isDesktop && styles.meetingBlockDesktop,
              ]}
            >
              {!isDesktop ? <FieldLabel>MEETING POINT</FieldLabel> : null}
              {isDesktop ? (
                <View style={styles.meetingHeaderRow}>
                  <MaterialIcons
                    name="location-on"
                    size={ICON_MD}
                    color={PRIMARY}
                  />
                  <FieldLabel>MEETING POINT</FieldLabel>
                </View>
              ) : null}
              {!isDesktop ? (
                <View>
                  <View style={styles.locationIconOverlay}>
                    <MaterialIcons
                      name="location-on"
                      size={ICON_MD}
                      color={PRIMARY}
                    />
                  </View>
                  <TextInput
                    value={meetingPoint}
                    onChangeText={setMeetingPoint}
                    placeholder="CENTRAL PLAZA, SECTOR 7"
                    placeholderTextColor={PLACEHOLDER_MUTED}
                    style={styles.inputMeetingMobile}
                  />
                </View>
              ) : (
                <View style={styles.meetingInputRowDesktop}>
                  <TextInput
                    value={meetingPoint}
                    onChangeText={setMeetingPoint}
                    placeholder="Concrete Jungle Plaza, East Side"
                    placeholderTextColor={SURFACE_CONTAINER_HIGHEST}
                    style={styles.inputMeetingDesktop}
                  />
                  <MaterialIcons
                    name="map"
                    size={ICON_MD}
                    color={ON_SURFACE_VARIANT}
                  />
                </View>
              )}
            </View>

            <View style={styles.routeSection}>
              <View style={styles.routeSectionHeader}>
                <FieldLabel>ROUTE SELECTION</FieldLabel>
                {isDesktop ? (
                  <View style={styles.betaChip}>
                    <Text style={styles.betaChipText}>BETA ACCESS</Text>
                  </View>
                ) : null}
              </View>

              <View
                style={
                  isDesktop
                    ? styles.routeCardsGridDesktop
                    : styles.routeCardsCol
                }
              >
                {showUserLibraryHub ? (
                  <Pressable
                    onPress={() => {
                      setRouteHub("library");
                      router.push({
                        pathname: "/(app)/route-library",
                        params: { source: "library" },
                      });
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Choose route from my library"
                    testID="create-event-route-library"
                    style={({ pressed }) => [
                      styles.routeCard,
                      isDesktop && styles.routeCardDesktop,
                      routeHub === "library" && styles.routeCardSelected,
                      pressed && styles.routeCardPressed,
                    ]}
                  >
                    {isDesktop ? (
                      <>
                        <Image
                          source={{ uri: LIBRARY_PHOTO_URI }}
                          style={styles.routeCardPhoto}
                          contentFit="cover"
                        />
                        <View style={styles.routeCardScrim} />
                        <MaterialIcons
                          name="folder-shared"
                          size={ICON_LG}
                          color={ON_SURFACE_VARIANT}
                          style={styles.routeCardIconCorner}
                        />
                        <View style={styles.routeCardTextBlockBottom}>
                          <Text style={styles.routeCardMeta}>USER_CONTENT</Text>
                          <Text style={styles.routeCardTitleDesktop}>
                            MY LIBRARY
                          </Text>
                        </View>
                      </>
                    ) : (
                      <>
                        <MaterialIcons
                          name="folder-special"
                          size={ICON_LG}
                          color={PRIMARY}
                        />
                        <View>
                          <Text style={styles.routeCardTitleMobile}>
                            MY{"\n"}LIBRARY
                          </Text>
                          <Text style={styles.routeCardCaption}>
                            {userLibraryRouteCount === 1
                              ? "1 SAVED ROUTE"
                              : `${userLibraryRouteCount} SAVED ROUTES`}
                          </Text>
                        </View>
                        <MaterialIcons
                          name="route"
                          size={100}
                          color={ON_SURFACE}
                          style={styles.routeWatermark}
                        />
                      </>
                    )}
                  </Pressable>
                ) : null}

                <Pressable
                  onPress={() => {
                    setRouteHub("global");
                    router.push({
                      pathname: "/(app)/route-library",
                      params: { source: "global" },
                    });
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Choose route from global hub"
                  testID="create-event-route-global"
                  style={({ pressed }) => [
                    styles.routeCard,
                    isDesktop && styles.routeCardDesktop,
                    routeHub === "global" && styles.routeCardSelected,
                    pressed && styles.routeCardPressed,
                  ]}
                >
                  {isDesktop ? (
                    <>
                      <Image
                        source={{ uri: GLOBAL_PHOTO_URI }}
                        style={styles.routeCardPhoto}
                        contentFit="cover"
                      />
                      <View style={styles.routeCardScrim} />
                      <View style={styles.routeCardPremiumRow}>
                        <MaterialIcons
                          name="workspace-premium"
                          size={16}
                          color={PREMIUM_GOLD}
                        />
                        <Text style={styles.premiumMetaDesktop}>
                          PREMIUM_NETWORK
                        </Text>
                      </View>
                      <MaterialIcons
                        name="public"
                        size={ICON_LG}
                        color={ON_SURFACE_VARIANT}
                        style={styles.routeCardIconCorner}
                      />
                      <View style={styles.routeCardTextBlockBottom}>
                        <Text style={styles.routeCardTitleDesktop}>
                          GLOBAL LIBRARY
                        </Text>
                      </View>
                    </>
                  ) : (
                    <>
                      <View style={styles.routeCardTopRowMobile}>
                        <MaterialIcons
                          name="public"
                          size={ICON_LG}
                          color={PRIMARY}
                        />
                        <View style={styles.premiumChip}>
                          <MaterialIcons
                            name="workspace-premium"
                            size={12}
                            color={ON_PRIMARY_FIXED}
                          />
                          <Text style={styles.premiumChipText}>PREMIUM</Text>
                        </View>
                      </View>
                      <View>
                        <Text style={styles.routeCardTitleMobile}>
                          GLOBAL{"\n"}HUB
                        </Text>
                        <Text style={styles.routeCardCaption}>
                          COMMUNITY ROUTES
                        </Text>
                      </View>
                      <MaterialIcons
                        name="explore"
                        size={100}
                        color={ON_SURFACE}
                        style={styles.routeWatermark}
                      />
                    </>
                  )}
                </Pressable>
              </View>

              <Pressable
                onPress={onPickGpx}
                accessibilityRole="button"
                accessibilityLabel="Upload GPX file"
                testID="create-event-gpx-upload"
                style={({ pressed }) => [
                  styles.gpxZone,
                  gpxDraft && styles.gpxZoneHasDraft,
                  pressed && styles.gpxZonePressed,
                ]}
              >
                <View style={styles.gpxIconCircle}>
                  <MaterialIcons
                    name="upload-file"
                    size={ICON_MD}
                    color={PRIMARY}
                  />
                </View>
                <View style={styles.gpxZoneTextCol}>
                  <Text style={styles.gpxTitle}>UPLOAD GPX FILE</Text>
                  <Text style={styles.gpxHint}>
                    {isDesktop
                      ? "Tap to browse — max 5MB"
                      : "TAP TO BROWSE — MAX 5MB"}
                  </Text>
                </View>
              </Pressable>

              {gpxDraft ? (
                <View style={styles.gpxStatusRow} testID="create-event-gpx-status">
                  <View style={styles.gpxStatusTextCol}>
                    <Text style={styles.gpxStatusTitle} numberOfLines={1}>
                      {gpxDraft.displayName.toUpperCase()}
                    </Text>
                    <Text style={styles.gpxStatusMeta}>
                      {formatDistanceLabel(gpxDraft.distanceMeters)}
                    </Text>
                  </View>
                  <Pressable
                    onPress={onClearGpx}
                    accessibilityRole="button"
                    accessibilityLabel="Remove imported GPX"
                    testID="create-event-gpx-clear"
                    style={({ pressed }) => [
                      styles.gpxClearBtn,
                      pressed && styles.gpxClearBtnPressed,
                    ]}
                  >
                    <Text style={styles.gpxClearBtnLabel}>CLEAR</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>

            <View style={styles.fieldBlock}>
              <FieldLabel>
                {isDesktop ? "MISSION BRIEFING (DESCRIPTION)" : "DESCRIPTION"}
              </FieldLabel>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder={
                  isDesktop
                    ? "Describe the intensity, the vibe, and any specific gear requirements..."
                    : "Briefing: High intensity intervals through the financial district. Bring hydration and reflectors."
                }
                placeholderTextColor={PLACEHOLDER_MUTED}
                style={[
                  styles.inputDescription,
                  isDesktop && styles.inputDescriptionDesktop,
                ]}
                multiline
                textAlignVertical="top"
              />
            </View>

            <View
              style={[
                styles.mapPreview,
                isDesktop && styles.mapPreviewDesktop,
                gpxDraft && styles.mapPreviewRoutePlate,
                gpxDraft && styles.mapPreviewWithRoute,
                gpxDraft && isDesktop && styles.mapPreviewWithRouteDesktop,
              ]}
            >
              {gpxDraft ? (
                <>
                  <View
                    style={styles.mapTraceLayer}
                    testID="create-event-route-preview"
                  >
                    <RoutePolylinePreview
                      encodedPolyline={gpxDraft.encodedPolyline}
                      strokeColor={PRIMARY}
                      backgroundColor={SURFACE_CONTAINER_LOW}
                    />
                  </View>
                  <View
                    style={[styles.mapGradient, styles.mapGradientOverRoute]}
                  />
                  <View
                    style={styles.mapBadge}
                    testID="create-event-route-preview-badge"
                  >
                    <View style={styles.mapPulseDot} />
                    <Text style={styles.mapBadgeText}>ROUTE PREVIEW</Text>
                  </View>
                </>
              ) : (
                <>
                  <Image
                    source={{ uri: MAP_PREVIEW_URI }}
                    style={styles.mapImage}
                    contentFit="cover"
                  />
                  <View style={styles.mapGradient} />
                  <View style={styles.mapBadge}>
                    <View style={styles.mapPulseDot} />
                    <Text style={styles.mapBadgeText}>
                      MAP PREVIEW UNAVAILABLE
                    </Text>
                  </View>
                </>
              )}
            </View>

            {isDesktop ? (
              <Pressable
                onPress={onPlanRun}
                accessibilityRole="button"
                accessibilityLabel="Plan the run"
                testID="create-event-submit-desktop"
                style={({ pressed }) => [
                  styles.primaryCtaDesktop,
                  pressed && styles.primaryCtaPressed,
                ]}
              >
                <Text style={styles.primaryCtaLabelDesktop}>PLAN THE RUN</Text>
                <MaterialIcons
                  name="trending-flat"
                  size={ICON_LG}
                  color={ON_PRIMARY_FIXED}
                />
              </Pressable>
            ) : null}
          </View>
        </ScrollView>

        {!isDesktop ? (
          <View
            style={[
              styles.bottomDock,
              {
                paddingBottom: insets.bottom + 20,
                paddingHorizontal: horizontalPad,
              },
            ]}
          >
            <Pressable
              onPress={onPlanRun}
              accessibilityRole="button"
              accessibilityLabel="Plan the run"
              testID="create-event-submit-mobile"
              style={({ pressed }) => [
                styles.primaryCtaMobile,
                pressed && styles.primaryCtaPressed,
              ]}
            >
              <Text style={styles.primaryCtaLabelMobile}>PLAN THE RUN</Text>
            </Pressable>
          </View>
        ) : null}
      </KeyboardAvoidingView>
      <EventDateCalendarModal
        visible={isDateCalendarVisible}
        value={eventDate}
        onClose={() => setIsDateCalendarVisible(false)}
        onSelect={setEventDate}
      />
      <EventTimeClockModal
        visible={isTimeClockVisible}
        value={startTime}
        onClose={() => setIsTimeClockVisible(false)}
        onSelect={setStartTime}
      />
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
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    backgroundColor: SURFACE_DIM,
  },
  toolbarLeadingCluster: {
    marginRight: 12,
  },
  toolbarCancel: {
    color: ON_SURFACE_VARIANT,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },
  toolbarSpacer: {
    flex: 1,
  },
  heroMobileBlock: {
    marginBottom: 28,
  },
  heroMobileLine: {
    color: ON_SURFACE,
    fontWeight: "900",
    letterSpacing: -3,
    textTransform: "uppercase",
  },
  heroAccentBar: {
    marginTop: 12,
    width: 96,
    height: 4,
    backgroundColor: PRIMARY_FIXED_DIM,
  },
  desktopHeroRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 24,
    marginBottom: 32,
    width: "100%",
  },
  desktopHeroAside: {
    maxWidth: 360,
    paddingBottom: 8,
  },
  desktopMetaEyebrow: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 3,
    color: ON_SURFACE_VARIANT,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  desktopHeroBlurb: {
    color: ON_SURFACE_VARIANT,
    fontSize: 15,
    lineHeight: 24,
    textAlign: "right",
  },
  heroDesktopLine1: {
    color: ON_SURFACE,
    fontWeight: "900",
    letterSpacing: -4,
    textTransform: "uppercase",
  },
  heroDesktopLine2: {
    color: PRIMARY,
    fontWeight: "900",
    letterSpacing: -4,
    textTransform: "uppercase",
  },
  formStack: {
    gap: 28,
    width: "100%",
    maxWidth: FORM_MAX_WIDTH_DESKTOP,
    alignSelf: "center",
  },
  formStackDesktop: {
    gap: 40,
  },
  fieldBlock: {
    gap: 10,
    width: "100%",
  },
  fieldBlockFlex: {
    flex: 1,
    gap: 10,
    minWidth: 0,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 3,
    color: ON_SURFACE_VARIANT,
    textTransform: "uppercase",
  },
  fieldLabelAccent: {
    color: PRIMARY,
  },
  inputTitle: {
    backgroundColor: SURFACE_CONTAINER_HIGHEST,
    color: ON_SURFACE,
    fontSize: 20,
    fontWeight: "800",
    paddingVertical: 18,
    paddingHorizontal: 16,
    width: "100%",
  },
  inputTitleDesktop: {
    fontSize: 28,
    paddingVertical: 28,
    paddingHorizontal: 24,
    textTransform: "uppercase",
  },
  eventTypeGridMobile: {
    gap: 10,
    width: "100%",
  },
  eventTypeGridDesktop: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    width: "100%",
  },
  eventTypeCell: {
    backgroundColor: SURFACE_CONTAINER_HIGH,
    paddingVertical: 14,
    paddingHorizontal: 14,
    width: "100%",
    gap: 4,
  },
  eventTypeCellDesktop: {
    width: "48%",
    flexGrow: 1,
    minWidth: 200,
  },
  eventTypeCellSelected: {
    backgroundColor: SURFACE_CONTAINER_HIGHEST,
  },
  eventTypeCellPressed: {
    opacity: 0.94,
  },
  eventTypeLabel: {
    color: ON_SURFACE,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1,
  },
  eventTypeLabelSelected: {
    color: PRIMARY,
  },
  eventTypeSubtitle: {
    color: ZINC_MUTED,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  dateTimeRowMobile: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  dateTimeRowDesktop: {
    flexDirection: "row",
    gap: 28,
    width: "100%",
  },
  dateTimeFace: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: SURFACE_CONTAINER_HIGHEST,
    paddingVertical: 16,
    paddingHorizontal: 14,
    width: "100%",
  },
  dateTimeFacePressed: {
    opacity: 0.94,
  },
  dateDisplayText: {
    flex: 1,
    color: ON_SURFACE,
    fontSize: 17,
    fontWeight: "800",
    minWidth: 0,
  },
  inputInlineBold: {
    flex: 1,
    color: ON_SURFACE,
    fontSize: 17,
    fontWeight: "800",
    padding: 0,
    minWidth: 0,
  },
  locationIconOverlay: {
    position: "absolute",
    left: 14,
    top: 19,
    zIndex: 1,
  },
  inputMeetingMobile: {
    backgroundColor: SURFACE_CONTAINER_HIGHEST,
    color: ON_SURFACE,
    fontSize: 15,
    fontWeight: "600",
    paddingVertical: 16,
    paddingLeft: 44,
    paddingRight: 14,
    width: "100%",
  },
  meetingBlockDesktop: {
    backgroundColor: SURFACE_CONTAINER_HIGH,
    padding: 24,
    gap: 12,
  },
  meetingHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  meetingInputRowDesktop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  inputMeetingDesktop: {
    flex: 1,
    color: ON_SURFACE,
    fontSize: 20,
    fontWeight: "800",
    padding: 0,
    minWidth: 0,
  },
  routeSection: {
    gap: 18,
    width: "100%",
  },
  routeSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  betaChip: {
    backgroundColor: "rgba(255, 87, 34, 0.12)",
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  betaChipText: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 2,
    color: PRIMARY,
    textTransform: "uppercase",
  },
  routeCardsCol: {
    gap: 14,
  },
  routeCardsGridDesktop: {
    flexDirection: "row",
    gap: 22,
  },
  routeCard: {
    backgroundColor: SURFACE_CONTAINER_HIGH,
    padding: 18,
    overflow: "hidden",
    minHeight: ROUTE_CARD_MIN_HEIGHT_MOBILE,
    justifyContent: "space-between",
  },
  routeCardDesktop: {
    flex: 1,
    minWidth: 0,
    minHeight: ROUTE_CARD_MIN_HEIGHT_DESKTOP,
    padding: 0,
  },
  routeCardSelected: {
    borderWidth: 1,
    borderColor: GHOST_OUTLINE,
    backgroundColor: SURFACE_CONTAINER_HIGHEST,
  },
  routeCardPressed: {
    opacity: 0.94,
  },
  routeCardPhoto: {
    ...StyleSheet.absoluteFillObject,
  },
  routeCardScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(14, 14, 14, 0.72)",
  },
  routeCardIconCorner: {
    position: "absolute",
    top: 20,
    right: 20,
  },
  routeCardPremiumRow: {
    position: "absolute",
    top: 20,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  premiumMetaDesktop: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 2,
    color: PREMIUM_GOLD,
    textTransform: "uppercase",
  },
  routeCardTextBlockBottom: {
    position: "absolute",
    left: 20,
    bottom: 20,
    right: 20,
  },
  routeCardMeta: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 2,
    color: PRIMARY,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  routeCardTitleDesktop: {
    color: ON_SURFACE,
    fontSize: 22,
    fontWeight: "800",
  },
  routeCardTitleMobile: {
    color: ON_SURFACE,
    fontSize: 18,
    fontWeight: "800",
    textTransform: "uppercase",
    lineHeight: 22,
  },
  routeCardCaption: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.5,
    color: ZINC_MUTED,
    textTransform: "uppercase",
  },
  routeCardTopRowMobile: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  premiumChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: PRIMARY_FIXED_DIM,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  premiumChipText: {
    color: ON_PRIMARY_FIXED,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 2,
  },
  routeWatermark: {
    position: "absolute",
    right: -16,
    bottom: -28,
    opacity: 0.08,
  },
  gpxZone: {
    backgroundColor: SURFACE_CONTAINER_LOW,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 12,
  },
  gpxZoneHasDraft: {
    backgroundColor: SURFACE_CONTAINER_HIGH,
  },
  gpxZonePressed: {
    opacity: 0.92,
  },
  gpxZoneTextCol: {
    alignItems: "center",
    gap: 4,
    maxWidth: "100%",
  },
  gpxIconCircle: {
    width: 52,
    height: 52,
    backgroundColor: SURFACE_CONTAINER_HIGHEST,
    justifyContent: "center",
    alignItems: "center",
  },
  gpxTitle: {
    color: ON_SURFACE,
    fontSize: 14,
    fontWeight: "800",
    textTransform: "uppercase",
    textAlign: "center",
  },
  gpxStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    backgroundColor: SURFACE_CONTAINER_HIGH,
    paddingVertical: 14,
    paddingHorizontal: 16,
    width: "100%",
  },
  gpxStatusTextCol: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  gpxStatusTitle: {
    color: PRIMARY,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
  },
  gpxStatusMeta: {
    color: ZINC_MUTED,
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  gpxClearBtn: {
    backgroundColor: SURFACE_CONTAINER_LOW,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  gpxClearBtnPressed: {
    opacity: 0.9,
  },
  gpxClearBtnLabel: {
    color: ON_SURFACE_VARIANT,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
  },
  gpxHint: {
    color: ON_SURFACE_VARIANT,
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.5,
    textAlign: "center",
    textTransform: "uppercase",
  },
  inputDescription: {
    backgroundColor: SURFACE_CONTAINER_HIGHEST,
    color: ON_SURFACE,
    fontSize: 14,
    lineHeight: 22,
    paddingVertical: 16,
    paddingHorizontal: 16,
    minHeight: 120,
    width: "100%",
  },
  inputDescriptionDesktop: {
    backgroundColor: SURFACE_CONTAINER_HIGH,
    fontSize: 17,
    lineHeight: 26,
    paddingVertical: 24,
    paddingHorizontal: 28,
    minHeight: 140,
  },
  mapPreview: {
    width: "100%",
    height: 180,
    backgroundColor: SURFACE_CONTAINER,
    overflow: "hidden",
  },
  mapPreviewDesktop: {
    height: 220,
  },
  mapPreviewRoutePlate: {
    backgroundColor: SURFACE_CONTAINER_LOW,
  },
  mapPreviewWithRoute: {
    height: 240,
  },
  mapPreviewWithRouteDesktop: {
    height: 300,
  },
  mapTraceLayer: {
    width: "100%",
    height: "100%",
  },
  mapImage: {
    width: "100%",
    height: "100%",
    opacity: 0.55,
  },
  mapGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "55%",
    backgroundColor: "rgba(14, 14, 14, 0.82)",
  },
  mapGradientOverRoute: {
    height: "26%",
    backgroundColor: "rgba(14, 14, 14, 0.38)",
  },
  mapBadge: {
    position: "absolute",
    left: 14,
    bottom: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(9, 9, 11, 0.82)",
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  mapPulseDot: {
    width: 8,
    height: 8,
    backgroundColor: PRIMARY,
  },
  mapBadgeText: {
    color: ON_SURFACE,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  bottomDock: {
    backgroundColor: SURFACE_DIM,
    paddingTop: 16,
    borderTopWidth: 0,
  },
  primaryCtaMobile: {
    backgroundColor: PRIMARY_FIXED_DIM,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  primaryCtaDesktop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    backgroundColor: PRIMARY_FIXED_DIM,
    paddingVertical: 28,
    width: "100%",
    marginTop: 8,
    marginBottom: 24,
  },
  primaryCtaPressed: {
    opacity: 0.92,
  },
  primaryCtaLabelMobile: {
    color: ON_PRIMARY_FIXED,
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: -0.5,
    textTransform: "uppercase",
  },
  primaryCtaLabelDesktop: {
    color: ON_PRIMARY_FIXED,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 3,
    textTransform: "uppercase",
  },
});
