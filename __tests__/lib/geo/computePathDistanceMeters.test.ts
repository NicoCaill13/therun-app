import { computePathDistanceMeters } from "@/lib/geo/computePathDistanceMeters";

describe("computePathDistanceMeters", () => {
  it("returns 0 for fewer than 2 points", () => {
    expect(computePathDistanceMeters([])).toBe(0);
    expect(computePathDistanceMeters([{ lat: 0, lng: 0 }])).toBe(0);
  });

  it("returns a positive distance for two distinct points", () => {
    const d = computePathDistanceMeters([
      { lat: 48.8566, lng: 2.3522 },
      { lat: 48.8584, lng: 2.2945 },
    ]);
    expect(d).toBeGreaterThan(1000);
    expect(d).toBeLessThan(100_000);
  });
});
