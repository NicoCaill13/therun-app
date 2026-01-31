import {
  ParticipantStatusSchema,
  RoleInEventSchema,
  ParticipantListItemSchema,
  ParticipantsListResponseSchema,
  ParticipantsSummaryResponseSchema,
  UpsertParticipationInputSchema,
  UpdateSelectionInputSchema,
  ParticipantResponseSchema,
} from '../types';

describe('Participant Types', () => {
  describe('ParticipantStatusSchema', () => {
    it('should accept valid statuses', () => {
      expect(ParticipantStatusSchema.parse('INVITED')).toBe('INVITED');
      expect(ParticipantStatusSchema.parse('GOING')).toBe('GOING');
      expect(ParticipantStatusSchema.parse('MAYBE')).toBe('MAYBE');
      expect(ParticipantStatusSchema.parse('DECLINED')).toBe('DECLINED');
    });

    it('should reject invalid status', () => {
      expect(() => ParticipantStatusSchema.parse('INVALID')).toThrow();
    });
  });

  describe('RoleInEventSchema', () => {
    it('should accept valid roles', () => {
      expect(RoleInEventSchema.parse('ORGANISER')).toBe('ORGANISER');
      expect(RoleInEventSchema.parse('ENCADRANT')).toBe('ENCADRANT');
      expect(RoleInEventSchema.parse('PARTICIPANT')).toBe('PARTICIPANT');
    });

    it('should reject invalid role', () => {
      expect(() => RoleInEventSchema.parse('ADMIN')).toThrow();
    });
  });

  describe('ParticipantListItemSchema', () => {
    it('should parse valid participant item', () => {
      const validItem = {
        participantId: '550e8400-e29b-41d4-a716-446655440000',
        userId: '550e8400-e29b-41d4-a716-446655440001',
        displayName: 'John Doe',
        roleInEvent: 'PARTICIPANT',
        status: 'GOING',
        eventRoute: null,
        eventGroup: { id: '550e8400-e29b-41d4-a716-446655440002', label: '5:30/km' },
      };

      const result = ParticipantListItemSchema.parse(validItem);
      expect(result.displayName).toBe('John Doe');
      expect(result.status).toBe('GOING');
      expect(result.eventGroup?.label).toBe('5:30/km');
    });

    it('should allow null userId for guests', () => {
      const guestItem = {
        participantId: '550e8400-e29b-41d4-a716-446655440000',
        userId: null,
        displayName: 'Guest User',
        roleInEvent: 'PARTICIPANT',
        status: 'GOING',
        eventRoute: null,
        eventGroup: null,
      };

      const result = ParticipantListItemSchema.parse(guestItem);
      expect(result.userId).toBeNull();
    });
  });

  describe('ParticipantsListResponseSchema', () => {
    it('should parse valid paginated response', () => {
      const response = {
        items: [
          {
            participantId: '550e8400-e29b-41d4-a716-446655440000',
            userId: '550e8400-e29b-41d4-a716-446655440001',
            displayName: 'John Doe',
            roleInEvent: 'ORGANISER',
            status: 'GOING',
            eventRoute: null,
            eventGroup: null,
          },
        ],
        page: 1,
        pageSize: 20,
        totalCount: 1,
        totalPages: 1,
      };

      const result = ParticipantsListResponseSchema.parse(response);
      expect(result.items).toHaveLength(1);
      expect(result.page).toBe(1);
    });

    it('should reject invalid pagination values', () => {
      const invalidResponse = {
        items: [],
        page: 0, // Must be >= 1
        pageSize: 20,
        totalCount: 0,
        totalPages: 0,
      };

      expect(() => ParticipantsListResponseSchema.parse(invalidResponse)).toThrow();
    });
  });

  describe('ParticipantsSummaryResponseSchema', () => {
    it('should parse valid summary', () => {
      const summary = {
        goingCount: 10,
        invitedCount: 5,
        maybeCount: 3,
        byRoute: [
          { eventRouteId: '550e8400-e29b-41d4-a716-446655440000', name: 'Route 10K', goingCount: 6 },
        ],
        byGroup: [
          { eventGroupId: '550e8400-e29b-41d4-a716-446655440001', label: '5:00/km', goingCount: 4 },
        ],
      };

      const result = ParticipantsSummaryResponseSchema.parse(summary);
      expect(result.goingCount).toBe(10);
      expect(result.byRoute).toHaveLength(1);
      expect(result.byGroup).toHaveLength(1);
    });

    it('should accept empty arrays for byRoute and byGroup', () => {
      const summary = {
        goingCount: 5,
        invitedCount: 2,
        maybeCount: 1,
        byRoute: [],
        byGroup: [],
      };

      const result = ParticipantsSummaryResponseSchema.parse(summary);
      expect(result.byRoute).toHaveLength(0);
      expect(result.byGroup).toHaveLength(0);
    });
  });

  describe('UpsertParticipationInputSchema', () => {
    it('should accept valid participation statuses', () => {
      expect(UpsertParticipationInputSchema.parse({ status: 'GOING' })).toEqual({ status: 'GOING' });
      expect(UpsertParticipationInputSchema.parse({ status: 'MAYBE' })).toEqual({ status: 'MAYBE' });
      expect(UpsertParticipationInputSchema.parse({ status: 'DECLINED' })).toEqual({ status: 'DECLINED' });
    });

    it('should reject INVITED status (cannot be set by user)', () => {
      expect(() => UpsertParticipationInputSchema.parse({ status: 'INVITED' })).toThrow();
    });
  });

  describe('UpdateSelectionInputSchema', () => {
    it('should accept valid selection', () => {
      const input = {
        eventRouteId: '550e8400-e29b-41d4-a716-446655440000',
        eventGroupId: '550e8400-e29b-41d4-a716-446655440001',
      };

      const result = UpdateSelectionInputSchema.parse(input);
      expect(result.eventRouteId).toBe(input.eventRouteId);
      expect(result.eventGroupId).toBe(input.eventGroupId);
    });

    it('should accept null values to clear selection', () => {
      const input = {
        eventRouteId: null,
        eventGroupId: null,
      };

      const result = UpdateSelectionInputSchema.parse(input);
      expect(result.eventRouteId).toBeNull();
      expect(result.eventGroupId).toBeNull();
    });

    it('should accept partial updates', () => {
      const input = {
        eventGroupId: '550e8400-e29b-41d4-a716-446655440001',
      };

      const result = UpdateSelectionInputSchema.parse(input);
      expect(result.eventGroupId).toBe(input.eventGroupId);
      expect(result.eventRouteId).toBeUndefined();
    });
  });

  describe('ParticipantResponseSchema', () => {
    it('should parse valid response', () => {
      const response = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        displayName: 'John Doe',
        eventRouteId: null,
        eventGroupId: '550e8400-e29b-41d4-a716-446655440001',
        roleInEvent: 'PARTICIPANT',
        status: 'GOING',
      };

      const result = ParticipantResponseSchema.parse(response);
      expect(result.status).toBe('GOING');
      expect(result.displayName).toBe('John Doe');
    });

    it('should allow optional roleInEvent', () => {
      const response = {
        userId: null,
        displayName: 'Guest',
        eventRouteId: null,
        eventGroupId: null,
        status: 'GOING',
      };

      const result = ParticipantResponseSchema.parse(response);
      expect(result.roleInEvent).toBeUndefined();
    });
  });
});
