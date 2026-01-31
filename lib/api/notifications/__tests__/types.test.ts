import {
  NotificationTypeSchema,
  NotificationSchema,
  MyNotificationsResponseSchema,
} from '../types';

describe('NotificationTypeSchema', () => {
  const validTypes = [
    'EVENT_INVITE',
    'EVENT_UPDATE',
    'EVENT_REMINDER',
    'EVENT_CANCELLED',
    'EVENT_BROADCAST',
    'PARTICIPANT_JOINED',
    'PARTICIPANT_LEFT',
    'ROUTE_PUBLISHED',
  ];

  it.each(validTypes)('should accept valid type: %s', (type) => {
    const result = NotificationTypeSchema.safeParse(type);
    expect(result.success).toBe(true);
  });

  it('should reject invalid type', () => {
    const result = NotificationTypeSchema.safeParse('INVALID_TYPE');
    expect(result.success).toBe(false);
  });
});

describe('NotificationSchema', () => {
  const validNotification = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    type: 'EVENT_INVITE',
    title: 'New invitation',
    body: 'You have been invited to an event',
    eventId: '550e8400-e29b-41d4-a716-446655440001',
    data: { someKey: 'someValue' },
    createdAt: '2025-01-15T10:00:00.000Z',
    readAt: '2025-01-15T11:00:00.000Z',
  };

  it('should accept valid notification', () => {
    const result = NotificationSchema.safeParse(validNotification);
    expect(result.success).toBe(true);
  });

  it('should accept notification with null eventId', () => {
    const notification = { ...validNotification, eventId: null };
    const result = NotificationSchema.safeParse(notification);
    expect(result.success).toBe(true);
  });

  it('should accept notification with null readAt', () => {
    const notification = { ...validNotification, readAt: null };
    const result = NotificationSchema.safeParse(notification);
    expect(result.success).toBe(true);
  });

  it('should accept notification with null data', () => {
    const notification = { ...validNotification, data: null };
    const result = NotificationSchema.safeParse(notification);
    expect(result.success).toBe(true);
  });

  it('should reject invalid id', () => {
    const notification = { ...validNotification, id: 'not-a-uuid' };
    const result = NotificationSchema.safeParse(notification);
    expect(result.success).toBe(false);
  });

  it('should reject invalid createdAt', () => {
    const notification = { ...validNotification, createdAt: 'not-a-date' };
    const result = NotificationSchema.safeParse(notification);
    expect(result.success).toBe(false);
  });
});

describe('MyNotificationsResponseSchema', () => {
  const validNotification = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    type: 'EVENT_INVITE',
    title: 'New invitation',
    body: 'You have been invited',
    eventId: null,
    data: null,
    createdAt: '2025-01-15T10:00:00.000Z',
    readAt: null,
  };

  const validResponse = {
    items: [validNotification],
    page: 1,
    pageSize: 20,
    totalCount: 1,
    totalPages: 1,
    unreadCount: 1,
  };

  it('should accept valid response', () => {
    const result = MyNotificationsResponseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
  });

  it('should accept empty items', () => {
    const response = { ...validResponse, items: [], totalCount: 0, unreadCount: 0 };
    const result = MyNotificationsResponseSchema.safeParse(response);
    expect(result.success).toBe(true);
  });

  it('should reject invalid page', () => {
    const response = { ...validResponse, page: 0 };
    const result = MyNotificationsResponseSchema.safeParse(response);
    expect(result.success).toBe(false);
  });

  it('should reject negative unreadCount', () => {
    const response = { ...validResponse, unreadCount: -1 };
    const result = MyNotificationsResponseSchema.safeParse(response);
    expect(result.success).toBe(false);
  });
});
