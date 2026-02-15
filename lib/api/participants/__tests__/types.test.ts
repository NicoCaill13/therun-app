import {
  ParticipantItemSchema,
  ParticipantsListSchema,
  ParticipantsSummarySchema,
  UpsertParticipationInputSchema,
  UpdateSelectionInputSchema,
} from '../types';

describe('Participant Types', () => {
  describe('ParticipantItemSchema', () => {
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

      const result = ParticipantItemSchema.parse(validItem);
      expect(result.displayName).toBe('John Doe');
      expect(result.status).toBe('GOING');
      expect(result.eventGroup?.label).toBe('5:30/km');
    });

    it('should allow optional eventRoute and eventGroup', () => {
      const minimalItem = {
        participantId: '550e8400-e29b-41d4-a716-446655440000',
        userId: '550e8400-e29b-41d4-a716-446655440001',
        displayName: 'John Doe',
        roleInEvent: 'PARTICIPANT',
        status: 'GOING',
      };

      const result = ParticipantItemSchema.parse(minimalItem);
      expect(result.eventRoute).toBeUndefined();
      expect(result.eventGroup).toBeUndefined();
    });
  });

  describe('ParticipantsListSchema', () => {
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

      const result = ParticipantsListSchema.parse(response);
      expect(result.items).toHaveLength(1);
      expect(result.page).toBe(1);
      expect(result.items[0].displayName).toBe('John Doe');
    });

    it('should accept empty items array', () => {
      const response = {
        items: [],
        page: 1,
        pageSize: 20,
        totalCount: 0,
        totalPages: 1,
      };

      const result = ParticipantsListSchema.parse(response);
      expect(result.items).toHaveLength(0);
    });
  });

  describe('ParticipantsSummarySchema', () => {
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

      const result = ParticipantsSummarySchema.parse(summary);
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

      const result = ParticipantsSummarySchema.parse(summary);
      expect(result.byRoute).toHaveLength(0);
      expect(result.byGroup).toHaveLength(0);
    });
  });

  describe('UpsertParticipationInputSchema', () => {
    it('should accept valid participation statuses', () => {
      expect(UpsertParticipationInputSchema.parse({ status: 'GOING' })).toEqual({ status: 'GOING' });
      expect(UpsertParticipationInputSchema.parse({ status: 'MAYBE' })).toEqual({ status: 'MAYBE' });
      expect(UpsertParticipationInputSchema.parse({ status: 'DECLINED' })).toEqual({
        status: 'DECLINED',
      });
    });

    it('should reject invalid status', () => {
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
});
