export type EventRouteModeApi = "NEW" | "ATTACH" | "COPY";

export interface CreateEventRouteRequestBody {
  mode: EventRouteModeApi;
  encodedPolyline?: string;
  name?: string;
  routeId?: string;
}

export interface EventRouteResponse {
  id: string;
  eventId: string;
  routeId: string | null;
  name: string;
  distanceMeters: number;
  type: string | null;
  encodedPolyline: string;
  createdAt: string;
  updatedAt: string;
}
