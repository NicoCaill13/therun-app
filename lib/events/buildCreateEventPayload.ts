import type { CreateEventRequestBody } from "@/lib/api/eventTypes";
import type { EventType } from "@/lib/events/eventType";
import type { TimeOfDay } from "@/lib/time/timeOfDay";

export function toStartDateTimeIso(eventDate: Date, time: TimeOfDay): string {
  const y = eventDate.getFullYear();
  const m = eventDate.getMonth();
  const d = eventDate.getDate();
  return new Date(y, m, d, time.hours, time.minutes, 0, 0).toISOString();
}

export function buildCreateEventRequestBody(input: {
  title: string;
  eventType: EventType;
  description: string;
  eventDate: Date;
  startTime: TimeOfDay;
  meetingPoint: string;
}): CreateEventRequestBody {
  const description = input.description.trim();
  const locationName = input.meetingPoint.trim();
  const body: CreateEventRequestBody = {
    title: input.title.trim(),
    eventType: input.eventType,
    startDateTime: toStartDateTimeIso(input.eventDate, input.startTime),
  };
  if (description.length > 0) {
    body.description = description;
  }
  if (locationName.length > 0) {
    body.locationName = locationName;
  }
  return body;
}
