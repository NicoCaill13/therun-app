import { parseGpxToPath } from "@/lib/gpx/parseGpxToPath";

const SAMPLE_GPX = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="test">
  <trk><name>T</name><trkseg>
    <trkpt lat="48.0" lon="2.0"><ele>10</ele></trkpt>
    <trkpt lat="48.001" lon="2.001"></trkpt>
  </trkseg></trk>
</gpx>`;

describe("parseGpxToPath", () => {
  it("extracts trkpt coordinates in order", () => {
    const pts = parseGpxToPath(SAMPLE_GPX);
    expect(pts).toHaveLength(2);
    expect(pts[0]).toEqual({ lat: 48, lng: 2 });
    expect(pts[1].lat).toBeCloseTo(48.001, 6);
    expect(pts[1].lng).toBeCloseTo(2.001, 6);
  });

  it("parses rtept segments", () => {
    const xml = `<gpx><rte>
      <rtept lat="1" lon="2"></rtept>
      <rtept lat="3" lon="4"></rtept>
    </rte></gpx>`;
    expect(parseGpxToPath(xml)).toEqual([
      { lat: 1, lng: 2 },
      { lat: 3, lng: 4 },
    ]);
  });

  it("returns empty array when no points", () => {
    expect(parseGpxToPath("<gpx></gpx>")).toEqual([]);
  });
});
