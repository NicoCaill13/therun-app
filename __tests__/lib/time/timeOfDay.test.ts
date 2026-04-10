import {
  createDefaultStartTime,
  formatTimeOfDay,
  hour12PeriodTo24,
  hour24To12Period,
  parseTimeOfDay,
} from "@/lib/time/timeOfDay";

describe("timeOfDay", () => {
  it("formats with leading zeros", () => {
    expect(formatTimeOfDay({ hours: 9, minutes: 5 })).toBe("09:05");
    expect(formatTimeOfDay({ hours: 22, minutes: 0 })).toBe("22:00");
  });

  it("parses valid 24h strings", () => {
    expect(parseTimeOfDay("22:00")).toEqual({ hours: 22, minutes: 0 });
    expect(parseTimeOfDay("07:30")).toEqual({ hours: 7, minutes: 30 });
  });

  it("rejects invalid strings", () => {
    expect(parseTimeOfDay("25:00")).toBeNull();
    expect(parseTimeOfDay("12:60")).toBeNull();
  });

  it("converts 24h to 12h + period", () => {
    expect(hour24To12Period(0)).toEqual({ h12: 12, period: "am" });
    expect(hour24To12Period(12)).toEqual({ h12: 12, period: "pm" });
    expect(hour24To12Period(22)).toEqual({ h12: 10, period: "pm" });
    expect(hour24To12Period(10)).toEqual({ h12: 10, period: "am" });
  });

  it("converts 12h + period to 24h", () => {
    expect(hour12PeriodTo24(12, "am")).toBe(0);
    expect(hour12PeriodTo24(12, "pm")).toBe(12);
    expect(hour12PeriodTo24(10, "pm")).toBe(22);
    expect(hour12PeriodTo24(3, "am")).toBe(3);
  });

  it("default start time matches prior placeholder", () => {
    expect(createDefaultStartTime()).toEqual({ hours: 22, minutes: 0 });
  });
});
