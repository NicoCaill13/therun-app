import { assertPickedFileIsGpx } from "@/lib/gpx/gpxDocumentPickerConfig";

describe("assertPickedFileIsGpx", () => {
  it("allows .gpx extension (any case)", () => {
    expect(() => assertPickedFileIsGpx("  Loop.GPX  ")).not.toThrow();
  });

  it("allows application/gpx+xml when name has no extension", () => {
    expect(() =>
      assertPickedFileIsGpx("route", "application/gpx+xml"),
    ).not.toThrow();
  });

  it("rejects non-gpx without gpx mime", () => {
    expect(() => assertPickedFileIsGpx("track.kml")).toThrow(
      "Please choose a GPX file (.gpx).",
    );
  });

  it("rejects ambiguous mime", () => {
    expect(() =>
      assertPickedFileIsGpx("data", "application/octet-stream"),
    ).toThrow("Please choose a GPX file (.gpx).");
  });
});
