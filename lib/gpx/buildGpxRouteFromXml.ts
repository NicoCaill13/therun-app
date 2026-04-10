import { computePathDistanceMeters } from "@/lib/geo/computePathDistanceMeters";
import { encodePolyline } from "@/lib/geo/googlePolyline";
import {
  MAX_TRACK_POINTS,
  MIN_TRACK_POINTS,
} from "@/lib/gpx/gpxConstants";
import { parseGpxToPath } from "@/lib/gpx/parseGpxToPath";
import type { GpxRouteDraft } from "@/lib/gpx/gpxRouteDraft";
import { simplifyPath } from "@/lib/gpx/simplifyPath";

function stripGpxExtension(fileName: string): string {
  return fileName.replace(/\.gpx$/i, "").trim() || "Imported route";
}

export class GpxParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GpxParseError";
  }
}

export function buildGpxRouteFromXml(
  gpxXml: string,
  fileName: string,
): GpxRouteDraft {
  const raw = parseGpxToPath(gpxXml);
  if (raw.length < MIN_TRACK_POINTS) {
    throw new GpxParseError(
      "No track found. Use a GPX file with at least two track or route points.",
    );
  }
  const simplified = simplifyPath(raw, MAX_TRACK_POINTS);
  if (simplified.length < MIN_TRACK_POINTS) {
    throw new GpxParseError("Track is too short after processing.");
  }
  const encodedPolyline = encodePolyline(simplified);
  const distanceMeters = computePathDistanceMeters(simplified);
  const displayName = stripGpxExtension(fileName);

  return {
    fileName,
    displayName,
    encodedPolyline,
    distanceMeters,
    pointCount: simplified.length,
  };
}
