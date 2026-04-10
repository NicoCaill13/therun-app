import { EVENT_TYPES } from "@/lib/events/eventType";
import { z } from "zod";

export const createEventTitleSchema = z.string().trim().min(1, "Event title is required");

export const createEventTypeSchema = z.enum(EVENT_TYPES);
