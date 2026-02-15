import { CreateEventInputSchema, EventDetailsSchema, BroadcastInputSchema } from '../types';

describe('CreateEventInputSchema', () => {
  it('should validate correct event input', () => {
    const result = CreateEventInputSchema.safeParse({
      title: 'Morning Run',
      startDateTime: '2026-03-01T08:00:00.000Z',
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty title', () => {
    const result = CreateEventInputSchema.safeParse({
      title: '',
      startDateTime: '2026-03-01T08:00:00.000Z',
    });
    expect(result.success).toBe(false);
  });

  it('should allow optional fields', () => {
    const result = CreateEventInputSchema.safeParse({
      title: 'Morning Run',
      startDateTime: '2026-03-01T08:00:00.000Z',
      description: 'A nice run',
      locationName: 'Central Park',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe('A nice run');
    }
  });
});

describe('EventDetailsSchema', () => {
  const validEventDetails = {
    event: {
      id: '1',
      title: 'Test Run',
      description: null,
      startDateTime: '2026-03-01T08:00:00.000Z',
      locationName: null,
      locationAddress: null,
      locationLat: null,
      locationLng: null,
      status: 'UPCOMING',
      eventCode: 'ABC123',
      completedAt: null,
      goingCountAtCompletion: null,
    },
    organiser: { id: 'u1', displayName: 'John Doe' },
    participants: [],
    currentUserParticipation: null,
  };

  it('should validate a complete event details response', () => {
    const result = EventDetailsSchema.safeParse(validEventDetails);
    expect(result.success).toBe(true);
  });

  it('should validate with participants', () => {
    const result = EventDetailsSchema.safeParse({
      ...validEventDetails,
      participants: [
        {
          userId: 'u2',
          displayName: 'Jane',
          eventRouteId: null,
          eventGroupId: null,
          roleInEvent: 'PARTICIPANT',
          status: 'GOING',
        },
      ],
    });
    expect(result.success).toBe(true);
  });
});

describe('BroadcastInputSchema', () => {
  it('should validate broadcast with body', () => {
    const result = BroadcastInputSchema.safeParse({ body: 'We start in 10 min!' });
    expect(result.success).toBe(true);
  });

  it('should reject empty body', () => {
    const result = BroadcastInputSchema.safeParse({ body: '' });
    expect(result.success).toBe(false);
  });
});
