import { z } from 'zod';

// ============================================================================
// Route Type Enum
// ============================================================================

export const RouteTypeSchema = z.enum(['LOOP', 'OUT_AND_BACK', 'POINT_TO_POINT']);
export type RouteType = z.infer<typeof RouteTypeSchema>;

// ============================================================================
// Route (library route)
// ============================================================================

export const RouteSchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string().uuid(),
  name: z.string(),
  encodedPolyline: z.string(),
  distanceMeters: z.number().int().min(1),
  centerLat: z.number(),
  centerLng: z.number(),
  radiusMeters: z.number().min(0),
  type: RouteTypeSchema.nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Route = z.infer<typeof RouteSchema>;

// ============================================================================
// Route List Response (paginated)
// ============================================================================

export const RouteListResponseSchema = z.object({
  items: z.array(RouteSchema),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  totalCount: z.number().int().min(0),
  totalPages: z.number().int().min(0),
});

export type RouteListResponse = z.infer<typeof RouteListResponseSchema>;

// ============================================================================
// Route Suggestion Item
// ============================================================================

export const RouteSuggestionItemSchema = z.object({
  routeId: z.string().uuid(),
  name: z.string(),
  distanceMeters: z.number().int().min(1),
  type: RouteTypeSchema.nullable(),
  centerLat: z.number(),
  centerLng: z.number(),
  radiusMeters: z.number().min(0),
  encodedPolyline: z.string(),
  distanceFromStartMeters: z.number().min(0),
});

export type RouteSuggestionItem = z.infer<typeof RouteSuggestionItemSchema>;

// ============================================================================
// Suggest Routes Response
// ============================================================================

export const SuggestRoutesResponseSchema = z.object({
  items: z.array(RouteSuggestionItemSchema),
});

export type SuggestRoutesResponse = z.infer<typeof SuggestRoutesResponseSchema>;

// ============================================================================
// Create Route Input
// ============================================================================

export const CreateRouteInputSchema = z.object({
  name: z.string().optional(),
  encodedPolyline: z.string().min(1, 'Le tracé est requis'),
  type: RouteTypeSchema.optional(),
});

export type CreateRouteInput = z.infer<typeof CreateRouteInputSchema>;

// ============================================================================
// Create Event Route Input
// ============================================================================

export const CreateEventRouteInputSchema = z.object({
  routeId: z.string().uuid().optional(),
  name: z.string().optional(),
  encodedPolyline: z.string().optional(),
  type: RouteTypeSchema.optional(),
});

export type CreateEventRouteInput = z.infer<typeof CreateEventRouteInputSchema>;

// ============================================================================
// Event Route (attached to an event)
// ============================================================================

export const EventRouteSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  routeId: z.string().uuid().nullable(),
  name: z.string(),
  distanceMeters: z.number().int().min(0),
  type: RouteTypeSchema.nullable(),
  encodedPolyline: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type EventRoute = z.infer<typeof EventRouteSchema>;

// ============================================================================
// Query Params
// ============================================================================

export interface ListRoutesQueryParams {
  createdBy?: 'me';
  lat?: number;
  lng?: number;
  radiusMeters?: number;
  distanceMin?: number;
  distanceMax?: number;
  page?: number;
  pageSize?: number;
}

export interface SuggestRoutesQueryParams {
  lat: number;
  lng: number;
  radiusMeters?: number;
}

// ============================================================================
// Event Routes List Response
// ============================================================================

export const EventRoutesListSchema = z.array(EventRouteSchema);

export type EventRoutesList = z.infer<typeof EventRoutesListSchema>;

// ============================================================================
// Decoded Coordinate (for polyline parsing)
// ============================================================================

export interface Coordinate {
  latitude: number;
  longitude: number;
}

// ============================================================================
// Polyline Decoder Utility
// ============================================================================

/**
 * Decodes a Google-encoded polyline string into an array of coordinates.
 * @see https://developers.google.com/maps/documentation/utilities/polylinealgorithm
 */
export function decodePolyline(encoded: string): Coordinate[] {
  const coordinates: Coordinate[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;

    // Decode latitude
    let byte: number;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    // Decode longitude
    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    coordinates.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return coordinates;
}

// ============================================================================
// Route Bounds Calculator
// ============================================================================

export interface RouteBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
  centerLat: number;
  centerLng: number;
}

/**
 * Calculate the bounding box of a route.
 */
export function calculateBounds(coordinates: Coordinate[]): RouteBounds | null {
  if (coordinates.length === 0) return null;

  let minLat = coordinates[0].latitude;
  let maxLat = coordinates[0].latitude;
  let minLng = coordinates[0].longitude;
  let maxLng = coordinates[0].longitude;

  for (const coord of coordinates) {
    minLat = Math.min(minLat, coord.latitude);
    maxLat = Math.max(maxLat, coord.latitude);
    minLng = Math.min(minLng, coord.longitude);
    maxLng = Math.max(maxLng, coord.longitude);
  }

  return {
    minLat,
    maxLat,
    minLng,
    maxLng,
    centerLat: (minLat + maxLat) / 2,
    centerLng: (minLng + maxLng) / 2,
  };
}
