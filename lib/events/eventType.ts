export const EVENT_TYPES = [
  "BlaBlaRun",
  "BlaBlaTrail",
  "TechnicalRun",
  "TechnicalTrail",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export const DEFAULT_EVENT_TYPE: EventType = "BlaBlaRun";

export interface EventTypeOption {
  value: EventType;
  label: string;
  subtitle: string;
}

export const EVENT_TYPE_OPTIONS: readonly EventTypeOption[] = [
  {
    value: "BlaBlaRun",
    label: "BLABLA RUN",
    subtitle: "Social pace — road",
  },
  {
    value: "BlaBlaTrail",
    label: "BLABLA TRAIL",
    subtitle: "Social pace — trail",
  },
  {
    value: "TechnicalRun",
    label: "TECH RUN",
    subtitle: "Structured — road",
  },
  {
    value: "TechnicalTrail",
    label: "TECH TRAIL",
    subtitle: "Structured — trail",
  },
] as const;
