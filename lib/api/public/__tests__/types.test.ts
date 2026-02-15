import { PublicEventSchema, GuestJoinInputSchema, GuestJoinResponseSchema } from '../types';

describe('PublicEventSchema', () => {
  it('should validate public event', () => {
    const result = PublicEventSchema.safeParse({
      id: 'e1',
      eventCode: 'ABC123',
      title: 'Morning Run',
      startDateTime: '2026-03-01T08:00:00.000Z',
      status: 'UPCOMING',
      locationName: 'Central Park',
      locationAddress: 'NYC',
      organiser: { firstName: 'John', lastName: 'Doe' },
      join: { eventCode: 'ABC123', eventId: 'e1' },
    });
    expect(result.success).toBe(true);
  });
});

describe('GuestJoinInputSchema', () => {
  it('should validate with firstName only', () => {
    const result = GuestJoinInputSchema.safeParse({
      firstName: 'Jane',
    });
    expect(result.success).toBe(true);
  });

  it('should validate with all fields', () => {
    const result = GuestJoinInputSchema.safeParse({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty firstName', () => {
    const result = GuestJoinInputSchema.safeParse({
      firstName: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('GuestJoinResponseSchema', () => {
  it('should validate guest join response', () => {
    const result = GuestJoinResponseSchema.safeParse({
      eventId: 'e1',
      participantId: 'p1',
      userId: 'u-guest-1',
      isGuest: true,
      accessToken: 'jwt.token.here',
    });
    expect(result.success).toBe(true);
  });
});
