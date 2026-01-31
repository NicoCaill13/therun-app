import { useQueryClient, InfiniteData } from '@tanstack/react-query';
import { useApiQuery, useApiMutation, useApiInfiniteQuery } from '@/lib/hooks';
import { apiClient } from '@/lib/api/client';
import {
  Notification,
  NotificationSchema,
  MyNotificationsResponse,
  MyNotificationsResponseSchema,
  NotificationsQueryParams,
} from './types';

// ============================================================================
// Query Keys
// ============================================================================

export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (params: NotificationsQueryParams) => [...notificationKeys.lists(), params] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
};

// ============================================================================
// useMyNotifications - List current user's notifications
// ============================================================================

interface UseMyNotificationsOptions {
  enabled?: boolean;
}

/**
 * Hook to fetch current user's notifications.
 * Uses GET /me/notifications endpoint.
 */
export function useMyNotifications(params: NotificationsQueryParams = {}, options?: UseMyNotificationsOptions) {
  return useApiQuery<MyNotificationsResponse>(
    notificationKeys.list(params),
    async () => {
      const response = await apiClient.get('/me/notifications', {
        params: {
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 20,
          unreadOnly: params.unreadOnly ?? false,
        },
      });

      // Validate response with Zod (DoD 1)
      return MyNotificationsResponseSchema.parse(response.data);
    },
    {
      enabled: options?.enabled ?? true,
    }
  );
}

// ============================================================================
// useMyNotificationsInfinite - Infinite scroll for notifications
// ============================================================================

interface UseMyNotificationsInfiniteOptions {
  enabled?: boolean;
  pageSize?: number;
  unreadOnly?: boolean;
}

/**
 * Hook to fetch current user's notifications with infinite scroll.
 * Uses GET /me/notifications endpoint with pagination.
 */
export function useMyNotificationsInfinite(options?: UseMyNotificationsInfiniteOptions) {
  const pageSize = options?.pageSize ?? 20;
  const unreadOnly = options?.unreadOnly ?? false;

  return useApiInfiniteQuery<MyNotificationsResponse>(
    [...notificationKeys.lists(), { infinite: true, unreadOnly }],
    async ({ pageParam }) => {
      const response = await apiClient.get('/me/notifications', {
        params: {
          page: pageParam.page,
          pageSize,
          unreadOnly,
        },
      });

      // Validate response with Zod (DoD 1)
      return MyNotificationsResponseSchema.parse(response.data);
    },
    {
      enabled: options?.enabled ?? true,
      getNextPageParam: (lastPage) => {
        if (lastPage.page < lastPage.totalPages) {
          return { page: lastPage.page + 1 };
        }
        return undefined;
      },
    }
  );
}

/**
 * Helper to flatten infinite query pages into a single array.
 */
export function flattenInfiniteNotifications(data: InfiniteData<MyNotificationsResponse> | undefined) {
  if (!data) return [];
  return data.pages.flatMap((page) => page.items);
}

/**
 * Helper to get total unread count from infinite query.
 */
export function getUnreadCount(data: InfiniteData<MyNotificationsResponse> | undefined): number {
  if (!data || data.pages.length === 0) return 0;
  return data.pages[0].unreadCount;
}

// ============================================================================
// useMarkNotificationAsRead - Mark a notification as read
// ============================================================================

/**
 * Hook to mark a notification as read.
 * Uses PATCH /me/notifications/:notificationId/read endpoint.
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useApiMutation<Notification, { notificationId: string }>(
    async ({ notificationId }) => {
      const response = await apiClient.patch(`/me/notifications/${notificationId}/read`);

      // Validate response with Zod (DoD 1)
      return NotificationSchema.parse(response.data);
    },
    {
      onSuccess: () => {
        // Invalidate all notification queries to refresh data
        queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      },
    }
  );
}

// ============================================================================
// useMarkAllNotificationsAsRead - Mark all notifications as read
// ============================================================================

/**
 * Hook to mark all notifications as read.
 * Uses PATCH /me/notifications/read-all endpoint (if available).
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useApiMutation<{ count: number }, void>(
    async () => {
      const response = await apiClient.patch('/me/notifications/read-all');
      return response.data;
    },
    {
      onSuccess: () => {
        // Invalidate all notification queries to refresh data
        queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      },
    }
  );
}
