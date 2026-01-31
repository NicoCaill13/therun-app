import { useCallback, useState } from 'react';
import {
  View,
  Modal,
  Pressable,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Typography, Button } from '@/components/ui';
import {
  useParticipantsSummary,
  useUpdateSelection,
  type ParticipantsByGroup,
} from '@/lib/api';

// ============================================================================
// Types
// ============================================================================

interface PaceGroupSelectorProps {
  eventId: string;
  currentGroupId: string | null;
  currentGroupLabel?: string | null;
  disabled?: boolean;
}

// ============================================================================
// Group Item
// ============================================================================

interface GroupItemProps {
  group: ParticipantsByGroup;
  isSelected: boolean;
  onSelect: (groupId: string) => void;
}

function GroupItem({ group, isSelected, onSelect }: GroupItemProps) {
  return (
    <Pressable
      onPress={() => onSelect(group.eventGroupId)}
      className={`flex-row items-center justify-between p-4 mb-2 rounded-xl border ${
        isSelected
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
          : 'border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800'
      }`}
    >
      <View className="flex-1">
        <Typography className={isSelected ? 'font-semibold text-primary-700 dark:text-primary-400' : ''}>
          {group.label}
        </Typography>
        <Typography variant="caption" color="muted" className="mt-0.5">
          {group.goingCount} participant{group.goingCount > 1 ? 's' : ''}
        </Typography>
      </View>

      {isSelected && (
        <View className="w-6 h-6 rounded-full bg-primary-500 items-center justify-center">
          <Typography className="text-white text-sm">✓</Typography>
        </View>
      )}
    </Pressable>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function PaceGroupSelector({
  eventId,
  currentGroupId,
  currentGroupLabel,
  disabled = false,
}: PaceGroupSelectorProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(currentGroupId);

  const { data: summary, isLoading: isSummaryLoading } = useParticipantsSummary(eventId);
  const { mutate: updateSelection, isPending: isUpdating } = useUpdateSelection();

  const handleOpenModal = useCallback(() => {
    setSelectedGroupId(currentGroupId);
    setIsModalVisible(true);
  }, [currentGroupId]);

  const handleCloseModal = useCallback(() => {
    setIsModalVisible(false);
  }, []);

  const handleSelectGroup = useCallback((groupId: string) => {
    setSelectedGroupId(groupId === selectedGroupId ? null : groupId);
  }, [selectedGroupId]);

  const handleConfirm = useCallback(() => {
    updateSelection(
      { eventId, input: { eventGroupId: selectedGroupId } },
      {
        onSuccess: () => {
          setIsModalVisible(false);
        },
      }
    );
  }, [eventId, selectedGroupId, updateSelection]);

  const groups = summary?.byGroup ?? [];
  const hasGroups = groups.length > 0;

  // If no groups available, don't render anything
  if (!hasGroups && !isSummaryLoading) {
    return null;
  }

  const displayLabel = currentGroupLabel ?? 'Selectionner un groupe';

  return (
    <>
      {/* Trigger Button */}
      <Pressable
        onPress={handleOpenModal}
        disabled={disabled || isSummaryLoading}
        className={`flex-row items-center justify-between p-4 rounded-xl border ${
          currentGroupId
            ? 'border-primary-300 dark:border-primary-700 bg-primary-50 dark:bg-primary-900/20'
            : 'border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800'
        } ${disabled ? 'opacity-50' : ''}`}
      >
        <View className="flex-row items-center">
          <Typography className="mr-2">🏃</Typography>
          <View>
            <Typography variant="caption" color="muted">Groupe d'allure</Typography>
            <Typography className={currentGroupId ? 'font-medium' : ''}>
              {isSummaryLoading ? 'Chargement...' : displayLabel}
            </Typography>
          </View>
        </View>
        <Typography color="muted">›</Typography>
      </Pressable>

      {/* Selection Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModal}
      >
        <View className="flex-1 bg-white dark:bg-secondary-900">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-secondary-100 dark:border-secondary-800">
            <Button variant="ghost" onPress={handleCloseModal}>
              Annuler
            </Button>
            <Typography variant="label">Groupe d'allure</Typography>
            <Button
              variant="ghost"
              onPress={handleConfirm}
              isLoading={isUpdating}
              disabled={isUpdating}
            >
              Valider
            </Button>
          </View>

          {/* Content */}
          <View className="flex-1 p-4">
            <Typography color="muted" className="mb-4">
              Choisissez votre groupe d'allure pour cette sortie. Cela aide les organisateurs a mieux gerer les differents niveaux.
            </Typography>

            {isSummaryLoading ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#16a34a" />
              </View>
            ) : (
              <>
                {/* Option to remove selection */}
                {currentGroupId && (
                  <Pressable
                    onPress={() => setSelectedGroupId(null)}
                    className={`flex-row items-center justify-between p-4 mb-2 rounded-xl border ${
                      selectedGroupId === null
                        ? 'border-secondary-400 bg-secondary-50 dark:bg-secondary-800'
                        : 'border-secondary-200 dark:border-secondary-700'
                    }`}
                  >
                    <Typography color={selectedGroupId === null ? 'default' : 'muted'}>
                      Aucun groupe
                    </Typography>
                    {selectedGroupId === null && (
                      <View className="w-6 h-6 rounded-full bg-secondary-400 items-center justify-center">
                        <Typography className="text-white text-sm">✓</Typography>
                      </View>
                    )}
                  </Pressable>
                )}

                <FlatList
                  data={groups}
                  keyExtractor={(item) => item.eventGroupId}
                  renderItem={({ item }) => (
                    <GroupItem
                      group={item}
                      isSelected={selectedGroupId === item.eventGroupId}
                      onSelect={handleSelectGroup}
                    />
                  )}
                  showsVerticalScrollIndicator={false}
                />
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}
