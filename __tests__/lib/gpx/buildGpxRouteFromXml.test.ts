import {
  buildGpxRouteFromXml,
  GpxParseError,
} from "@/lib/gpx/buildGpxRouteFromXml";

const VALID_GPX = `<?xml version="1.0"?>
<gpx><trk><trkseg>
<trkpt lat="48.0" lon="2.0"></trkpt>
<trkpt lat="48.01" lon="2.01"></trkpt>
</trkseg></trk></gpx>`;

describe("buildGpxRouteFromXml", () => {
  it("builds draft with polyline and distance", () => {
    const draft = buildGpxRouteFromXml(VALID_GPX, "Morning.gpx");
    expect(draft.fileName).toBe("Morning.gpx");
    expect(draft.displayName).toBe("Morning");
    expect(draft.encodedPolyline.length).toBeGreaterThan(0);
    expect(draft.distanceMeters).toBeGreaterThan(0);
    expect(draft.pointCount).toBeGreaterThanOrEqual(2);
  });

  it("throws when no track points", () => {
    expect(() => buildGpxRouteFromXml("<gpx></gpx>", "empty.gpx")).toThrow(
      GpxParseError,
    );
  });
});
