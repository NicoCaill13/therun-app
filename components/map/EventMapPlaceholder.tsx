import { useCallback } from 'react';
import { View, Pressable, Platform, Linking, Alert } from 'react-native';
import { Typography } from '@/components/ui';

// ============================================================================
// Types
// ============================================================================

interface EventMapPlaceholderProps {
  locationName: string | null;
  locationAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  showRoute?: boolean;
  routeName?: string;
}

// ============================================================================
// Map Placeholder Component
// ============================================================================

/**
 * Placeholder component for displaying event location.
 * Opens external map app when tapped.
 *
 * TODO: Replace with react-native-maps when installed:
 * npm install react-native-maps
 */
export function EventMapPlaceholder({
  locationName,
  locationAddress,
  latitude,
  longitude,
  showRoute = false,
  routeName,
}: EventMapPlaceholderProps) {
  const hasCoordinates = latitude !== null && longitude !== null;
  const hasLocation = locationName || locationAddress;

  const handleOpenMap = useCallback(async () => {
    if (!hasCoordinates) {
      Alert.alert('Coordonnees manquantes', 'Les coordonnees du lieu ne sont pas disponibles.');
      return;
    }

    // Build map URL based on platform
    const label = encodeURIComponent(locationName || 'Point de RDV');
    let url: string;

    if (Platform.OS === 'ios') {
      // Apple Maps
      url = `maps:0,0?q=${label}@${latitude},${longitude}`;
    } else {
      // Google Maps (Android/Web)
      url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}&query_place_id=${label}`;
    }

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        // Fallback to Google Maps web
        const webUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
        await Linking.openURL(webUrl);
      }
    } catch {
      Alert.alert('Erreur', 'Impossible d\'ouvrir l\'application de carte.');
    }
  }, [hasCoordinates, latitude, longitude, locationName]);

  // Don't render if no location info
  if (!hasLocation && !hasCoordinates) {
    return null;
  }

  return (
    <View className="mb-6">
      {/* Map Preview (placeholder) */}
      <Pressable
        onPress={handleOpenMap}
        disabled={!hasCoordinates}
        className="bg-secondary-100 dark:bg-secondary-800 rounded-xl overflow-hidden"
      >
        {/* Map placeholder image */}
        <View className="h-40 items-center justify-center bg-secondary-200 dark:bg-secondary-700">
          <Typography className="text-4xl mb-2">📍</Typography>
          {hasCoordinates ? (
            <Typography variant="bodySmall" color="muted">
              Appuyez pour ouvrir la carte
            </Typography>
          ) : (
            <Typography variant="bodySmall" color="muted">
              Coordonnees non disponibles
            </Typography>
          )}
        </View>

        {/* Location Info */}
        <View className="p-4">
          <View className="flex-row items-start">
            <View className="flex-1">
              {locationName && (
                <Typography className="font-medium mb-1">{locationName}</Typography>
              )}
              {locationAddress && (
                <Typography variant="bodySmall" color="muted" className="mb-1">
                  {locationAddress}
                </Typography>
              )}
              {hasCoordinates && (
                <Typography variant="caption" color="muted">
                  {formatCoordinates(latitude!, longitude!)}
                </Typography>
              )}
            </View>

            {hasCoordinates && (
              <View className="bg-primary-100 dark:bg-primary-900/30 px-3 py-1.5 rounded-full">
                <Typography variant="bodySmall" className="text-primary-700 dark:text-primary-400">
                  Ouvrir
                </Typography>
              </View>
            )}
          </View>

          {/* Route indicator */}
          {showRoute && routeName && (
            <View className="mt-3 pt-3 border-t border-secondary-200 dark:border-secondary-600">
              <View className="flex-row items-center">
                <Typography className="mr-2">🗺️</Typography>
                <View className="flex-1">
                  <Typography variant="caption" color="muted">Parcours</Typography>
                  <Typography variant="bodySmall">{routeName}</Typography>
                </View>
              </View>
            </View>
          )}
        </View>
      </Pressable>
    </View>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';

  return `${Math.abs(lat).toFixed(5)}° ${latDir}, ${Math.abs(lng).toFixed(5)}° ${lngDir}`;
}
