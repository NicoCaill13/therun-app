import {
  buildCreateEventRequestBody,
  toStartDateTimeIso,
} from "@/lib/events/buildCreateEventPayload";

describe("buildCreateEventPayload", () => {
  it("builds ISO datetime from local calendar date and time", () => {
    const eventDate = new Date(2026, 3, 7, 12, 0, 0, 0);
    const iso = toStartDateTimeIso(eventDate, { hours: 22, minutes: 30 });
    const parsed = new Date(iso);
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(3);
    expect(parsed.getDate()).toBe(7);
    expect(parsed.getHours()).toBe(22);
    expect(parsed.getMinutes()).toBe(30);
  });

  it("omits optional fields when empty", () => {
    const body = buildCreateEventRequestBody({
      title: "  Night run  ",
      eventType: "BlaBlaRun",
      description: "   ",
      eventDate: new Date(2026, 0, 1, 12, 0, 0, 0),
      startTime: { hours: 8, minutes: 0 },
      meetingPoint: "",
    });
    expect(body.title).toBe("Night run");
    expect(body.eventType).toBe("BlaBlaRun");
    expect(body.description).toBeUndefined();
    expect(body.locationName).toBeUndefined();
    expect(typeof body.startDateTime).toBe("string");
  });

  it("includes description and locationName when set", () => {
    const body = buildCreateEventRequestBody({
      title: "A",
      eventType: "TechnicalTrail",
      description: " Briefing ",
      eventDate: new Date(2026, 5, 15, 12, 0, 0, 0),
      startTime: { hours: 6, minutes: 15 },
      meetingPoint: " Parc ",
    });
    expect(body.description).toBe("Briefing");
    expect(body.locationName).toBe("Parc");
    expect(body.eventType).toBe("TechnicalTrail");
  });
});
