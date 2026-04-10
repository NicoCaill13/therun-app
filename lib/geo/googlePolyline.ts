import type { LatLng } from "@/lib/geo/latLng";

/**
 * Encodes a path as a Google-encoded polyline (precision 5).
 */
export function encodePolyline(points: LatLng[]): string {
  let encoded = "";
  let prevLat = 0;
  let prevLng = 0;

  for (const point of points) {
    const lat = Math.round(point.lat * 1e5);
    const lng = Math.round(point.lng * 1e5);
    const dLat = lat - prevLat;
    const dLng = lng - prevLng;
    prevLat = lat;
    prevLng = lng;
    encoded += encodeSignedNumber(dLat);
    encoded += encodeSignedNumber(dLng);
  }

  return encoded;
}

function encodeSignedNumber(num: number): string {
  let sgnNum = num << 1;
  if (num < 0) {
    sgnNum = ~sgnNum;
  }
  let chunk = "";
  while (sgnNum >= 0x20) {
    chunk += String.fromCharCode((0x20 | (sgnNum & 0x1f)) + 63);
    sgnNum >>= 5;
  }
  chunk += String.fromCharCode(sgnNum + 63);
  return chunk;
}

/** Decodes for tests / sanity checks (mirrors backend algorithm). */
export function decodePolyline(encoded: string): LatLng[] {
  let index = 0;
  const len = encoded.length;
  const path: LatLng[] = [];
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let result = 0;
    let shift = 0;
    let b: number;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    result = 0;
    shift = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    path.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return path;
}
