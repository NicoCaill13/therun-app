import {
  JoinEventSummarySchema,
  JoinParticipateResponseSchema,
  PublicEventByCodeSchema,
  GuestJoinInputSchema,
  GuestJoinResponseSchema,
} from '../types';

describe('JoinEventSummarySchema', () => {
  const validData = {
    eventId: 'evt_123',
    title: 'Morning Run',
    startDateTime: '2025-02-01T08:00:00.000Z',
    locationName: 'Central Park',
    locationLat: 40.785091,
    locationLng: -73.968285,
    organiserId: 'usr_456',
    organiserFirstName: 'John',
    organiserLastName: 'Doe',
  };

  it('should parse valid data', () => {
    const result = JoinEventSummarySchema.parse(validData);

    expect(result.eventId).toBe('evt_123');
    expect(result.title).toBe('Morning Run');
    expect(result.startDateTime).toBeInstanceOf(Date);
    expect(result.locationName).toBe('Central Park');
    expect(result.organiserId).toBe('usr_456');
  });

  it('should transform startDateTime to Date', () => {
    const result = JoinEventSummarySchema.parse(validData);

    expect(result.startDateTime).toBeInstanceOf(Date);
    expect(result.startDateTime.toISOString()).toBe('2025-02-01T08:00:00.000Z');
  });

  it('should allow null location fields', () => {
    const dataWithNullLocation = {
      ...validData,
      locationName: null,
      locationLat: null,
      locationLng: null,
    };

    const result = JoinEventSummarySchema.parse(dataWithNullLocation);

    expect(result.locationName).toBeNull();
    expect(result.locationLat).toBeNull();
    expect(result.locationLng).toBeNull();
  });

  it('should reject missing required fields', () => {
    const invalidData = { eventId: 'evt_123' };

    expect(() => JoinEventSummarySchema.parse(invalidData)).toThrow();
  });
});

describe('JoinParticipateResponseSchema', () => {
  const validData = {
    participantId: 'part_123',
    eventId: 'evt_456',
    userId: 'usr_789',
    role: 'PARTICIPANT' as const,
    status: 'GOING' as const,
  };

  it('should parse valid data', () => {
    const result = JoinParticipateResponseSchema.parse(validData);

    expect(result.participantId).toBe('part_123');
    expect(result.eventId).toBe('evt_456');
    expect(result.userId).toBe('usr_789');
    expect(result.role).toBe('PARTICIPANT');
    expect(result.status).toBe('GOING');
  });

  it('should accept all valid roles', () => {
    const roles = ['PARTICIPANT', 'ENCADRANT', 'ORGANISER'] as const;

    roles.forEach((role) => {
      const data = { ...validData, role };
      const result = JoinParticipateResponseSchema.parse(data);
      expect(result.role).toBe(role);
    });
  });

  it('should reject invalid role', () => {
    const invalidData = { ...validData, role: 'INVALID' };

    expect(() => JoinParticipateResponseSchema.parse(invalidData)).toThrow();
  });

  it('should only accept GOING status', () => {
    const invalidData = { ...validData, status: 'MAYBE' };

    expect(() => JoinParticipateResponseSchema.parse(invalidData)).toThrow();
  });
});

describe('PublicEventByCodeSchema', () => {
  const validData = {
    id: 'evt_123',
    eventCode: 'ABC123',
    title: 'Evening Run',
    startDateTime: '2025-02-01T18:00:00.000Z',
    status: 'SCHEDULED' as const,
    locationName: 'Beach',
    locationAddress: '123 Beach St',
    organiser: {
      firstName: 'Jane',
      lastName: 'Smith',
    },
    join: {
      eventCode: 'ABC123',
      eventId: 'evt_123',
    },
  };

  it('should parse valid data', () => {
    const result = PublicEventByCodeSchema.parse(validData);

    expect(result.id).toBe('evt_123');
    expect(result.eventCode).toBe('ABC123');
    expect(result.title).toBe('Evening Run');
    expect(result.status).toBe('SCHEDULED');
    expect(result.organiser.firstName).toBe('Jane');
    expect(result.join.eventId).toBe('evt_123');
  });

  it('should accept all valid statuses', () => {
    const statuses = ['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED'] as const;

    statuses.forEach((status) => {
      const data = { ...validData, status };
      const result = PublicEventByCodeSchema.parse(data);
      expect(result.status).toBe(status);
    });
  });

  it('should allow optional location fields', () => {
    const dataWithoutLocation = {
      ...validData,
      locationName: null,
      locationAddress: null,
    };

    const result = PublicEventByCodeSchema.parse(dataWithoutLocation);

    expect(result.locationName).toBeNull();
    expect(result.locationAddress).toBeNull();
  });
});

describe('GuestJoinInputSchema', () => {
  it('should parse valid minimal data', () => {
    const data = { firstName: 'John' };
    const result = GuestJoinInputSchema.parse(data);

    expect(result.firstName).toBe('John');
    expect(result.lastName).toBeUndefined();
    expect(result.email).toBeUndefined();
  });

  it('should parse valid complete data', () => {
    const data = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    };

    const result = GuestJoinInputSchema.parse(data);

    expect(result.firstName).toBe('John');
    expect(result.lastName).toBe('Doe');
    expect(result.email).toBe('john@example.com');
  });

  it('should reject empty firstName', () => {
    const data = { firstName: '' };

    expect(() => GuestJoinInputSchema.parse(data)).toThrow();
  });

  it('should reject firstName exceeding max length', () => {
    const data = { firstName: 'A'.repeat(51) };

    expect(() => GuestJoinInputSchema.parse(data)).toThrow();
  });

  it('should reject invalid email', () => {
    const data = { firstName: 'John', email: 'not-an-email' };

    expect(() => GuestJoinInputSchema.parse(data)).toThrow();
  });

  it('should accept valid email', () => {
    const data = { firstName: 'John', email: 'john.doe@example.com' };
    const result = GuestJoinInputSchema.parse(data);

    expect(result.email).toBe('john.doe@example.com');
  });
});

describe('GuestJoinResponseSchema', () => {
  const validData = {
    eventId: 'evt_123',
    participantId: 'part_456',
    userId: 'usr_789',
    isGuest: true,
    accessToken: 'jwt-token',
  };

  it('should parse valid data', () => {
    const result = GuestJoinResponseSchema.parse(validData);

    expect(result.eventId).toBe('evt_123');
    expect(result.participantId).toBe('part_456');
    expect(result.userId).toBe('usr_789');
    expect(result.isGuest).toBe(true);
    expect(result.accessToken).toBe('jwt-token');
  });

  it('should accept isGuest as false', () => {
    const data = { ...validData, isGuest: false };
    const result = GuestJoinResponseSchema.parse(data);

    expect(result.isGuest).toBe(false);
  });

  it('should reject missing required fields', () => {
    const invalidData = { eventId: 'evt_123' };

    expect(() => GuestJoinResponseSchema.parse(invalidData)).toThrow();
  });
});
