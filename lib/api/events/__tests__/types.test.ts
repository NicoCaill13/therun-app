import {
  CreateEventInputSchema,
  EventStatusSchema,
  EventBlockSchema,
  EventDetailsResponseSchema,
  MeEventItemSchema,
  MeEventsListResponseSchema,
  ParticipantStatusSchema,
} from '../types';

describe('Event Types - Zod Schemas', () => {
  describe('EventStatusSchema', () => {
    it('should accept valid status values', () => {
      expect(EventStatusSchema.parse('SCHEDULED')).toBe('SCHEDULED');
      expect(EventStatusSchema.parse('ONGOING')).toBe('ONGOING');
      expect(EventStatusSchema.parse('COMPLETED')).toBe('COMPLETED');
      expect(EventStatusSchema.parse('CANCELLED')).toBe('CANCELLED');
    });

    it('should reject invalid status values', () => {
      expect(() => EventStatusSchema.parse('INVALID')).toThrow();
      expect(() => EventStatusSchema.parse('')).toThrow();
      expect(() => EventStatusSchema.parse(null)).toThrow();
    });
  });

  describe('ParticipantStatusSchema', () => {
    it('should accept valid participant status values', () => {
      expect(ParticipantStatusSchema.parse('INVITED')).toBe('INVITED');
      expect(ParticipantStatusSchema.parse('GOING')).toBe('GOING');
      expect(ParticipantStatusSchema.parse('DECLINED')).toBe('DECLINED');
      expect(ParticipantStatusSchema.parse('MAYBE')).toBe('MAYBE');
    });

    it('should reject invalid participant status values', () => {
      expect(() => ParticipantStatusSchema.parse('UNKNOWN')).toThrow();
    });
  });

  describe('CreateEventInputSchema', () => {
    const validInput = {
      title: 'Run du jeudi soir',
      startDateTime: '2025-12-15T19:00:00.000Z',
    };

    it('should accept valid minimal input', () => {
      const result = CreateEventInputSchema.parse(validInput);
      expect(result.title).toBe('Run du jeudi soir');
      expect(result.startDateTime).toBe('2025-12-15T19:00:00.000Z');
    });

    it('should accept valid complete input', () => {
      const completeInput = {
        ...validInput,
        description: 'Sortie tranquille',
        locationName: 'Parc Borely',
        locationAddress: 'Avenue du Prado, 13008 Marseille',
        locationLat: 43.262,
        locationLng: 5.376,
      };

      const result = CreateEventInputSchema.parse(completeInput);
      expect(result.description).toBe('Sortie tranquille');
      expect(result.locationName).toBe('Parc Borely');
      expect(result.locationLat).toBe(43.262);
    });

    it('should reject empty title', () => {
      expect(() =>
        CreateEventInputSchema.parse({ ...validInput, title: '' })
      ).toThrow('Le titre est requis');
    });

    it('should reject title exceeding 100 characters', () => {
      const longTitle = 'a'.repeat(101);
      expect(() =>
        CreateEventInputSchema.parse({ ...validInput, title: longTitle })
      ).toThrow();
    });

    it('should reject invalid datetime format', () => {
      expect(() =>
        CreateEventInputSchema.parse({ ...validInput, startDateTime: 'invalid' })
      ).toThrow();
    });

    it('should reject invalid latitude', () => {
      expect(() =>
        CreateEventInputSchema.parse({ ...validInput, locationLat: 100 })
      ).toThrow();
    });

    it('should reject invalid longitude', () => {
      expect(() =>
        CreateEventInputSchema.parse({ ...validInput, locationLng: 200 })
      ).toThrow();
    });
  });

  describe('EventBlockSchema', () => {
    const validEventBlock = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Run du jeudi',
      description: null,
      startDateTime: '2025-12-15T19:00:00.000Z',
      locationName: null,
      locationAddress: null,
      locationLat: null,
      locationLng: null,
      status: 'SCHEDULED',
      eventCode: 'ABC123',
      completedAt: null,
      goingCountAtCompletion: null,
    };

    it('should accept valid event block', () => {
      const result = EventBlockSchema.parse(validEventBlock);
      expect(result.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(result.status).toBe('SCHEDULED');
    });

    it('should reject invalid UUID', () => {
      expect(() =>
        EventBlockSchema.parse({ ...validEventBlock, id: 'invalid-uuid' })
      ).toThrow();
    });

    it('should reject missing required fields', () => {
      const { title, ...withoutTitle } = validEventBlock;
      expect(() => EventBlockSchema.parse(withoutTitle)).toThrow();
    });
  });

  describe('MeEventItemSchema', () => {
    const validItem = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Run du jeudi',
      startDateTime: '2025-12-15T19:00:00.000Z',
      status: 'SCHEDULED',
      locationName: null,
      locationAddress: null,
      goingCount: 5,
    };

    it('should accept valid event item', () => {
      const result = MeEventItemSchema.parse(validItem);
      expect(result.goingCount).toBe(5);
    });

    it('should accept zero going count', () => {
      const result = MeEventItemSchema.parse({ ...validItem, goingCount: 0 });
      expect(result.goingCount).toBe(0);
    });
  });

  describe('MeEventsListResponseSchema', () => {
    const validResponse = {
      items: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Run du jeudi',
          startDateTime: '2025-12-15T19:00:00.000Z',
          status: 'SCHEDULED',
          locationName: null,
          locationAddress: null,
          goingCount: 5,
        },
      ],
      page: 1,
      pageSize: 20,
      total: 1,
    };

    it('should accept valid list response', () => {
      const result = MeEventsListResponseSchema.parse(validResponse);
      expect(result.items).toHaveLength(1);
      expect(result.page).toBe(1);
      expect(result.total).toBe(1);
    });

    it('should accept empty items list', () => {
      const result = MeEventsListResponseSchema.parse({
        ...validResponse,
        items: [],
        total: 0,
      });
      expect(result.items).toHaveLength(0);
    });
  });

  describe('EventDetailsResponseSchema', () => {
    const validDetails = {
      event: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Run du jeudi',
        description: null,
        startDateTime: '2025-12-15T19:00:00.000Z',
        locationName: null,
        locationAddress: null,
        locationLat: null,
        locationLng: null,
        status: 'SCHEDULED',
        eventCode: 'ABC123',
        completedAt: null,
        goingCountAtCompletion: null,
      },
      organiser: {
        id: '550e8400-e29b-41d4-a716-446655440001',
        displayName: 'John Doe',
        email: 'john@example.com',
      },
      participants: [],
      currentUserParticipation: null,
    };

    it('should accept valid event details', () => {
      const result = EventDetailsResponseSchema.parse(validDetails);
      expect(result.event.title).toBe('Run du jeudi');
      expect(result.organiser.displayName).toBe('John Doe');
    });

    it('should accept event details with participants', () => {
      const withParticipants = {
        ...validDetails,
        participants: [
          {
            id: '550e8400-e29b-41d4-a716-446655440002',
            userId: '550e8400-e29b-41d4-a716-446655440003',
            displayName: 'Jane Doe',
            email: 'jane@example.com',
            status: 'GOING',
            selectedPaceGroupId: null,
          },
        ],
      };

      const result = EventDetailsResponseSchema.parse(withParticipants);
      expect(result.participants).toHaveLength(1);
      expect(result.participants[0].status).toBe('GOING');
    });

    it('should accept event details with current user participation', () => {
      const withParticipation = {
        ...validDetails,
        currentUserParticipation: {
          participantId: '550e8400-e29b-41d4-a716-446655440004',
          status: 'GOING',
          selectedPaceGroupId: null,
          canEdit: true,
        },
      };

      const result = EventDetailsResponseSchema.parse(withParticipation);
      expect(result.currentUserParticipation?.status).toBe('GOING');
      expect(result.currentUserParticipation?.canEdit).toBe(true);
    });
  });
});
