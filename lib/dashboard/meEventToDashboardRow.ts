import type { EventParticipationStatus } from "@/components/ui/EventCard";
import type { MeEventItem } from "@/lib/api/meEventsTypes";
import type { EventKind } from "@/lib/constants/eventKinds";
import type { EventType } from "@/lib/events/eventType";

export interface DashboardEventRow {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  status: EventParticipationStatus;
  eventKind: EventKind;
}

function formatEventListDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatEventListTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function mapEventTypeToKind(eventType: EventType): EventKind {
  switch (eventType) {
    case "BlaBlaRun":
      return "social_run";
    case "BlaBlaTrail":
      return "social_trail";
    case "TechnicalRun":
      return "technical_run";
    case "TechnicalTrail":
      return "technical_trail";
    default: {
      const _exhaustive: never = eventType;
      return _exhaustive;
    }
  }
}

/**
 * Maps API payload to dashboard `EventCard` props. Backend `me/events` lists runs the user organises.
 */
export function meEventToDashboardRow(
  item: MeEventItem,
  options: { organizerLabel: string },
): DashboardEventRow {
  const location =
    item.locationName?.trim() ||
    item.locationAddress?.trim() ||
    "—";

  return {
    id: item.id,
    title: item.title,
    date: formatEventListDate(item.startDateTime),
    time: formatEventListTime(item.startDateTime),
    location,
    organizer: options.organizerLabel,
    status: "PLANNED",
    eventKind: mapEventTypeToKind(item.eventType),
  };
}
