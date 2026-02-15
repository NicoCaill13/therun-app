import { NotificationSchema, NotificationsListSchema } from '../types';

describe('NotificationSchema', () => {
  it('should validate a notification', () => {
    const result = NotificationSchema.safeParse({
      id: 'n1',
      type: 'EVENT_INVITATION',
      title: 'New invite',
      body: 'You have been invited to join Morning Run',
      eventId: 'e1',
      data: {},
      createdAt: '2026-02-03T10:00:00.000Z',
      readAt: null,
    });
    expect(result.success).toBe(true);
  });

  it('should accept null eventId', () => {
    const result = NotificationSchema.safeParse({
      id: 'n1',
      type: 'SYSTEM',
      title: 'Welcome',
      body: 'Welcome to THE RUN',
      eventId: null,
      data: null,
      createdAt: '2026-02-03T10:00:00.000Z',
      readAt: '2026-02-03T10:05:00.000Z',
    });
    expect(result.success).toBe(true);
  });
});

describe('NotificationsListSchema', () => {
  it('should validate notifications list', () => {
    const result = NotificationsListSchema.safeParse({
      items: [],
      page: 1,
      pageSize: 20,
      totalCount: 0,
      totalPages: 0,
      unreadCount: 0,
    });
    expect(result.success).toBe(true);
  });
});
