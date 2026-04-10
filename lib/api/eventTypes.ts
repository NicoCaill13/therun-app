import type { EventType } from "@/lib/events/eventType";

export type { EventType };

export interface CreateEventRequestBody {
  title: string;
  eventType: EventType;
  description?: string;
  startDateTime: string;
  locationName?: string;
  locationAddress?: string;
  locationLat?: number;
  locationLng?: number;
}

export interface CreatedEventResponse {
  id: string;
  title: string;
  eventType: EventType;
  description: string | null;
  startDateTime: string;
  status: string;
  organiserId: string;
  locationName: string | null;
  locationAddress: string | null;
  locationLat: number | null;
  locationLng: number | null;
  eventCode: string;
  createdAt: string;
  updatedAt: string;
}
