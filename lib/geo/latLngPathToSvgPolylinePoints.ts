import type { LatLng } from "@/lib/geo/latLng";

const MIN_SPAN = 1e-9;

export interface SvgPolylineLayout {
  points: string;
  viewBoxWidth: number;
  viewBoxHeight: number;
}

/**
 * Maps WGS84 points into SVG user space (Y down), with padding.
 * ViewBox width:height matches geographic lng:lat span so aspect ratio is preserved
 * when using preserveAspectRatio="xMidYMid meet".
 */
export function latLngPathToSvgPolylineLayout(
  points: LatLng[],
  maxExtent: number,
  paddingRatio: number,
): SvgPolylineLayout | null {
  if (points.length < 2) {
    return null;
  }

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  for (const p of points) {
    minLat = Math.min(minLat, p.lat);
    maxLat = Math.max(maxLat, p.lat);
    minLng = Math.min(minLng, p.lng);
    maxLng = Math.max(maxLng, p.lng);
  }

  const latSpan = Math.max(maxLat - minLat, MIN_SPAN);
  const lngSpan = Math.max(maxLng - minLng, MIN_SPAN);
  const padLat = latSpan * paddingRatio;
  const padLng = lngSpan * paddingRatio;
  minLat -= padLat;
  maxLat += padLat;
  minLng -= padLng;
  maxLng += padLng;

  const w = Math.max(maxLng - minLng, MIN_SPAN);
  const h = Math.max(maxLat - minLat, MIN_SPAN);

  let viewW: number;
  let viewH: number;
  if (w >= h) {
    viewW = maxExtent;
    viewH = (h / w) * maxExtent;
  } else {
    viewH = maxExtent;
    viewW = (w / h) * maxExtent;
  }

  const parts: string[] = [];
  for (const p of points) {
    const x = ((p.lng - minLng) / w) * viewW;
    const y = ((maxLat - p.lat) / h) * viewH;
    parts.push(`${x.toFixed(4)},${y.toFixed(4)}`);
  }

  return {
    points: parts.join(" "),
    viewBoxWidth: viewW,
    viewBoxHeight: viewH,
  };
}
