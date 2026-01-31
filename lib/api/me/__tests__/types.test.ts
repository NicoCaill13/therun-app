import {
  PlanTypeSchema,
  PlanBenefitsSchema,
  UserProfileSchema,
  ProfileWithBenefitsResponseSchema,
} from '../types';

describe('PlanTypeSchema', () => {
  it.each(['FREE', 'PREMIUM', 'ENTERPRISE'])('should accept valid plan: %s', (plan) => {
    const result = PlanTypeSchema.safeParse(plan);
    expect(result.success).toBe(true);
  });

  it('should reject invalid plan', () => {
    const result = PlanTypeSchema.safeParse('BASIC');
    expect(result.success).toBe(false);
  });
});

describe('PlanBenefitsSchema', () => {
  const validBenefits = {
    maxEventsPerMonth: 5,
    maxParticipantsPerEvent: 50,
    canCreateRoutes: true,
    canBroadcast: false,
    canDuplicate: false,
    canInvite: true,
  };

  it('should accept valid benefits', () => {
    const result = PlanBenefitsSchema.safeParse(validBenefits);
    expect(result.success).toBe(true);
  });

  it('should accept unlimited (-1) values', () => {
    const benefits = {
      ...validBenefits,
      maxEventsPerMonth: -1,
      maxParticipantsPerEvent: -1,
    };
    const result = PlanBenefitsSchema.safeParse(benefits);
    expect(result.success).toBe(true);
  });

  it('should accept zero values', () => {
    const benefits = {
      ...validBenefits,
      maxEventsPerMonth: 0,
      maxParticipantsPerEvent: 0,
    };
    const result = PlanBenefitsSchema.safeParse(benefits);
    expect(result.success).toBe(true);
  });

  it('should reject missing required fields', () => {
    const benefits = { maxEventsPerMonth: 5 };
    const result = PlanBenefitsSchema.safeParse(benefits);
    expect(result.success).toBe(false);
  });
});

describe('UserProfileSchema', () => {
  const validProfile = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    displayName: 'John Doe',
    isGuest: false,
    createdAt: '2025-01-01T00:00:00.000Z',
  };

  it('should accept valid profile', () => {
    const result = UserProfileSchema.safeParse(validProfile);
    expect(result.success).toBe(true);
  });

  it('should accept profile with null email', () => {
    const profile = { ...validProfile, email: null };
    const result = UserProfileSchema.safeParse(profile);
    expect(result.success).toBe(true);
  });

  it('should accept profile with null names', () => {
    const profile = {
      ...validProfile,
      firstName: null,
      lastName: null,
      displayName: null,
    };
    const result = UserProfileSchema.safeParse(profile);
    expect(result.success).toBe(true);
  });

  it('should accept guest profile', () => {
    const profile = {
      ...validProfile,
      isGuest: true,
      email: null,
    };
    const result = UserProfileSchema.safeParse(profile);
    expect(result.success).toBe(true);
  });

  it('should reject invalid id', () => {
    const profile = { ...validProfile, id: 'not-uuid' };
    const result = UserProfileSchema.safeParse(profile);
    expect(result.success).toBe(false);
  });

  it('should reject invalid email format', () => {
    const profile = { ...validProfile, email: 'not-an-email' };
    const result = UserProfileSchema.safeParse(profile);
    expect(result.success).toBe(false);
  });

  it('should reject invalid createdAt', () => {
    const profile = { ...validProfile, createdAt: 'not-a-date' };
    const result = UserProfileSchema.safeParse(profile);
    expect(result.success).toBe(false);
  });
});

describe('ProfileWithBenefitsResponseSchema', () => {
  const validResponse = {
    user: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      displayName: 'John Doe',
      isGuest: false,
      createdAt: '2025-01-01T00:00:00.000Z',
    },
    plan: 'FREE',
    benefits: {
      maxEventsPerMonth: 5,
      maxParticipantsPerEvent: 50,
      canCreateRoutes: false,
      canBroadcast: false,
      canDuplicate: false,
      canInvite: false,
    },
    usage: {
      eventsThisMonth: 2,
    },
  };

  it('should accept valid response', () => {
    const result = ProfileWithBenefitsResponseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
  });

  it('should accept PREMIUM plan', () => {
    const response = { ...validResponse, plan: 'PREMIUM' };
    const result = ProfileWithBenefitsResponseSchema.safeParse(response);
    expect(result.success).toBe(true);
  });

  it('should accept ENTERPRISE plan', () => {
    const response = { ...validResponse, plan: 'ENTERPRISE' };
    const result = ProfileWithBenefitsResponseSchema.safeParse(response);
    expect(result.success).toBe(true);
  });

  it('should accept zero usage', () => {
    const response = {
      ...validResponse,
      usage: { eventsThisMonth: 0 },
    };
    const result = ProfileWithBenefitsResponseSchema.safeParse(response);
    expect(result.success).toBe(true);
  });

  it('should reject invalid plan', () => {
    const response = { ...validResponse, plan: 'BASIC' };
    const result = ProfileWithBenefitsResponseSchema.safeParse(response);
    expect(result.success).toBe(false);
  });

  it('should reject negative usage', () => {
    const response = {
      ...validResponse,
      usage: { eventsThisMonth: -1 },
    };
    const result = ProfileWithBenefitsResponseSchema.safeParse(response);
    expect(result.success).toBe(false);
  });
});
