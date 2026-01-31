import { z } from 'zod';

// ============================================================================
// Plan Enum
// ============================================================================

export const PlanTypeSchema = z.enum(['FREE', 'PREMIUM', 'ENTERPRISE']);
export type PlanType = z.infer<typeof PlanTypeSchema>;

// ============================================================================
// Plan Benefits
// ============================================================================

export const PlanBenefitsSchema = z.object({
  maxEventsPerMonth: z.number().int().min(-1), // -1 = unlimited
  maxParticipantsPerEvent: z.number().int().min(-1), // -1 = unlimited
  canCreateRoutes: z.boolean(),
  canBroadcast: z.boolean(),
  canDuplicate: z.boolean(),
  canInvite: z.boolean(),
});

export type PlanBenefits = z.infer<typeof PlanBenefitsSchema>;

// ============================================================================
// User Profile
// ============================================================================

export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  displayName: z.string().nullable(),
  isGuest: z.boolean(),
  createdAt: z.string().datetime(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

// ============================================================================
// Profile with Benefits Response
// ============================================================================

export const ProfileWithBenefitsResponseSchema = z.object({
  user: UserProfileSchema,
  plan: PlanTypeSchema,
  benefits: PlanBenefitsSchema,
  usage: z.object({
    eventsThisMonth: z.number().int().min(0),
  }),
});

export type ProfileWithBenefitsResponse = z.infer<typeof ProfileWithBenefitsResponseSchema>;
