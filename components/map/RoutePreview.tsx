import { View, Pressable } from 'react-native';
import { Typography } from '@/components/ui';
import { type EventRoute, decodePolyline, calculateBounds } from '@/lib/api/routes/types';

// ============================================================================
// Types
// ============================================================================

interface RoutePreviewProps {
  route: EventRoute;
  onPress?: () => void;
}

interface RouteInfoCardProps {
  routes: EventRoute[];
  onRoutePress?: (route: EventRoute) => void;
}

// ============================================================================
// Single Route Preview
// ============================================================================

/**
 * Displays a single route with distance, type, and preview.
 * When react-native-maps is installed, this can display the actual polyline.
 *
 * TODO: Replace placeholder with actual map when react-native-maps is available:
 * npm install react-native-maps
 */
export function RoutePreview({ route, onPress }: RoutePreviewProps) {
  // Decode polyline to get coordinates
  const coordinates = decodePolyline(route.encodedPolyline);
  const bounds = calculateBounds(coordinates);

  const distanceKm = (route.distanceMeters / 1000).toFixed(1);
  const routeTypeLabel = getRouteTypeLabel(route.type);

  return (
    <Pressable
      onPress={onPress}
      className="bg-white dark:bg-secondary-800 rounded-xl overflow-hidden border border-secondary-200 dark:border-secondary-700"
    >
      {/* Route Preview Placeholder */}
      <View className="h-32 bg-secondary-100 dark:bg-secondary-700 items-center justify-center">
        {/* Simple polyline representation using dots */}
        <View className="flex-row items-center">
          <Typography className="text-2xl">🗺️</Typography>
        </View>
        <Typography variant="caption" color="muted" className="mt-2">
          {coordinates.length} points
        </Typography>

        {/* Show center coordinates if available */}
        {bounds && (
          <Typography variant="caption" color="muted" className="mt-1">
            Centre: {bounds.centerLat.toFixed(4)}, {bounds.centerLng.toFixed(4)}
          </Typography>
        )}
      </View>

      {/* Route Info */}
      <View className="p-4">
        <View className="flex-row items-center justify-between mb-2">
          <Typography className="font-semibold flex-1" numberOfLines={1}>
            {route.name}
          </Typography>
          {routeTypeLabel && (
            <View className="bg-secondary-100 dark:bg-secondary-600 px-2 py-0.5 rounded-full ml-2">
              <Typography variant="caption">{routeTypeLabel}</Typography>
            </View>
          )}
        </View>

        <View className="flex-row items-center">
          <Typography className="mr-1">📏</Typography>
          <Typography variant="bodySmall" color="muted">
            {distanceKm} km
          </Typography>
        </View>
      </View>
    </Pressable>
  );
}

// ============================================================================
// Route Info Card (for multiple routes)
// ============================================================================

export function RouteInfoCard({ routes, onRoutePress }: RouteInfoCardProps) {
  if (routes.length === 0) {
    return null;
  }

  return (
    <View className="mb-6">
      <Typography variant="label" className="mb-3">
        Parcours ({routes.length})
      </Typography>

      {routes.map((route, index) => (
        <View key={route.id} className={index > 0 ? 'mt-3' : ''}>
          <RoutePreview
            route={route}
            onPress={() => onRoutePress?.(route)}
          />

          {/* Route stats */}
          <View className="flex-row mt-2 px-1">
            <View className="flex-1">
              <Typography variant="caption" color="muted">Distance</Typography>
              <Typography variant="bodySmall">
                {(route.distanceMeters / 1000).toFixed(1)} km
              </Typography>
            </View>

            {route.type && (
              <View className="flex-1">
                <Typography variant="caption" color="muted">Type</Typography>
                <Typography variant="bodySmall">
                  {getRouteTypeLabel(route.type)}
                </Typography>
              </View>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function getRouteTypeLabel(type: string | null): string | null {
  switch (type) {
    case 'LOOP':
      return 'Boucle';
    case 'OUT_AND_BACK':
      return 'Aller-retour';
    case 'POINT_TO_POINT':
      return 'Point a point';
    default:
      return null;
  }
}
