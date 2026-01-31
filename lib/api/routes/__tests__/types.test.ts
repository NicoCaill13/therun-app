import {
  RouteTypeSchema,
  EventRouteSchema,
  EventRoutesListSchema,
  decodePolyline,
  calculateBounds,
} from '../types';

describe('Route Types', () => {
  describe('RouteTypeSchema', () => {
    it('should accept valid route types', () => {
      expect(RouteTypeSchema.parse('LOOP')).toBe('LOOP');
      expect(RouteTypeSchema.parse('OUT_AND_BACK')).toBe('OUT_AND_BACK');
      expect(RouteTypeSchema.parse('POINT_TO_POINT')).toBe('POINT_TO_POINT');
    });

    it('should reject invalid route type', () => {
      expect(() => RouteTypeSchema.parse('CIRCULAR')).toThrow();
    });
  });

  describe('EventRouteSchema', () => {
    it('should parse valid event route', () => {
      const validRoute = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        eventId: '550e8400-e29b-41d4-a716-446655440001',
        routeId: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Parcours 10K',
        distanceMeters: 10000,
        type: 'LOOP',
        encodedPolyline: '_p~iF~ps|U_ulLnnqC_mqNvxq`@',
        createdAt: '2025-01-15T10:00:00.000Z',
        updatedAt: '2025-01-15T10:00:00.000Z',
      };

      const result = EventRouteSchema.parse(validRoute);
      expect(result.name).toBe('Parcours 10K');
      expect(result.distanceMeters).toBe(10000);
      expect(result.type).toBe('LOOP');
    });

    it('should allow null routeId', () => {
      const routeWithoutLibraryId = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        eventId: '550e8400-e29b-41d4-a716-446655440001',
        routeId: null,
        name: 'Custom Route',
        distanceMeters: 5000,
        type: null,
        encodedPolyline: '_p~iF~ps|U',
        createdAt: '2025-01-15T10:00:00.000Z',
        updatedAt: '2025-01-15T10:00:00.000Z',
      };

      const result = EventRouteSchema.parse(routeWithoutLibraryId);
      expect(result.routeId).toBeNull();
      expect(result.type).toBeNull();
    });

    it('should reject negative distance', () => {
      const invalidRoute = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        eventId: '550e8400-e29b-41d4-a716-446655440001',
        routeId: null,
        name: 'Invalid Route',
        distanceMeters: -1000,
        type: null,
        encodedPolyline: '_p~iF~ps|U',
        createdAt: '2025-01-15T10:00:00.000Z',
        updatedAt: '2025-01-15T10:00:00.000Z',
      };

      expect(() => EventRouteSchema.parse(invalidRoute)).toThrow();
    });
  });

  describe('EventRoutesListSchema', () => {
    it('should parse array of routes', () => {
      const routes = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          eventId: '550e8400-e29b-41d4-a716-446655440001',
          routeId: null,
          name: 'Route A',
          distanceMeters: 5000,
          type: 'LOOP',
          encodedPolyline: '_p~iF~ps|U',
          createdAt: '2025-01-15T10:00:00.000Z',
          updatedAt: '2025-01-15T10:00:00.000Z',
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          eventId: '550e8400-e29b-41d4-a716-446655440001',
          routeId: null,
          name: 'Route B',
          distanceMeters: 10000,
          type: 'OUT_AND_BACK',
          encodedPolyline: '_p~iF~ps|U_ulLnnqC',
          createdAt: '2025-01-15T10:00:00.000Z',
          updatedAt: '2025-01-15T10:00:00.000Z',
        },
      ];

      const result = EventRoutesListSchema.parse(routes);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Route A');
      expect(result[1].name).toBe('Route B');
    });

    it('should parse empty array', () => {
      const result = EventRoutesListSchema.parse([]);
      expect(result).toHaveLength(0);
    });
  });
});

describe('Polyline Utilities', () => {
  describe('decodePolyline', () => {
    it('should decode simple polyline', () => {
      // Simple encoded polyline for testing
      // This represents a line from approximately (38.5, -120.2) to (40.7, -120.95) to (43.25, -126.45)
      const encoded = '_p~iF~ps|U_ulLnnqC_mqNvxq`@';
      const coordinates = decodePolyline(encoded);

      expect(coordinates).toHaveLength(3);
      expect(coordinates[0].latitude).toBeCloseTo(38.5, 1);
      expect(coordinates[0].longitude).toBeCloseTo(-120.2, 1);
    });

    it('should return empty array for empty string', () => {
      const coordinates = decodePolyline('');
      expect(coordinates).toHaveLength(0);
    });

    it('should decode polyline with negative coordinates', () => {
      // Polyline that includes negative coordinates
      const encoded = 'a~l~Fjk~uOwHJy@P';
      const coordinates = decodePolyline(encoded);

      expect(coordinates.length).toBeGreaterThan(0);
      // All coordinates should have valid lat/lng values
      coordinates.forEach((coord) => {
        expect(coord.latitude).toBeGreaterThanOrEqual(-90);
        expect(coord.latitude).toBeLessThanOrEqual(90);
        expect(coord.longitude).toBeGreaterThanOrEqual(-180);
        expect(coord.longitude).toBeLessThanOrEqual(180);
      });
    });
  });

  describe('calculateBounds', () => {
    it('should calculate correct bounds for coordinates', () => {
      const coordinates = [
        { latitude: 48.8566, longitude: 2.3522 }, // Paris
        { latitude: 51.5074, longitude: -0.1278 }, // London
        { latitude: 41.9028, longitude: 12.4964 }, // Rome
      ];

      const bounds = calculateBounds(coordinates);

      expect(bounds).not.toBeNull();
      expect(bounds!.minLat).toBeCloseTo(41.9028, 4);
      expect(bounds!.maxLat).toBeCloseTo(51.5074, 4);
      expect(bounds!.minLng).toBeCloseTo(-0.1278, 4);
      expect(bounds!.maxLng).toBeCloseTo(12.4964, 4);
    });

    it('should calculate center correctly', () => {
      const coordinates = [
        { latitude: 0, longitude: 0 },
        { latitude: 10, longitude: 10 },
      ];

      const bounds = calculateBounds(coordinates);

      expect(bounds!.centerLat).toBe(5);
      expect(bounds!.centerLng).toBe(5);
    });

    it('should return null for empty array', () => {
      const bounds = calculateBounds([]);
      expect(bounds).toBeNull();
    });

    it('should handle single coordinate', () => {
      const coordinates = [{ latitude: 48.8566, longitude: 2.3522 }];
      const bounds = calculateBounds(coordinates);

      expect(bounds).not.toBeNull();
      expect(bounds!.minLat).toBe(bounds!.maxLat);
      expect(bounds!.minLng).toBe(bounds!.maxLng);
      expect(bounds!.centerLat).toBe(48.8566);
      expect(bounds!.centerLng).toBe(2.3522);
    });
  });
});
