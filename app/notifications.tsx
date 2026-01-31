import { View, Pressable, FlatList, RefreshControl } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useCallback } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { Container, Typography, Button } from '@/components/ui';
import { LoadingState, ErrorState, EmptyState } from '@/components/states';
import {
  useMyNotificationsInfinite,
  useMarkNotificationAsRead,
  flattenInfiniteNotifications,
  getUnreadCount,
  Notification,
  NotificationType,
} from '@/lib/api/notifications';
import { formatEventDate } from '@/lib/utils/date';

// ============================================================================
// Notifications Screen
// ============================================================================

export default function NotificationsScreen() {
  const router = useRouter();
  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMyNotificationsInfinite();

  const markAsRead = useMarkNotificationAsRead();

  const notifications = flattenInfiniteNotifications(data);
  const unreadCount = getUnreadCount(data);

  // Handle notification press
  const handleNotificationPress = useCallback(
    (notification: Notification) => {
      // Mark as read if not already
      if (!notification.readAt) {
        markAsRead.mutate({ notificationId: notification.id });
      }

      // Navigate to event if applicable
      if (notification.eventId) {
        router.push(`/event/${notification.eventId}`);
      }
    },
    [markAsRead, router]
  );

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Render notification item
  const renderItem = useCallback(
    ({ item }: { item: Notification }) => (
      <NotificationItem
        notification={item}
        onPress={() => handleNotificationPress(item)}
      />
    ),
    [handleNotificationPress]
  );

  // Handle loading state
  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Notifications' }} />
        <LoadingState message="Chargement des notifications..." />
      </>
    );
  }

  // Handle error state
  if (error) {
    return (
      <>
        <Stack.Screen options={{ title: 'Notifications' }} />
        <ErrorState message={error.message} onRetry={refetch} />
      </>
    );
  }

  // Handle empty state
  if (notifications.length === 0) {
    return (
      <>
        <Stack.Screen options={{ title: 'Notifications' }} />
        <EmptyState
          title="Aucune notification"
          message="Vous n'avez pas encore de notifications"
          icon="bell"
        />
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: `Notifications${unreadCount > 0 ? ` (${unreadCount})` : ''}`,
        }}
      />
      <Container padding="none">
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={handleRefresh} />
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="py-4">
                <Typography color="muted" className="text-center">
                  Chargement...
                </Typography>
              </View>
            ) : null
          }
          ItemSeparatorComponent={() => (
            <View className="h-px bg-secondary-100 dark:bg-secondary-800" />
          )}
        />
      </Container>
    </>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function NotificationItem({
  notification,
  onPress,
}: {
  notification: Notification;
  onPress: () => void;
}) {
  const isUnread = !notification.readAt;
  const icon = getNotificationIcon(notification.type);

  return (
    <Pressable
      className={`flex-row p-4 ${
        isUnread ? 'bg-primary-50 dark:bg-primary-900/20' : ''
      } active:opacity-70`}
      onPress={onPress}
    >
      {/* Icon */}
      <View
        className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
          isUnread
            ? 'bg-primary-100 dark:bg-primary-800'
            : 'bg-secondary-100 dark:bg-secondary-800'
        }`}
      >
        <FontAwesome
          name={icon}
          size={18}
          color={isUnread ? '#16a34a' : '#6b7280'}
        />
      </View>

      {/* Content */}
      <View className="flex-1">
        <View className="flex-row items-start justify-between">
          <Typography
            className={`flex-1 ${isUnread ? 'font-semibold' : ''}`}
            numberOfLines={1}
          >
            {notification.title}
          </Typography>
          {isUnread && (
            <View className="w-2 h-2 rounded-full bg-primary-600 ml-2 mt-2" />
          )}
        </View>
        <Typography color="muted" numberOfLines={2} className="mt-1">
          {notification.body}
        </Typography>
        <Typography color="muted" className="text-xs mt-2">
          {formatNotificationDate(notification.createdAt)}
        </Typography>
      </View>
    </Pressable>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function getNotificationIcon(type: NotificationType): React.ComponentProps<typeof FontAwesome>['name'] {
  const icons: Record<NotificationType, React.ComponentProps<typeof FontAwesome>['name']> = {
    EVENT_INVITE: 'envelope',
    EVENT_UPDATE: 'pencil',
    EVENT_REMINDER: 'clock-o',
    EVENT_CANCELLED: 'times-circle',
    EVENT_BROADCAST: 'bullhorn',
    PARTICIPANT_JOINED: 'user-plus',
    PARTICIPANT_LEFT: 'user-times',
    ROUTE_PUBLISHED: 'map-marker',
  };
  return icons[type] || 'bell';
}

function formatNotificationDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "A l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;

  return formatEventDate(dateString);
}
