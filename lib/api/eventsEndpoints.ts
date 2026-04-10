import { apiPostJsonAuth } from "@/lib/api/authClient";
import type { CreateEventRequestBody, CreatedEventResponse } from "@/lib/api/eventTypes";

export async function postCreateEvent(
  body: CreateEventRequestBody,
  accessToken: string,
): Promise<CreatedEventResponse> {
  return apiPostJsonAuth<CreatedEventResponse, CreateEventRequestBody>("/api/events", body, accessToken);
}
