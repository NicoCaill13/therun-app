export interface TimeOfDay {
  hours: number;
  minutes: number;
}

export function formatTimeOfDay(t: TimeOfDay): string {
  return `${String(t.hours).padStart(2, "0")}:${String(t.minutes).padStart(2, "0")}`;
}

export function parseTimeOfDay(input: string): TimeOfDay | null {
  const m = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/.exec(input.trim());
  if (!m) {
    return null;
  }
  return { hours: Number(m[1]), minutes: Number(m[2]) };
}

export function createDefaultStartTime(): TimeOfDay {
  return { hours: 22, minutes: 0 };
}

export function hour24To12Period(h24: number): { h12: number; period: "am" | "pm" } {
  if (h24 === 0) {
    return { h12: 12, period: "am" };
  }
  if (h24 === 12) {
    return { h12: 12, period: "pm" };
  }
  if (h24 < 12) {
    return { h12: h24, period: "am" };
  }
  return { h12: h24 - 12, period: "pm" };
}

export function hour12PeriodTo24(h12: number, period: "am" | "pm"): number {
  if (period === "am") {
    return h12 === 12 ? 0 : h12;
  }
  return h12 === 12 ? 12 : h12 + 12;
}
