import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { Container, Typography, H1, H3 } from '@/components/ui';

/**
 * Event detail screen placeholder.
 * Route: /event/[id]
 *
 * Will be implemented in Phase 1.3 (Écran Détail & Séquence de Cache)
 */
export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <Container hasSafeArea padding="lg">
      <H1 className="mb-4">Détail de la sortie</H1>

      <View
        className="bg-secondary-100 dark:bg-secondary-800 rounded-xl p-4 mb-4"
        accessibilityRole="text"
      >
        <Typography color="muted" className="mb-1">ID de l'événement</Typography>
        <Typography className="font-mono">{id}</Typography>
      </View>

      <View
        className="bg-primary-50 dark:bg-primary-900/30 rounded-xl p-4"
        accessibilityRole="text"
      >
        <H3 className="mb-2">🚧 En construction</H3>
        <Typography color="muted">
          Cette page sera implémentée dans la Phase 1.3 du MVP.
          Elle affichera les détails de l'événement, les participants,
          et la carte du parcours.
        </Typography>
      </View>
    </Container>
  );
}
