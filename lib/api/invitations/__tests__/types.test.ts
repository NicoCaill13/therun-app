import {
  InvitationsListSchema,
  InviteSearchResponseSchema,
  InviteParticipantInputSchema,
} from '../types';

describe('InvitationsListSchema', () => {
  it('should validate empty list', () => {
    const result = InvitationsListSchema.safeParse({
      items: [],
      page: 1,
      pageSize: 20,
      totalCount: 0,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });

  it('should validate list with items', () => {
    const result = InvitationsListSchema.safeParse({
      items: [
        {
          participantId: 'p1',
          eventId: 'e1',
          role: 'PARTICIPANT',
          status: 'INVITED',
          eventTitle: 'Morning Run',
          startDateTime: '2026-03-01T08:00:00.000Z',
          locationName: 'Park',
          organiserId: 'u1',
          organiserFirstName: 'John',
          organiserLastName: 'Doe',
        },
      ],
      page: 1,
      pageSize: 20,
      totalCount: 1,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
  });
});

describe('InviteSearchResponseSchema', () => {
  it('should validate search results', () => {
    const result = InviteSearchResponseSchema.safeParse({
      items: [
        {
          id: 'u1',
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@test.com',
        },
      ],
      page: 1,
      pageSize: 20,
      totalCount: 1,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
  });
});

describe('InviteParticipantInputSchema', () => {
  it('should validate invite input', () => {
    const result = InviteParticipantInputSchema.safeParse({
      userId: 'u1',
      role: 'PARTICIPANT',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid role', () => {
    const result = InviteParticipantInputSchema.safeParse({
      userId: 'u1',
      role: 'ADMIN',
    });
    expect(result.success).toBe(false);
  });
});
