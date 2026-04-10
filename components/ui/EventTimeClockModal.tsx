import type { ReactElement } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";

import { MaterialIcons } from "@expo/vector-icons";

import type { TimeOfDay } from "@/lib/time/timeOfDay";
import {
  formatTimeOfDay,
  hour12PeriodTo24,
  hour24To12Period,
} from "@/lib/time/timeOfDay";

const SURFACE_DIM = "#0e0e0e";
const SURFACE_CONTAINER = "#1a1919";
const SURFACE_CONTAINER_HIGH = "#201f1f";
const ON_SURFACE = "#ffffff";
const ON_SURFACE_VARIANT = "#adaaaa";
const ON_PRIMARY_FIXED = "#000000";
const PRIMARY = "#ff5722";
const PRIMARY_FIXED_DIM = "#ff5d2b";

const ICON_NAV = 22;
const CLOCK_SIZE = 280;
const CLOCK_CENTER = CLOCK_SIZE / 2;
const R_FACE = 132;
const R_HOUR_LABEL = 102;
const HOUR_HAND_LEN = 68;
const MIN_HAND_LEN = 92;

const HOUR_MARKERS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;

type Phase = "hour" | "minute";

function degreesHourHand(h24: number, minutes: number): number {
  const h12 = h24 % 12;
  return h12 * 30 + minutes * 0.5;
}

function degreesMinuteHand(minutes: number): number {
  return minutes * 6;
}

function polarDegToXY(cx: number, cy: number, r: number, degFromTopClockwise: number): { x: number; y: number } {
  const rad = (degFromTopClockwise * Math.PI) / 180;
  return {
    x: cx + r * Math.sin(rad),
    y: cy - r * Math.cos(rad),
  };
}

function hourMarkerDegrees(hourLabel: number): number {
  return (hourLabel % 12) * 30;
}

/** Minute step 0–11 maps to minutes 0,5,…,55 at the same angles as hour 12,1,…,11 */
function minuteStepFromMarkerIndex(markerHour: number): number {
  return markerHour === 12 ? 0 : markerHour * 5;
}

export interface EventTimeClockModalProps {
  visible: boolean;
  value: TimeOfDay;
  onClose: () => void;
  onSelect: (t: TimeOfDay) => void;
}

