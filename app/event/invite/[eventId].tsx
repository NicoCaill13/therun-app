import { View, Pressable, Platform, ScrollView, TextInput } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useInviteSearch, useInviteParticipant } from '@/lib/api/invitations';
import { useClipboard, useShare } from '@/lib/hooks/platform';
import { WEB_URL } from '@/lib/config/env';
import { useEvent } from '@/lib/api/events';
import { Header, Typography, Avatar, Button, Skeleton } from '@/components/ui';
import type { InviteSearchItem } from '@/lib/api/invitations';

// ============================================================================
// Invite Contacts Screen (maquette: invite_contacts_screen)
// ============================================================================

export default function InviteContactsScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const [query, setQuery] = useState('');
  const { data: eventData } = useEvent(eventId);
  const { data: searchResults, isLoading } = useInviteSearch(eventId ?? '', query);
  const inviteMutation = useInviteParticipant(eventId ?? '');
  const { copy } = useClipboard();
  const share = useShare();
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());

  const eventCode = eventData?.event.eventCode ?? '';
  const shareUrl = `${WEB_URL}/welcome/${eventCode}`;

  function handleInvite(user: InviteSearchItem) {
    inviteMutation.mutate(
      { userId: user.id, role: 'PARTICIPANT' },
      {
        onSuccess: () => {
          setInvitedIds((prev) => new Set([...prev, user.id]));
        },
      }
    );
  }

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <View className={Platform.OS === 'web' ? 'max-w-md mx-auto w-full flex-1' : 'flex-1'}>
        <Header title="INVITE CONTACTS" />

        {/* Search */}
        <View className="px-4 pb-2">
          <View className="flex-row items-center h-12 rounded-xl bg-white dark:bg-gray-900 border border-border-grey px-3 gap-2">
            <MaterialIcons name="search" size={20} color="#9ca3af" />
            <TextInput
              placeholder="Search by name or number"
              placeholderTextColor="#9ca3af"
              value={query}
              onChangeText={setQuery}
              className="flex-1 text-primary dark:text-white font-sans"
              style={Platform.OS === 'web' ? { outlineStyle: 'none' } : undefined}
            />
          </View>
        </View>

        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          {isLoading && query.length >= 2 && (
            <View className="gap-4 pt-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <View key={i} className="flex-row items-center gap-3">
                  <Skeleton width={48} height={48} borderRadius={24} />
                  <View className="flex-1 gap-1">
                    <Skeleton width="50%" height={16} borderRadius={4} />
                    <Skeleton width="40%" height={12} borderRadius={4} />
                  </View>
                </View>
              ))}
            </View>
          )}

          {searchResults?.items && (
            <>
              <Typography variant="label" color="secondary" className="mt-4 mb-2">
                RESULTS
              </Typography>
              {searchResults.items.map((user) => {
                const isInvited = invitedIds.has(user.id);
                return (
                  <View
                    key={user.id}
                    className="flex-row items-center gap-3 py-3 border-b border-gray-50 dark:border-gray-800"
                  >
                    <Avatar
                      name={`${user.firstName} ${user.lastName ?? ''}`.trim()}
                      size="lg"
                    />
                    <View className="flex-1">
                      <Typography variant="body" className="font-sans-medium">
                        {user.firstName} {user.lastName}
                      </Typography>
                      {user.email && (
                        <Typography variant="caption" color="secondary">
                          {user.email}
                        </Typography>
                      )}
                    </View>
                    {isInvited ? (
                      <View className="flex-row items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200">
                        <MaterialIcons name="check" size={14} color="#6b7280" />
                        <Typography variant="bodySmall" color="secondary">
                          Sent
                        </Typography>
                      </View>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        isFullWidth={false}
                        onPress={() => handleInvite(user)}
                      >
                        Invite
                      </Button>
                    )}
                  </View>
                );
              })}
            </>
          )}
          <View className="h-20" />
        </ScrollView>

        {/* Share via section */}
        <View className="px-4 pb-8 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Typography variant="label" color="secondary" className="text-center mb-4">
            SHARE VIA...
          </Typography>
          <View className="flex-row justify-center gap-6">
            <ShareButton
              icon="chat"
              label="SMS"
              onPress={() => share(shareUrl, `Join on THE RUN`)}
            />
            <ShareButton
              icon="forum"
              label="WHATSAPP"
              onPress={() => share(shareUrl, `Join on THE RUN`)}
            />
            <ShareButton
              icon="link"
              label="COPY LINK"
              onPress={() => copy(shareUrl)}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

function ShareButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable className="items-center gap-2" onPress={onPress}>
      <View className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 items-center justify-center">
        <MaterialIcons name={icon} size={24} color="#0a181e" />
      </View>
      <Typography variant="caption" color="secondary" className="font-sans-semibold">
        {label}
      </Typography>
    </Pressable>
  );
}
