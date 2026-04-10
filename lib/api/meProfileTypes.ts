export type UserPlan = "FREE" | "PREMIUM";

export interface PlanBenefits {
  maxActiveEventsPerWeek: number;
  globalRouteLibraryAccess: boolean;
  description: string;
}

export interface MeProfileResponse {
  id: string;
  email: string | null;
  firstName: string;
  lastName: string | null;
  displayName: string;
  isGuest: boolean;
  plan: UserPlan;
  planSince: string | null;
  planUntil: string | null;
  acceptedTermsAt: string | null;
  createdAt: string;
  planBenefits: PlanBenefits;
}
