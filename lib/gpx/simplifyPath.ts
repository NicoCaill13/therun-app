import type { LatLng } from "@/lib/geo/latLng";

function dedupeConsecutive(points: LatLng[]): LatLng[] {
  if (points.length === 0) {
    return [];
  }
  const out: LatLng[] = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const prev = out[out.length - 1];
    const cur = points[i];
    if (cur.lat !== prev.lat || cur.lng !== prev.lng) {
      out.push(cur);
    }
  }
  return out;
}

/**
 * Uniformly samples the track when it exceeds `maxPoints` (MVP simplification).
 */
export function simplifyPath(points: LatLng[], maxPoints: number): LatLng[] {
  const deduped = dedupeConsecutive(points);
  if (deduped.length <= maxPoints) {
    return deduped;
  }
  const out: LatLng[] = [];
  const last = deduped.length - 1;
  for (let i = 0; i < maxPoints; i++) {
    const t = i / (maxPoints - 1);
    const idx = Math.round(t * last);
    out.push(deduped[idx]);
  }
  return dedupeConsecutive(out);
}
