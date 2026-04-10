import { meEventToDashboardRow } from "@/lib/dashboard/meEventToDashboardRow";

describe("meEventToDashboardRow", () => {
  it("maps API fields to dashboard row with organiser label", () => {
    const row = meEventToDashboardRow(
      {
        id: "e1",
        title: "Night run",
        startDateTime: "2026-10-26T18:30:00.000Z",
        status: "PLANNED",
        eventType: "TechnicalRun",
        locationName: "Plaza",
        locationAddress: null,
        goingCount: 3,
      },
      { organizerLabel: "Jamie" },
    );
    expect(row.id).toBe("e1");
    expect(row.title).toBe("Night run");
    expect(row.organizer).toBe("Jamie");
    expect(row.status).toBe("PLANNED");
    expect(row.eventKind).toBe("technical_run");
    expect(row.location).toBe("Plaza");
    expect(row.date.length).toBeGreaterThan(3);
    expect(row.time).toMatch(/\d{2}:\d{2}/);
  });

  it("falls back to address when location name is empty", () => {
    const row = meEventToDashboardRow(
      {
        id: "e2",
        title: "Trail",
        startDateTime: "2026-11-03T06:15:00.000Z",
        status: "PLANNED",
        eventType: "BlaBlaTrail",
        locationName: null,
        locationAddress: "Trail head",
        goingCount: 0,
      },
      { organizerLabel: "You" },
    );
    expect(row.location).toBe("Trail head");
    expect(row.eventKind).toBe("social_trail");
  });
});
