import { z } from 'zod';

// ============================================================================
// GET /api/me - Profile with plan benefits
// ============================================================================

export const PlanBenefitsSchema = z.object({
  maxActiveEventsPerWeek: z.number(),
  globalRouteLibraryAccess: z.boolean(),
  description: z.string(),
});

export const MeProfileSchema = z.object({
  id: z.string(),
  email: z.string().nullable(),
  firstName: z.string(),
  lastName: z.string().nullable(),
  displayName: z.string(),
  isGuest: z.boolean(),
  plan: z.string(),
  planSince: z.string().nullable(),
  planUntil: z.string().nullable(),
  acceptedTermsAt: z.string().nullable(),
  createdAt: z.string(),
  planBenefits: PlanBenefitsSchema,
});

export type MeProfile = z.infer<typeof MeProfileSchema>;

// ============================================================================
// GET /api/me/events - My events list
// ============================================================================

export const MeEventItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  startDateTime: z.string(),
  status: z.string(),
  locationName: z.string().nullable(),
  locationAddress: z.string().nullable(),
  goingCount: z.number(),
});

export const MeEventsListSchema = z.object({
  items: z.array(MeEventItemSchema),
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
});

export type MeEventItem = z.infer<typeof MeEventItemSchema>;
export type MeEventsList = z.infer<typeof MeEventsListSchema>;

export type MeEventsScope = 'future' | 'past' | 'cancelled';
