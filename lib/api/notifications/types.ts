import { z } from 'zod';

// ============================================================================
// Notification schemas
// ============================================================================

export const NotificationSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  body: z.string(),
  eventId: z.string().nullable(),
  data: z.unknown(),
  createdAt: z.string(),
  readAt: z.string().nullable(),
});

export const NotificationsListSchema = z.object({
  items: z.array(NotificationSchema),
  page: z.number(),
  pageSize: z.number(),
  totalCount: z.number(),
  totalPages: z.number(),
  unreadCount: z.number(),
});

export type Notification = z.infer<typeof NotificationSchema>;
export type NotificationsList = z.infer<typeof NotificationsListSchema>;
