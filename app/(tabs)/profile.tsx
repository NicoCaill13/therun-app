import { View, Pressable, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '@/lib/auth';
import { useMe } from '@/lib/api/me';
import { Typography, Badge, Avatar, Button, Skeleton } from '@/components/ui';

// ============================================================================
// Profile Screen (maquette: user_profile_screen)
// ============================================================================

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const paddingTop = Platform.OS === 'web' ? 16 : insets.top;
  const { isAuthenticated, signOut } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) return <UnauthenticatedProfile />;

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <View className={Platform.OS === 'web' ? 'max-w-md mx-auto w-full flex-1' : 'flex-1'}>
        {/* Header */}
        <View
          className="flex-row items-center justify-between px-4 pb-2"
          style={{ paddingTop: paddingTop + 8 }}
        >
          <Pressable
            className="w-10 h-10 items-center justify-center"
            onPress={() => router.canGoBack() && router.back()}
          >
            <MaterialIcons name="arrow-back-ios" size={20} color="#0a181e" />
          </Pressable>
          <Typography variant="h4" className="font-sans-bold">
            Profile
          </Typography>
          <Pressable className="w-10 h-10 items-center justify-center">
            <MaterialIcons name="settings" size={22} color="#0a181e" />
          </Pressable>
        </View>

        <AuthenticatedProfileContent onSignOut={signOut} />
      </View>
    </View>
  );
}

// ============================================================================
// Authenticated Profile Content
// ============================================================================

function AuthenticatedProfileContent({ onSignOut }: { onSignOut: () => void }) {
  const { data: profile, isLoading } = useMe();
  const router = useRouter();

  if (isLoading) return <ProfileLoadingState />;
  if (!profile) return null;

  const isPremium = profile.plan === 'PREMIUM';

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="items-center px-4 pt-6 pb-4">
        <Avatar name={profile.displayName} size="xl" />
        <Typography variant="h2" className="mt-4">
          {profile.displayName}
        </Typography>
        {isPremium && <Badge variant="orange" label="PRO MEMBER" className="mt-2" />}
      </View>

      {/* Stats */}
      <View className="flex-row items-center justify-center gap-6 py-4 mx-4 border-t border-b border-gray-100 dark:border-gray-800">
        <StatItem value="--" label="RUNS" />
        <StatItem value="--" label="ROUTES" />
        <StatItem value="--" label="TOTAL" />
      </View>

      {/* Menu */}
      <View className="px-4 pt-4 gap-1">
        <ProfileMenuItem
          icon="event"
          label="My Events"
          onPress={() => router.push('/(tabs)')}
        />
        <ProfileMenuItem icon="bookmarks" label="Saved Routes" />
        <ProfileMenuItem icon="speed" label="Pace Preferences" />
        <ProfileMenuItem
          icon="notifications"
          label="Notifications"
          onPress={() => router.push('/(tabs)/activity')}
        />
        <ProfileMenuItem icon="manage-accounts" label="Account Settings" />
      </View>

      {/* Sign out */}
      <View className="px-4 pt-8 pb-6">
        <Button variant="outline" onPress={onSignOut}>
          Sign out
        </Button>
      </View>

      <Typography variant="caption" color="muted" className="text-center pb-8">
        THE RUN V1.0.0
      </Typography>
    </ScrollView>
  );
}

// ============================================================================
// Subcomponents
// ============================================================================

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <View className="items-center">
      <Typography variant="h3">{value}</Typography>
      <Typography variant="caption" color="secondary" className="mt-1">
        {label}
      </Typography>
    </View>
  );
}

function ProfileMenuItem({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      className="flex-row items-center gap-3 py-4 border-b border-gray-50 dark:border-gray-800"
      onPress={onPress}
    >
      <View className="w-10 h-10 rounded-xl bg-brand-orange-bg items-center justify-center">
        <MaterialIcons name={icon} size={20} color="#FF5A1F" />
      </View>
      <Typography variant="body" className="flex-1 font-sans-medium">
        {label}
      </Typography>
      <MaterialIcons name="chevron-right" size={20} color="#9ca3af" />
    </Pressable>
  );
}

function UnauthenticatedProfile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const paddingTop = Platform.OS === 'web' ? 16 : insets.top;

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <View
        className={`flex-1 items-center justify-center px-6 ${
          Platform.OS === 'web' ? 'max-w-md mx-auto w-full' : ''
        }`}
        style={{ paddingTop }}
      >
        <MaterialIcons name="person-outline" size={64} color="#d1d5db" />
        <Typography variant="h2" className="mt-4 text-center">
          Join THE RUN
        </Typography>
        <Typography variant="body" color="secondary" className="mt-2 text-center mb-8">
          Create an account to organize and join group runs.
        </Typography>
        <Button onPress={() => router.push('/join')}>Get started</Button>
      </View>
    </View>
  );
}

function ProfileLoadingState() {
  return (
    <View className="items-center px-4 pt-10 gap-4">
      <Skeleton width={80} height={80} borderRadius={40} />
      <Skeleton width={160} height={24} borderRadius={6} />
      <Skeleton width={100} height={20} borderRadius={10} />
      <View className="flex-row gap-6 mt-4">
        <Skeleton width={60} height={40} borderRadius={6} />
        <Skeleton width={60} height={40} borderRadius={6} />
        <Skeleton width={60} height={40} borderRadius={6} />
      </View>
    </View>
  );
}
