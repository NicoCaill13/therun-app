import type { LatLng } from "@/lib/geo/latLng";

function parseLatLngFromAttributes(attrFragment: string): LatLng | null {
  const latMatch = /\blat\s*=\s*["']([^"']+)["']/i.exec(attrFragment);
  const lonMatch = /\blon\s*=\s*["']([^"']+)["']/i.exec(attrFragment);
  if (!latMatch || !lonMatch) {
    return null;
  }
  const lat = Number.parseFloat(latMatch[1]);
  const lng = Number.parseFloat(lonMatch[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }
  return { lat, lng };
}

/**
 * Extracts ordered track / route points from GPX 1.1 XML (trkpt + rtept).
 */
export function parseGpxToPath(gpxXml: string): LatLng[] {
  const points: LatLng[] = [];
  const tagRe = /<(?:trkpt|rtept)\b([^>]*)\/?>/gi;
  let match: RegExpExecArray | null;
  while ((match = tagRe.exec(gpxXml)) !== null) {
    const p = parseLatLngFromAttributes(match[1]);
    if (p) {
      points.push(p);
    }
  }
  return points;
}
