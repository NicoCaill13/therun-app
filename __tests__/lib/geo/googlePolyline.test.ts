import { decodePolyline, encodePolyline } from "@/lib/geo/googlePolyline";

describe("googlePolyline", () => {
  it("round-trips a short path", () => {
    const path = [
      { lat: 48.8566, lng: 2.3522 },
      { lat: 48.8584, lng: 2.2945 },
    ];
    const encoded = encodePolyline(path);
    expect(typeof encoded).toBe("string");
    expect(encoded.length).toBeGreaterThan(0);
    const back = decodePolyline(encoded);
    expect(back).toHaveLength(path.length);
    expect(back[0].lat).toBeCloseTo(path[0].lat, 4);
    expect(back[0].lng).toBeCloseTo(path[0].lng, 4);
    expect(back[1].lat).toBeCloseTo(path[1].lat, 4);
    expect(back[1].lng).toBeCloseTo(path[1].lng, 4);
  });
});
