import { View, Pressable, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNotifications, useMarkNotificationRead } from '@/lib/api/notifications';
import { Typography, Skeleton } from '@/components/ui';
import type { Notification } from '@/lib/api/notifications';

// ============================================================================
// Activity / Notification Center (maquette: notification_center_activity)
// ============================================================================

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  const paddingTop = Platform.OS === 'web' ? 16 : insets.top;
  const { data, isLoading } = useNotifications();

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <View className={Platform.OS === 'web' ? 'max-w-md mx-auto w-full flex-1' : 'flex-1'}>
        {/* Header */}
        <View
          className="flex-row items-center justify-between px-4 pb-2 border-b border-gray-100 dark:border-gray-800"
          style={{ paddingTop: paddingTop + 8 }}
        >
          <Pressable className="w-10 h-10 items-center justify-center">
            <MaterialIcons name="arrow-back-ios" size={20} color="#0a181e" />
          </Pressable>
          <Typography variant="h4" className="font-sans-bold">
            Activity
          </Typography>
          <Pressable className="w-10 h-10 items-center justify-center">
            <MaterialIcons name="more-horiz" size={22} color="#0a181e" />
          </Pressable>
        </View>

        {isLoading ? (
          <ActivityLoadingState />
        ) : (
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <NotificationList notifications={data?.items ?? []} />
          </ScrollView>
        )}
      </View>
    </View>
  );
}

// ============================================================================
// Notification List - grouped by time
// ============================================================================

function NotificationList({ notifications }: { notifications: Notification[] }) {
  if (notifications.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-6 py-20">
        <MaterialIcons name="notifications-none" size={48} color="#d1d5db" />
        <Typography variant="body" color="secondary" className="mt-4 text-center">
          No notifications yet
        </Typography>
      </View>
    );
  }

  const today = new Date();
  const todayItems = notifications.filter((n) => {
    const d = new Date(n.createdAt);
    return d.toDateString() === today.toDateString();
  });
  const olderItems = notifications.filter((n) => {
    const d = new Date(n.createdAt);
    return d.toDateString() !== today.toDateString();
  });

  return (
    <View className="px-4 pt-2">
      {todayItems.length > 0 && (
        <>
          <Typography variant="label" color="orange" className="mb-3 mt-2">
            TODAY
          </Typography>
          {todayItems.map((n) => (
            <NotificationItem key={n.id} notification={n} />
          ))}
        </>
      )}
      {olderItems.length > 0 && (
        <>
          <Typography variant="label" color="secondary" className="mb-3 mt-4">
            THIS WEEK
          </Typography>
          {olderItems.map((n) => (
            <NotificationItem key={n.id} notification={n} />
          ))}
        </>
      )}
    </View>
  );
}

// ============================================================================
// Notification Item
// ============================================================================

function NotificationItem({ notification }: { notification: Notification }) {
  const router = useRouter();
  const markRead = useMarkNotificationRead();
  const isUnread = !notification.readAt;

  const iconMap: Record<string, keyof typeof MaterialIcons.glyphMap> = {
    EVENT_INVITATION: 'mail',
    EVENT_JOIN: 'person-add',
    EVENT_UPDATED: 'route',
    EVENT_REMINDER: 'notifications',
  };
  const icon = iconMap[notification.type] ?? 'notifications';

  const timeAgo = getTimeAgo(notification.createdAt);

  function handlePress() {
    if (isUnread) {
      markRead.mutate(notification.id);
    }
    if (notification.eventId) {
      router.push(`/event/${notification.eventId}`);
    }
  }

  return (
    <Pressable
      className="flex-row items-start gap-3 py-3 border-b border-gray-50 dark:border-gray-800"
      onPress={handlePress}
    >
      {isUnread && (
        <View className="w-2 h-2 rounded-full bg-brand-orange mt-2" />
      )}
      <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center">
        <MaterialIcons name={icon} size={20} color="#3b82f6" />
      </View>
      <View className="flex-1">
        <Typography variant="bodySmall" className="font-sans-medium">
          {notification.title}
        </Typography>
        <Typography variant="caption" color="secondary" className="mt-0.5">
          {timeAgo}
        </Typography>
      </View>
      <Pressable onPress={handlePress}>
        <Typography variant="bodySmall" color="orange" className="font-sans-semibold">
          View
        </Typography>
      </Pressable>
    </Pressable>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function getTimeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD} day${diffD > 1 ? 's' : ''} ago`;
}

function ActivityLoadingState() {
  return (
    <View className="px-4 pt-4 gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <View key={i} className="flex-row items-center gap-3">
          <Skeleton width={40} height={40} borderRadius={12} />
          <View className="flex-1 gap-1">
            <Skeleton width="80%" height={14} borderRadius={4} />
            <Skeleton width="40%" height={12} borderRadius={4} />
          </View>
        </View>
      ))}
    </View>
  );
}
