import type { ReactElement } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";

const SURFACE_DIM = "#0e0e0e";
const SURFACE_CONTAINER = "#1a1919";
const SURFACE_CONTAINER_HIGH = "#201f1f";
const ON_SURFACE = "#ffffff";
const ON_SURFACE_VARIANT = "#adaaaa";
const ON_PRIMARY_FIXED = "#000000";
const PRIMARY = "#ff5722";
const PRIMARY_FIXED_DIM = "#ff5d2b";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"] as const;
const ICON_NAV = 22;

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function buildMonthCells(year: number, monthIndex: number): (number | null)[] {
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const totalDays = daysInMonth(year, monthIndex);
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i += 1) {
    cells.push(null);
  }
  for (let d = 1; d <= totalDays; d += 1) {
    cells.push(d);
  }
  const remainder = cells.length % 7;
  if (remainder !== 0) {
    for (let i = 0; i < 7 - remainder; i += 1) {
      cells.push(null);
    }
  }
  return cells;
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function atLocalNoon(year: number, monthIndex: number, day: number): Date {
  const d = new Date(year, monthIndex, day, 12, 0, 0, 0);
  return d;
}

export interface EventDateCalendarModalProps {
  visible: boolean;
  value: Date;
  onClose: () => void;
  onSelect: (date: Date) => void;
}

export function EventDateCalendarModal({
  visible,
  value,
  onClose,
  onSelect,
}: EventDateCalendarModalProps): ReactElement {
  const [viewYear, setViewYear] = useState(value.getFullYear());
  const [viewMonth, setViewMonth] = useState(value.getMonth());

  useEffect(() => {
    if (!visible) {
      return;
    }
    setViewYear(value.getFullYear());
    setViewMonth(value.getMonth());
  }, [visible, value]);

  const monthTitle = useMemo(() => {
    const label = new Date(viewYear, viewMonth, 1).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    return label.toUpperCase();
  }, [viewYear, viewMonth]);

  const cells = useMemo(
    () => buildMonthCells(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const rows = useMemo(() => {
    const out: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      out.push(cells.slice(i, i + 7));
    }
    return out;
  }, [cells]);

  const goPrevMonth = useCallback((): void => {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }, []);

  const goNextMonth = useCallback((): void => {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }, []);

  const handlePickDay = useCallback(
    (day: number): void => {
      const next = atLocalNoon(viewYear, viewMonth, day);
      onSelect(next);
      onClose();
    },
    [viewYear, viewMonth, onSelect, onClose],
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
          accessibilityLabel="Close calendar"
        />
        <View style={styles.sheetAlign}>
          <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Pressable
              onPress={goPrevMonth}
              accessibilityRole="button"
              accessibilityLabel="Previous month"
              hitSlop={10}
              testID="event-date-cal-prev"
            >
              <MaterialIcons name="chevron-left" size={ICON_NAV} color={PRIMARY} />
            </Pressable>
            <Text style={styles.sheetMonthTitle}>{monthTitle}</Text>
            <Pressable
              onPress={goNextMonth}
              accessibilityRole="button"
              accessibilityLabel="Next month"
              hitSlop={10}
              testID="event-date-cal-next"
            >
              <MaterialIcons name="chevron-right" size={ICON_NAV} color={PRIMARY} />
            </Pressable>
          </View>

          <View style={styles.weekdayRow}>
            {WEEKDAY_LABELS.map((w, i) => (
              <View key={`${w}-${i}`} style={styles.weekdayCell}>
                <Text style={styles.weekdayText}>{w}</Text>
              </View>
            ))}
          </View>

          <View style={styles.grid}>
            {rows.map((row, ri) => (
              <View key={`row-${ri}`} style={styles.weekRow}>
                {row.map((day, ci) => {
                  const idx = ri * 7 + ci;
                  if (day === null) {
                    return (
                      <View key={`pad-${idx}`} style={styles.dayCellGrow} />
                    );
                  }
                  const cellDate = atLocalNoon(viewYear, viewMonth, day);
                  const selected = isSameCalendarDay(cellDate, value);
                  return (
                    <Pressable
                      key={`d-${day}-${idx}`}
                      accessibilityRole="button"
                      accessibilityLabel={`Select day ${day}`}
                      testID={`event-date-cal-day-${day}`}
                      onPress={() => {
                        handlePickDay(day);
                      }}
                      style={[
                        styles.dayCellGrow,
                        styles.dayCell,
                        selected && styles.dayCellSelected,
                      ]}
                    >
                      <Text
                        style={[styles.dayText, selected && styles.dayTextSelected]}
                      >
                        {day}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>

          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
            style={({ pressed }) => [styles.doneRow, pressed && styles.doneRowPressed]}
            testID="event-date-cal-close"
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
    marginBottom: 16,
  },
  sheetMonthTitle: {
    color: ON_SURFACE,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 2,
    flex: 1,
    textAlign: "center",
  },
  weekdayRow: {
    flexDirection: "row",
    marginBottom: 8,
    gap: 4,
  },
  weekdayCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  weekdayText: {
    color: ON_SURFACE_VARIANT,
    fontSize: 11,
    fontWeight: "700",
  },
  grid: {
    gap: 4,
  },
  weekRow: {
    flexDirection: "row",
    gap: 4,
  },
  dayCellGrow: {
    flex: 1,
    aspectRatio: 1,
    minWidth: 0,
    minHeight: 0,
  },
  dayCell: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SURFACE_CONTAINER_HIGH,
  },
  dayCellSelected: {
    backgroundColor: PRIMARY_FIXED_DIM,
  },
  dayText: {
    color: ON_SURFACE,
    fontSize: 15,
    fontWeight: "800",
  },
  dayTextSelected: {
    color: ON_PRIMARY_FIXED,
  },
  doneRow: {
    marginTop: 20,
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
