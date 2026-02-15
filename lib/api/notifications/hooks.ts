import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { NotificationsListSchema, NotificationSchema } from './types';
import type { NotificationsList, Notification } from './types';

/** GET /api/me/notifications - List notifications */
export function useNotifications(page = 1, unreadOnly = false) {
  return useQuery<NotificationsList>({
    queryKey: ['me', 'notifications', page, unreadOnly],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/me/notifications', {
        params: { page, pageSize: 20, unreadOnly },
      });
      return NotificationsListSchema.parse(data);
    },
  });
}

/** PATCH /api/me/notifications/:id/read - Mark a single notification as read */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation<Notification, unknown, string>({
    mutationFn: async (notificationId) => {
      const { data } = await apiClient.patch(`/api/me/notifications/${notificationId}/read`);
      return NotificationSchema.parse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me', 'notifications'] });
    },
  });
}
