import { View, Pressable, Platform, ScrollView, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useParticipants } from '@/lib/api/participants';
import { Header, Typography, Avatar, Badge, Button, Skeleton } from '@/components/ui';
import type { ParticipantItem } from '@/lib/api/participants';

// ============================================================================
// Participants List (maquette: participants_list_view)
// ============================================================================

export default function ParticipantsScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { data, isLoading } = useParticipants(eventId);

  const items = data?.items ?? [];

  const organiser = items.find((p) => p.roleInEvent === 'ORGANISER');
  const pacers = items.filter((p) => p.roleInEvent === 'ENCADRANT');
  const participants = items.filter(
    (p) => p.roleInEvent === 'PARTICIPANT' && p.status === 'GOING'
  );

  const filtered = search
    ? [...(organiser ? [organiser] : []), ...pacers, ...participants].filter((p) =>
        p.displayName.toLowerCase().includes(search.toLowerCase())
      )
    : null;

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <View className={Platform.OS === 'web' ? 'max-w-md mx-auto w-full flex-1' : 'flex-1'}>
        <Header
          title="Participants"
          rightAction={
            <Pressable className="w-10 h-10 items-center justify-center">
              <MaterialIcons name="share" size={20} color="#0a181e" />
            </Pressable>
          }
        />

        {/* Search */}
        <View className="px-4 pb-2">
          <View className="flex-row items-center h-12 rounded-xl bg-white dark:bg-gray-900 border border-border-grey px-3 gap-2">
            <MaterialIcons name="search" size={20} color="#9ca3af" />
            <TextInput
              placeholder="Search runners..."
              placeholderTextColor="#9ca3af"
              value={search}
              onChangeText={setSearch}
              className="flex-1 text-primary dark:text-white font-sans"
              style={Platform.OS === 'web' ? { outlineStyle: 'none' } : undefined}
            />
          </View>
        </View>

        {isLoading ? (
          <ParticipantsLoading />
        ) : (
          <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
            {filtered ? (
              // Search results
              filtered.map((p) => (
                <ParticipantRow key={p.participantId} participant={p} />
              ))
            ) : (
              <>
                {/* Organiser */}
                {organiser && (
                  <>
                    <Typography variant="label" color="secondary" className="mt-4 mb-2">
                      ORGANIZER
                    </Typography>
                    <ParticipantRow participant={organiser} showBadge="LEAD" />
                  </>
                )}

                {/* Pacers */}
                {pacers.length > 0 && (
                  <>
                    <Typography variant="label" color="secondary" className="mt-4 mb-2">
                      PACERS ({pacers.length})
                    </Typography>
                    {pacers.map((p) => (
                      <ParticipantRow key={p.participantId} participant={p} showBadge="PACER" />
                    ))}
                  </>
                )}

                {/* Participants */}
                <Typography variant="label" color="secondary" className="mt-4 mb-2">
                  PARTICIPANTS ({participants.length})
                </Typography>
                {participants.map((p) => (
                  <ParticipantRow key={p.participantId} participant={p} />
                ))}
              </>
            )}
            <View className="h-24" />
          </ScrollView>
        )}

        {/* Bottom: Invite more */}
        <View className="px-4 pb-8 pt-2">
          <Button
            onPress={() => router.push(`/event/invite/${eventId}` as never)}
            leftIcon={<MaterialIcons name="person-add" size={18} color="#ffffff" className="mr-2" />}
          >
            Invite more
          </Button>
        </View>
      </View>
    </View>
  );
}

function ParticipantRow({
  participant,
  showBadge,
}: {
  participant: ParticipantItem;
  showBadge?: string;
}) {
  return (
    <View className="flex-row items-center gap-3 py-3 border-b border-gray-50 dark:border-gray-800">
      <Avatar name={participant.displayName} size="md" />
      <View className="flex-1">
        <Typography variant="body" className="font-sans-medium">
          {participant.displayName}
        </Typography>
        {showBadge && (
          <View className="flex-row gap-1 mt-0.5">
            <Badge variant="orange" label={showBadge} />
            {participant.eventGroup && (
              <Typography variant="caption" color="secondary">
                {participant.eventGroup.label}
              </Typography>
            )}
          </View>
        )}
      </View>
      {/* Pace display placeholder */}
    </View>
  );
}

function ParticipantsLoading() {
  return (
    <View className="px-4 pt-4 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <View key={i} className="flex-row items-center gap-3">
          <Skeleton width={40} height={40} borderRadius={20} />
          <View className="flex-1 gap-1">
            <Skeleton width="60%" height={16} borderRadius={4} />
            <Skeleton width="30%" height={12} borderRadius={4} />
          </View>
        </View>
      ))}
    </View>
  );
}
