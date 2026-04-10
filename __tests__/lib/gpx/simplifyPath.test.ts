import { simplifyPath } from "@/lib/gpx/simplifyPath";

describe("simplifyPath", () => {
  it("removes consecutive duplicates", () => {
    const p = [
      { lat: 1, lng: 1 },
      { lat: 1, lng: 1 },
      { lat: 2, lng: 2 },
    ];
    expect(simplifyPath(p, 100)).toEqual([
      { lat: 1, lng: 1 },
      { lat: 2, lng: 2 },
    ]);
  });

  it("downsamples when above maxPoints", () => {
    const many = Array.from({ length: 100 }, (_, i) => ({
      lat: i * 0.001,
      lng: i * 0.001,
    }));
    const out = simplifyPath(many, 10);
    expect(out.length).toBeLessThanOrEqual(10);
    expect(out.length).toBeGreaterThanOrEqual(2);
  });
});
