import { MeProfileSchema, MeEventsListSchema } from '../types';

describe('MeProfileSchema', () => {
  it('should validate a full profile', () => {
    const result = MeProfileSchema.safeParse({
      id: 'u1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      displayName: 'John Doe',
      isGuest: false,
      plan: 'FREE',
      planSince: null,
      planUntil: null,
      acceptedTermsAt: '2026-01-01T00:00:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z',
      planBenefits: {
        maxActiveEventsPerWeek: 2,
        globalRouteLibraryAccess: false,
        description: 'Free plan',
      },
    });
    expect(result.success).toBe(true);
  });
});

describe('MeEventsListSchema', () => {
  it('should validate an empty events list', () => {
    const result = MeEventsListSchema.safeParse({
      items: [],
      page: 1,
      pageSize: 20,
      total: 0,
    });
    expect(result.success).toBe(true);
  });

  it('should validate events list with items', () => {
    const result = MeEventsListSchema.safeParse({
      items: [
        {
          id: 'e1',
          title: 'Morning Run',
          startDateTime: '2026-03-01T08:00:00.000Z',
          status: 'UPCOMING',
          locationName: 'Park',
          locationAddress: null,
          goingCount: 5,
        },
      ],
      page: 1,
      pageSize: 20,
      total: 1,
    });
    expect(result.success).toBe(true);
  });
});
