import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { ScrollContainer, Typography, H2, Button } from '@/components/ui';
import { LoadingState, ErrorState } from '@/components/states';
import { useProfile } from '@/lib/api/me';
import { useAuth } from '@/lib/auth';

// ============================================================================
// Profile Screen
// ============================================================================

export default function ProfileScreen() {
  const router = useRouter();
  const { logout, isAuthenticated } = useAuth();
  const { data, isLoading, error, refetch } = useProfile({
    enabled: isAuthenticated,
  });

  // Handle loading state
  if (isLoading) {
    return <LoadingState message="Chargement du profil..." hasSafeArea />;
  }

  // Handle error state
  if (error) {
    return (
      <ErrorState
        message={error.message}
        onRetry={refetch}
        hasSafeArea
      />
    );
  }

  // Handle unauthenticated state
  if (!isAuthenticated || !data) {
    return (
      <ScrollContainer padding="lg" hasSafeArea>
        <View className="items-center py-8">
          <View className="w-24 h-24 rounded-full bg-secondary-200 dark:bg-secondary-700 items-center justify-center mb-4">
            <FontAwesome name="user" size={40} color="#9ca3af" />
          </View>
          <H2 className="text-center mb-2">Bienvenue</H2>
          <Typography color="muted" className="text-center mb-6">
            Connectez-vous pour acceder a votre profil
          </Typography>
          <Button variant="primary" size="lg" isFullWidth>
            Se connecter
          </Button>
        </View>
      </ScrollContainer>
    );
  }

  const { user, plan, benefits, usage } = data;
  const displayName = user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Utilisateur';

  return (
    <ScrollContainer padding="lg" hasSafeArea safeAreaEdges={['bottom']}>
      {/* Profile Header */}
      <View className="items-center py-6">
        <View className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900 items-center justify-center mb-4">
          <Typography className="text-4xl text-primary-600 dark:text-primary-400 font-bold">
            {displayName.charAt(0).toUpperCase()}
          </Typography>
        </View>
        <H2 className="text-center">{displayName}</H2>
        {user.email && (
          <Typography color="muted" className="text-center mt-1">
            {user.email}
          </Typography>
        )}
        <PlanBadge plan={plan} />
      </View>

      {/* Quick Actions */}
      <View className="mb-6">
        <Typography className="font-semibold mb-3">Actions rapides</Typography>
        <View className="flex-row gap-3">
          <QuickActionButton
            icon="bell"
            label="Notifications"
            onPress={() => router.push('/notifications')}
          />
          <QuickActionButton
            icon="envelope"
            label="Invitations"
            onPress={() => router.push('/invitations')}
          />
        </View>
      </View>

      {/* Plan & Usage */}
      <View className="mb-6">
        <Typography className="font-semibold mb-3">Mon forfait</Typography>
        <View className="bg-secondary-50 dark:bg-secondary-800 rounded-xl p-4">
          <View className="flex-row justify-between items-center mb-3">
            <Typography>Evenements ce mois</Typography>
            <Typography className="font-semibold">
              {usage.eventsThisMonth} / {benefits.maxEventsPerMonth === -1 ? 'Illimite' : benefits.maxEventsPerMonth}
            </Typography>
          </View>
          <View className="flex-row justify-between items-center mb-3">
            <Typography>Participants max/event</Typography>
            <Typography className="font-semibold">
              {benefits.maxParticipantsPerEvent === -1 ? 'Illimite' : benefits.maxParticipantsPerEvent}
            </Typography>
          </View>
          <View className="h-px bg-secondary-200 dark:bg-secondary-700 my-3" />
          <View className="flex-row flex-wrap gap-2">
            <FeatureBadge label="Routes" enabled={benefits.canCreateRoutes} />
            <FeatureBadge label="Broadcast" enabled={benefits.canBroadcast} />
            <FeatureBadge label="Duplication" enabled={benefits.canDuplicate} />
            <FeatureBadge label="Invitations" enabled={benefits.canInvite} />
          </View>
        </View>
      </View>

      {/* Account Actions */}
      <View className="mb-6">
        <Typography className="font-semibold mb-3">Compte</Typography>
        <MenuButton
          icon="cog"
          label="Parametres"
          onPress={() => {}}
        />
        <MenuButton
          icon="question-circle"
          label="Aide"
          onPress={() => {}}
        />
        <MenuButton
          icon="sign-out"
          label="Deconnexion"
          onPress={logout}
          isDanger
        />
      </View>
    </ScrollContainer>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function PlanBadge({ plan }: { plan: string }) {
  const colors = {
    FREE: 'bg-secondary-200 text-secondary-700',
    PREMIUM: 'bg-amber-100 text-amber-700',
    ENTERPRISE: 'bg-purple-100 text-purple-700',
  };

  const colorClass = colors[plan as keyof typeof colors] || colors.FREE;

  return (
    <View className={`mt-3 px-3 py-1 rounded-full ${colorClass}`}>
      <Typography className="text-sm font-semibold">{plan}</Typography>
    </View>
  );
}

function QuickActionButton({
  icon,
  label,
  onPress,
}: {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      className="flex-1 bg-secondary-50 dark:bg-secondary-800 rounded-xl p-4 items-center active:opacity-70"
      onPress={onPress}
    >
      <FontAwesome name={icon} size={24} color="#16a34a" />
      <Typography className="mt-2 text-sm">{label}</Typography>
    </Pressable>
  );
}

function FeatureBadge({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <View
      className={`px-2 py-1 rounded-md ${
        enabled
          ? 'bg-green-100 dark:bg-green-900'
          : 'bg-secondary-200 dark:bg-secondary-700'
      }`}
    >
      <Typography
        className={`text-xs ${
          enabled
            ? 'text-green-700 dark:text-green-300'
            : 'text-secondary-500'
        }`}
      >
        {enabled ? '✓' : '✗'} {label}
      </Typography>
    </View>
  );
}

function MenuButton({
  icon,
  label,
  onPress,
  isDanger = false,
}: {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  label: string;
  onPress: () => void;
  isDanger?: boolean;
}) {
  return (
    <Pressable
      className="flex-row items-center py-3 border-b border-secondary-100 dark:border-secondary-800 active:opacity-70"
      onPress={onPress}
    >
      <FontAwesome
        name={icon}
        size={20}
        color={isDanger ? '#dc2626' : '#6b7280'}
      />
      <Typography
        className={`ml-3 flex-1 ${isDanger ? 'text-red-600' : ''}`}
      >
        {label}
      </Typography>
      <FontAwesome name="chevron-right" size={14} color="#9ca3af" />
    </Pressable>
  );
}
