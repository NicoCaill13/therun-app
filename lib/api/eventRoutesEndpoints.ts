import { apiPostJsonAuth } from "@/lib/api/authClient";
import type {
  CreateEventRouteRequestBody,
  EventRouteResponse,
} from "@/lib/api/eventRouteTypes";

export async function postAddEventRoute(
  eventId: string,
  body: CreateEventRouteRequestBody,
  accessToken: string,
): Promise<EventRouteResponse> {
  const path = `/api/events/${encodeURIComponent(eventId)}/routes`;
  return apiPostJsonAuth<EventRouteResponse, CreateEventRouteRequestBody>(
    path,
    body,
    accessToken,
  );
}
