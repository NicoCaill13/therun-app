import type { LatLng } from "@/lib/geo/latLng";

function toRad(value: number): number {
  return (value * Math.PI) / 180;
}

/**
 * Haversine sum along the path (same model as backend polyline.util).
 */
export function computePathDistanceMeters(points: LatLng[]): number {
  if (points.length < 2) {
    return 0;
  }

  const earthRadiusM = 6371000;
  let distance = 0;

  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const sinDLat = Math.sin(dLat / 2);
    const sinDLng = Math.sin(dLng / 2);
    const h =
      sinDLat * sinDLat +
      Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
    const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
    distance += earthRadiusM * c;
  }

  return Math.round(distance);
}
