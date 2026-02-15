import { JoinEventSummarySchema, JoinParticipateResponseSchema } from '../types';

describe('JoinEventSummarySchema', () => {
  it('should validate correct summary', () => {
    const result = JoinEventSummarySchema.safeParse({
      eventId: 'e1',
      title: 'Morning Run',
      startDateTime: '2026-03-01T08:00:00.000Z',
      locationName: 'Park',
      locationLat: 48.8,
      locationLng: 2.3,
      organiserId: 'u1',
      organiserFirstName: 'John',
      organiserLastName: 'Doe',
    });
    expect(result.success).toBe(true);
  });

  it('should allow null locationName', () => {
    const result = JoinEventSummarySchema.safeParse({
      eventId: 'e1',
      title: 'Morning Run',
      startDateTime: '2026-03-01T08:00:00.000Z',
      locationName: null,
      locationLat: null,
      locationLng: null,
      organiserId: 'u1',
      organiserFirstName: 'John',
      organiserLastName: null,
    });
    expect(result.success).toBe(true);
  });
});

describe('JoinParticipateResponseSchema', () => {
  it('should validate participation response', () => {
    const result = JoinParticipateResponseSchema.safeParse({
      participantId: 'p1',
      eventId: 'e1',
      userId: 'u1',
      role: 'PARTICIPANT',
      status: 'GOING',
    });
    expect(result.success).toBe(true);
  });
});
