import type { EventType } from "@/lib/events/eventType";

export type MeEventsScope = "future" | "past" | "cancelled";

export interface MeEventItem {
  id: string;
  title: string;
  startDateTime: string;
  status: string;
  eventType: EventType;
  locationName: string | null;
  locationAddress: string | null;
  goingCount: number;
}

export interface MeEventsListResponse {
  items: MeEventItem[];
  page: number;
  pageSize: number;
  total: number;
}
