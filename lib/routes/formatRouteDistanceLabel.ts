/**
 * Compact distance label for route cards (meters → M or KM).
 */
export function formatRouteDistanceLabel(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} M`;
  }
  return `${(meters / 1000).toFixed(1)} KM`;
}
