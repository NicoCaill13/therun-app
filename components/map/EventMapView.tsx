import { useMemo } from 'react';
import { View, Platform } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Typography } from '@/components/ui';
import {
  decodePolyline,
  calculateBounds,
  type Coordinate,
  type EventRoute,
} from '@/lib/api';
import { EventMapPlaceholder } from './EventMapPlaceholder';

// ============================================================================
// Types
// ============================================================================

interface EventMapViewProps {
  locationName: string | null;
  locationAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  route?: EventRoute | null;
  routeName?: string | null;
}

const DEFAULT_DELTA = 0.008;
const MIN_DELTA = 0.004;
const BOUNDS_PADDING = 1.3;

// ============================================================================
// Event Map View (MapView + Polyline + Marker when route available)
// ============================================================================

/**
 * Displays event location with optional route polyline on an in-app map.
 * When a route with encodedPolyline is provided and platform is native, renders MapView
 * with Polyline and Marker. Otherwise falls back to EventMapPlaceholder (open external map).
 */
export function EventMapView({
  locationName,
  locationAddress,
  latitude,
  longitude,
  route,
  routeName,
}: EventMapViewProps) {
  const hasCoordinates = latitude !== null && longitude !== null;
  const hasRouteWithPolyline = Boolean(route?.encodedPolyline);
  const useNativeMap = hasRouteWithPolyline && hasCoordinates && Platform.OS !== 'web';

  const { coordinates, region } = useMemo(() => {
    if (!route?.encodedPolyline) {
      return { coordinates: [] as Coordinate[], region: null };
    }
    const coords = decodePolyline(route.encodedPolyline);
    const bounds = calculateBounds(coords);
    if (coords.length === 0 || !bounds) {
      return {
        coordinates: coords,
        region:
          latitude != null && longitude != null
            ? {
                latitude,
                longitude,
                latitudeDelta: DEFAULT_DELTA,
                longitudeDelta: DEFAULT_DELTA,
              }
            : null,
      };
    }
    const latSpan = Math.max((bounds.maxLat - bounds.minLat) * BOUNDS_PADDING, MIN_DELTA);
    const lngSpan = Math.max((bounds.maxLng - bounds.minLng) * BOUNDS_PADDING, MIN_DELTA);
    return {
      coordinates: coords,
      region: {
        latitude: bounds.centerLat,
        longitude: bounds.centerLng,
        latitudeDelta: latSpan,
        longitudeDelta: lngSpan,
      },
    };
  }, [route?.encodedPolyline, latitude, longitude]);

  if (!useNativeMap) {
    return (
      <EventMapPlaceholder
        locationName={locationName}
        locationAddress={locationAddress}
        latitude={latitude}
        longitude={longitude}
        showRoute={hasRouteWithPolyline}
        routeName={routeName ?? route?.name ?? undefined}
      />
    );
  }

  if (!region) {
    return (
      <EventMapPlaceholder
        locationName={locationName}
        locationAddress={locationAddress}
        latitude={latitude}
        longitude={longitude}
        showRoute
        routeName={routeName ?? route?.name ?? undefined}
      />
    );
  }

  const polylineCoordinates = coordinates.map((c) => ({
    latitude: c.latitude,
    longitude: c.longitude,
  }));

  return (
    <View className="mb-6 overflow-hidden rounded-xl border border-borderGrey dark:border-secondary-700">
      <MapView
        style={{ height: 200, width: '100%' }}
        initialRegion={region}
        scrollEnabled
        zoomEnabled
        pitchEnabled={false}
        rotateEnabled={false}
      >
        {polylineCoordinates.length > 0 && (
          <Polyline
            coordinates={polylineCoordinates}
            strokeColor="#16a34a"
            strokeWidth={4}
            lineCap="round"
            lineJoin="round"
          />
        )}
        {hasCoordinates && (
          <Marker
            coordinate={{ latitude: latitude!, longitude: longitude! }}
            title={locationName ?? undefined}
            description={locationAddress ?? undefined}
            pinColor="#16a34a"
          />
        )}
      </MapView>
      <View className="p-4 border-t border-borderGrey dark:border-secondary-700">
        {locationName && (
          <Typography className="font-medium mb-1">{locationName}</Typography>
        )}
        {locationAddress && (
          <Typography variant="bodySmall" color="muted" className="mb-1">
            {locationAddress}
          </Typography>
        )}
        {routeName && (
          <View className="mt-2 flex-row items-center">
            <Typography className="mr-2 text-base">🗺️</Typography>
            <Typography variant="caption" color="muted">
              Parcours
            </Typography>
            <Typography variant="bodySmall" className="ml-2">
              {routeName}
            </Typography>
          </View>
        )}
      </View>
    </View>
  );
}
