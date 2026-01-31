import {
  ParticipantRoleSchema,
  InvitationStatusSchema,
  InvitationItemSchema,
  MyInvitationsResponseSchema,
  RespondInvitationInputSchema,
  RespondInvitationResponseSchema,
  InviteUserInputSchema,
  InviteUserResponseSchema,
  SearchUserItemSchema,
  SearchUsersResponseSchema,
} from '../types';

describe('ParticipantRoleSchema', () => {
  it.each(['PARTICIPANT', 'ENCADRANT', 'ORGANISER'])('should accept valid role: %s', (role) => {
    const result = ParticipantRoleSchema.safeParse(role);
    expect(result.success).toBe(true);
  });

  it('should reject invalid role', () => {
    const result = ParticipantRoleSchema.safeParse('ADMIN');
    expect(result.success).toBe(false);
  });
});

describe('InvitationStatusSchema', () => {
  it.each(['INVITED', 'GOING', 'DECLINED', 'MAYBE'])('should accept valid status: %s', (status) => {
    const result = InvitationStatusSchema.safeParse(status);
    expect(result.success).toBe(true);
  });

  it('should reject invalid status', () => {
    const result = InvitationStatusSchema.safeParse('PENDING');
    expect(result.success).toBe(false);
  });
});

describe('InvitationItemSchema', () => {
  const validInvitation = {
    participantId: '550e8400-e29b-41d4-a716-446655440000',
    eventId: '550e8400-e29b-41d4-a716-446655440001',
    role: 'PARTICIPANT',
    status: 'INVITED',
    eventTitle: 'Morning Run',
    startDateTime: '2025-02-01T08:00:00.000Z',
    locationName: 'Central Park',
    organiserId: '550e8400-e29b-41d4-a716-446655440002',
    organiserFirstName: 'John',
    organiserLastName: 'Doe',
  };

  it('should accept valid invitation', () => {
    const result = InvitationItemSchema.safeParse(validInvitation);
    expect(result.success).toBe(true);
  });

  it('should accept invitation with null locationName', () => {
    const invitation = { ...validInvitation, locationName: null };
    const result = InvitationItemSchema.safeParse(invitation);
    expect(result.success).toBe(true);
  });

  it('should accept invitation with null organiserLastName', () => {
    const invitation = { ...validInvitation, organiserLastName: null };
    const result = InvitationItemSchema.safeParse(invitation);
    expect(result.success).toBe(true);
  });

  it('should reject invalid status (must be INVITED)', () => {
    const invitation = { ...validInvitation, status: 'GOING' };
    const result = InvitationItemSchema.safeParse(invitation);
    expect(result.success).toBe(false);
  });
});

describe('MyInvitationsResponseSchema', () => {
  const validResponse = {
    items: [],
    page: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0,
  };

  it('should accept valid response', () => {
    const result = MyInvitationsResponseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
  });

  it('should reject invalid page', () => {
    const response = { ...validResponse, page: 0 };
    const result = MyInvitationsResponseSchema.safeParse(response);
    expect(result.success).toBe(false);
  });
});

describe('RespondInvitationInputSchema', () => {
  it.each(['GOING', 'DECLINED', 'MAYBE'])('should accept valid status: %s', (status) => {
    const result = RespondInvitationInputSchema.safeParse({ status });
    expect(result.success).toBe(true);
  });

  it('should reject INVITED status', () => {
    const result = RespondInvitationInputSchema.safeParse({ status: 'INVITED' });
    expect(result.success).toBe(false);
  });
});

describe('RespondInvitationResponseSchema', () => {
  const validResponse = {
    participantId: '550e8400-e29b-41d4-a716-446655440000',
    status: 'GOING',
    respondedAt: '2025-01-15T10:00:00.000Z',
  };

  it('should accept valid response', () => {
    const result = RespondInvitationResponseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
  });

  it('should reject invalid participantId', () => {
    const response = { ...validResponse, participantId: 'not-uuid' };
    const result = RespondInvitationResponseSchema.safeParse(response);
    expect(result.success).toBe(false);
  });
});

describe('InviteUserInputSchema', () => {
  it('should accept valid input with userId only', () => {
    const input = { userId: '550e8400-e29b-41d4-a716-446655440000' };
    const result = InviteUserInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('should accept valid input with role', () => {
    const input = {
      userId: '550e8400-e29b-41d4-a716-446655440000',
      role: 'ENCADRANT',
    };
    const result = InviteUserInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('should reject invalid userId', () => {
    const input = { userId: 'not-uuid' };
    const result = InviteUserInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

describe('InviteUserResponseSchema', () => {
  const validResponse = {
    participantId: '550e8400-e29b-41d4-a716-446655440000',
    userId: '550e8400-e29b-41d4-a716-446655440001',
    eventId: '550e8400-e29b-41d4-a716-446655440002',
    role: 'PARTICIPANT',
    status: 'INVITED',
    displayName: 'John Doe',
    email: 'john@example.com',
  };

  it('should accept valid response', () => {
    const result = InviteUserResponseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
  });

  it('should accept null displayName', () => {
    const response = { ...validResponse, displayName: null };
    const result = InviteUserResponseSchema.safeParse(response);
    expect(result.success).toBe(true);
  });

  it('should accept null email', () => {
    const response = { ...validResponse, email: null };
    const result = InviteUserResponseSchema.safeParse(response);
    expect(result.success).toBe(true);
  });
});

describe('SearchUserItemSchema', () => {
  const validUser = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    displayName: 'John Doe',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
  };

  it('should accept valid user', () => {
    const result = SearchUserItemSchema.safeParse(validUser);
    expect(result.success).toBe(true);
  });

  it('should accept user with all nullable fields as null', () => {
    const user = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      displayName: null,
      email: null,
      firstName: null,
      lastName: null,
    };
    const result = SearchUserItemSchema.safeParse(user);
    expect(result.success).toBe(true);
  });
});

describe('SearchUsersResponseSchema', () => {
  const validResponse = {
    items: [],
    page: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0,
  };

  it('should accept valid response', () => {
    const result = SearchUsersResponseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
  });

  it('should reject negative totalCount', () => {
    const response = { ...validResponse, totalCount: -1 };
    const result = SearchUsersResponseSchema.safeParse(response);
    expect(result.success).toBe(false);
  });
});
