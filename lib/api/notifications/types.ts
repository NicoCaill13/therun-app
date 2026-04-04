import { z } from 'zod';

// ============================================================================
// Notification Type Enum
// ============================================================================

export const NotificationTypeSchema = z.enum([
  'EVENT_INVITE',
  'EVENT_UPDATE',
  'EVENT_REMINDER',
  'EVENT_CANCELLED',
  'EVENT_BROADCAST',
  'PARTICIPANT_JOINED',
  'PARTICIPANT_LEFT',
  'ROUTE_PUBLISHED',
]);

export type NotificationType = z.infer<typeof NotificationTypeSchema>;

// ============================================================================
// Notification Item
// ============================================================================

export const NotificationSchema = z.object({
  id: z.string().uuid(),
  type: NotificationTypeSchema,
  title: z.string(),
  body: z.string(),
  eventId: z.string().uuid().nullable(),
  data: z.unknown().nullable(),
  createdAt: z.string().datetime(),
  readAt: z.string().datetime().nullable(),
});

export type Notification = z.infer<typeof NotificationSchema>;

// ============================================================================
// My Notifications Response (paginated)
// ============================================================================

export const MyNotificationsResponseSchema = z.object({
  items: z.array(NotificationSchema),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  totalCount: z.number().int().min(0),
  totalPages: z.number().int().min(0),
  unreadCount: z.number().int().min(0),
});

export type MyNotificationsResponse = z.infer<typeof MyNotificationsResponseSchema>;

// ============================================================================
// Query Params
// ============================================================================

export interface NotificationsQueryParams {
  page?: number;
  pageSize?: number;
  unreadOnly?: boolean;
}
