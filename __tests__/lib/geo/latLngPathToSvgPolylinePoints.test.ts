import { latLngPathToSvgPolylineLayout } from "@/lib/geo/latLngPathToSvgPolylinePoints";

describe("latLngPathToSvgPolylineLayout", () => {
  it("returns null for fewer than two points", () => {
    expect(latLngPathToSvgPolylineLayout([], 100, 0.08)).toBeNull();
    expect(
      latLngPathToSvgPolylineLayout([{ lat: 1, lng: 1 }], 100, 0.08),
    ).toBeNull();
  });

  it("returns two coordinate pairs and viewBox for a short path", () => {
    const layout = latLngPathToSvgPolylineLayout(
      [
        { lat: 48.85, lng: 2.29 },
        { lat: 48.86, lng: 2.3 },
      ],
      100,
      0.08,
    );
    expect(layout).not.toBeNull();
    const pairs = layout!.points.split(" ");
    expect(pairs.length).toBe(2);
    for (const pair of pairs) {
      expect(pair).toMatch(/^\d+\.\d+,\d+\.\d+$/);
    }
    expect(layout!.viewBoxWidth).toBeGreaterThan(0);
    expect(layout!.viewBoxHeight).toBeGreaterThan(0);
    expect(layout!.viewBoxWidth).toBe(100);
    expect(layout!.viewBoxHeight).toBeLessThanOrEqual(100);
  });

  it("uses width as max extent when route is wider than tall (lng span > lat span)", () => {
    const layout = latLngPathToSvgPolylineLayout(
      [
        { lat: 0, lng: 0 },
        { lat: 0.001, lng: 0.1 },
      ],
      100,
      0,
    );
    expect(layout).not.toBeNull();
    expect(layout!.viewBoxWidth).toBe(100);
    expect(layout!.viewBoxHeight).toBeLessThan(100);
    expect(layout!.viewBoxHeight / layout!.viewBoxWidth).toBeCloseTo(0.01, 5);
  });

  it("uses height as max extent when route is taller than wide", () => {
    const layout = latLngPathToSvgPolylineLayout(
      [
        { lat: 0, lng: 0 },
        { lat: 0.1, lng: 0.001 },
      ],
      100,
      0,
    );
    expect(layout).not.toBeNull();
    expect(layout!.viewBoxHeight).toBe(100);
    expect(layout!.viewBoxWidth).toBeLessThan(100);
    expect(layout!.viewBoxWidth / layout!.viewBoxHeight).toBeCloseTo(0.01, 5);
  });
});
