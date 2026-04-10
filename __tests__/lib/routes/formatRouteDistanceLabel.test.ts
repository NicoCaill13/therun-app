import { formatRouteDistanceLabel } from "@/lib/routes/formatRouteDistanceLabel";

describe("formatRouteDistanceLabel", () => {
  it("formats meters below 1km", () => {
    expect(formatRouteDistanceLabel(800)).toBe("800 M");
  });

  it("formats kilometers with one decimal", () => {
    expect(formatRouteDistanceLabel(8400)).toBe("8.4 KM");
  });
});