export function EventTimeClockModal({
  visible,
  value,
  onClose,
  onSelect,
}: EventTimeClockModalProps): ReactElement {
  const [phase, setPhase] = useState<Phase>("hour");
  const [{ h12, period }, set12] = useState(() => hour24To12Period(value.hours));
  const [draftMinute, setDraftMinute] = useState(value.minutes);

  const draftHour24 = useMemo(() => hour12PeriodTo24(h12, period), [h12, period]);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setPhase("hour");
    set12(hour24To12Period(value.hours));
    setDraftMinute(value.minutes);
  }, [visible, value]);

  const previewLabel = useMemo(
    () => formatTimeOfDay({ hours: draftHour24, minutes: draftMinute }),
    [draftHour24, draftMinute],
  );

  const hourHandDeg = degreesHourHand(draftHour24, draftMinute);
  const minuteHandDeg = degreesMinuteHand(draftMinute);

  const hourHandEnd = polarDegToXY(CLOCK_CENTER, CLOCK_CENTER, HOUR_HAND_LEN, hourHandDeg);
  const minuteHandEnd = polarDegToXY(CLOCK_CENTER, CLOCK_CENTER, MIN_HAND_LEN, minuteHandDeg);

  const commitAndClose = useCallback(
    (next: TimeOfDay): void => {
      onSelect(next);
      onClose();
    },
    [onSelect, onClose],
  );

  const handleDone = useCallback((): void => {
    commitAndClose({ hours: draftHour24, minutes: draftMinute });
  }, [commitAndClose, draftHour24, draftMinute]);

  const onPickHour = useCallback((label: number): void => {
    const next12 = label === 12 ? 12 : label;
    set12((prev) => ({ ...prev, h12: next12 }));
    setPhase("minute");
  }, []);

  const onPickMinuteStep = useCallback(
    (markerLabel: number): void => {
      const nextMin = minuteStepFromMarkerIndex(markerLabel);
      setDraftMinute(nextMin);
      commitAndClose({ hours: draftHour24, minutes: nextMin });
    },
    [draftHour24, commitAndClose],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close time picker"
        />
        <View style={styles.sheetAlign}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              {phase === "minute" ? (
                <Pressable
                  onPress={() => setPhase("hour")}
                  accessibilityRole="button"
                  accessibilityLabel="Back to hour"
                  hitSlop={10}
                  testID="event-time-clock-back-hour"
                >
                  <MaterialIcons name="chevron-left" size={ICON_NAV} color={PRIMARY} />
                </Pressable>
              ) : (
                <View style={styles.sheetHeaderSpacer} />
              )}
              <Text style={styles.previewTime}>{previewLabel}</Text>
              {phase === "minute" ? (
                <View style={styles.sheetHeaderSpacer} />
              ) : (
                <View style={styles.sheetHeaderSpacer} />
              )}
            </View>

            <Text style={styles.phaseHint}>
              {phase === "hour" ? "SELECT HOUR" : "SELECT MINUTE"}
            </Text>

            {phase === "hour" ? (
              <View style={styles.periodRow}>
                <Pressable
                  onPress={() => set12((p) => ({ ...p, period: "am" }))}
                  style={({ pressed }) => [
                    styles.periodChip,
                    period === "am" && styles.periodChipSelected,
                    pressed && styles.periodChipPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Morning"
                  testID="event-time-clock-am"
                >
                  <Text style={[styles.periodLabel, period === "am" && styles.periodLabelSelected]}>
                    AM
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => set12((p) => ({ ...p, period: "pm" }))}
                  style={({ pressed }) => [
                    styles.periodChip,
                    period === "pm" && styles.periodChipSelected,
                    pressed && styles.periodChipPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Afternoon and evening"
                  testID="event-time-clock-pm"
                >
                  <Text style={[styles.periodLabel, period === "pm" && styles.periodLabelSelected]}>
                    PM
                  </Text>
                </Pressable>
              </View>
            ) : null}

            <View style={styles.clockWrap}>
              <Svg
                width={CLOCK_SIZE}
                height={CLOCK_SIZE}
                style={styles.clockSvg}
                pointerEvents="none"
              >
                <Circle cx={CLOCK_CENTER} cy={CLOCK_CENTER} r={R_FACE} fill={SURFACE_CONTAINER_HIGH} />
                <Line
                  x1={CLOCK_CENTER}
                  y1={CLOCK_CENTER}
                  x2={hourHandEnd.x}
                  y2={hourHandEnd.y}
                  stroke={PRIMARY_FIXED_DIM}
                  strokeWidth={5}
                  strokeLinecap="square"
                />
                <Line
                  x1={CLOCK_CENTER}
                  y1={CLOCK_CENTER}
                  x2={minuteHandEnd.x}
                  y2={minuteHandEnd.y}
                  stroke={ON_SURFACE}
                  strokeWidth={3}
                  strokeLinecap="square"
                />
                <Circle cx={CLOCK_CENTER} cy={CLOCK_CENTER} r={6} fill={PRIMARY_FIXED_DIM} />
              </Svg>

              {phase === "hour"
                ? HOUR_MARKERS.map((label) => {
                    const deg = hourMarkerDegrees(label);
                    const pos = polarDegToXY(CLOCK_CENTER, CLOCK_CENTER, R_HOUR_LABEL, deg);
                    const isSel =
                      (h12 === 12 && label === 12) ||
                      (h12 !== 12 && label === h12);
                    return (
                      <Pressable
                        key={`h-${label}`}
                        accessibilityRole="button"
                        accessibilityLabel={`Select hour ${label === 12 ? 12 : label}`}
                        testID={`event-time-clock-hour-${label}`}
                        onPress={() => onPickHour(label)}
                        style={[
                          styles.clockHit,
                          {
                            left: pos.x - 22,
                            top: pos.y - 22,
                          },
                          isSel && styles.clockHitSelected,
                        ]}
                      >
                        <Text
                          style={[styles.clockDigit, isSel && styles.clockDigitSelected]}
                        >
                          {label}
                        </Text>
                      </Pressable>
                    );
                  })
                : HOUR_MARKERS.map((label) => {
                    const minVal = minuteStepFromMarkerIndex(label);
                    const deg = hourMarkerDegrees(label);
                    const pos = polarDegToXY(CLOCK_CENTER, CLOCK_CENTER, R_HOUR_LABEL, deg);
                    const isSel = minVal === draftMinute;
                    const display = String(minVal).padStart(2, "0");
                    return (
                      <Pressable
                        key={`m-${label}`}
                        accessibilityRole="button"
                        accessibilityLabel={`Select minute ${minVal}`}
                        testID={`event-time-clock-min-${minVal}`}
                        onPress={() => onPickMinuteStep(label)}
                        style={[
                          styles.clockHit,
                          {
                            left: pos.x - 22,
                            top: pos.y - 22,
                          },
                          isSel && styles.clockHitSelected,
                        ]}
                      >
                        <Text
                          style={[styles.clockDigitMinute, isSel && styles.clockDigitSelected]}
                        >
                          {display}
                        </Text>
                      </Pressable>
                    );
                  })}
            </View>

            <Pressable
              onPress={handleDone}
              accessibilityRole="button"
              accessibilityLabel="Confirm time"
              style={({ pressed }) => [styles.doneRow, pressed && styles.doneRowPressed]}
              testID="event-time-clock-close"
            >
              <Text style={styles.doneLabel}>DONE</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(14, 14, 14, 0.88)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  sheetAlign: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
  },
  sheet: {
    backgroundColor: SURFACE_CONTAINER,
    paddingVertical: 20,
    paddingHorizontal: 16,
    width: "100%",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sheetHeaderSpacer: {
    width: ICON_NAV,
  },
  previewTime: {
    color: ON_SURFACE,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 2,
  },
  phaseHint: {
    color: ON_SURFACE_VARIANT,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: 12,
  },
  periodRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 12,
  },
  periodChip: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: SURFACE_CONTAINER_HIGH,
  },
  periodChipSelected: {
    backgroundColor: PRIMARY_FIXED_DIM,
  },
  periodChipPressed: {
    opacity: 0.92,
  },
  periodLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: ON_SURFACE_VARIANT,
    letterSpacing: 1,
  },
  periodLabelSelected: {
    color: ON_PRIMARY_FIXED,
  },
  clockWrap: {
    width: CLOCK_SIZE,
    height: CLOCK_SIZE,
    alignSelf: "center",
    marginVertical: 8,
  },
  clockSvg: {
    position: "absolute",
    left: 0,
    top: 0,
  },
  clockHit: {
    position: "absolute",
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  clockHitSelected: {
    backgroundColor: "rgba(255, 87, 34, 0.18)",
  },
  clockDigit: {
    color: ON_SURFACE,
    fontSize: 18,
    fontWeight: "800",
  },
  clockDigitMinute: {
    color: ON_SURFACE,
    fontSize: 13,
    fontWeight: "800",
  },
  clockDigitSelected: {
    color: PRIMARY_FIXED_DIM,
  },
  doneRow: {
    marginTop: 16,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: SURFACE_DIM,
  },
  doneRowPressed: {
    opacity: 0.92,
  },
  doneLabel: {
    color: PRIMARY,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2,
  },
});
