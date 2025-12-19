import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MapView, {Marker, PROVIDER_DEFAULT} from 'react-native-maps';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors, typography, spacing} from '@config/theme';
import {useShopOwnerStore} from '@store/shopStore';

const {width, height} = Dimensions.get('window');

// Manila coordinates
const MANILA_REGION = {
  latitude: 14.5995,
  longitude: 120.9842,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

// Generate simulated locations around Manila for therapists
const generateLocation = (index: number) => {
  const locations = [
    {latitude: 14.5547, longitude: 121.0244}, // BGC
    {latitude: 14.5595, longitude: 120.9915}, // Makati
    {latitude: 14.6091, longitude: 121.0223}, // Ortigas
    {latitude: 14.5378, longitude: 121.0014}, // Pasig
    {latitude: 14.5764, longitude: 121.0851}, // Eastwood
    {latitude: 14.5176, longitude: 120.9822}, // Pasay
    {latitude: 14.6507, longitude: 121.0495}, // QC
    {latitude: 14.5896, longitude: 120.9747}, // Manila
    {latitude: 14.5243, longitude: 121.0194}, // Taguig
    {latitude: 14.6760, longitude: 121.0437}, // Quezon City
  ];
  return locations[index % locations.length];
};

interface TherapistMarker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  status: string;
  completedBookings: number;
  rating: number;
}

export function TherapistMapScreen() {
  const mapRef = useRef<MapView>(null);
  const {therapists, isLoading, fetchTherapists} = useShopOwnerStore();
  const [selectedTherapist, setSelectedTherapist] = useState<TherapistMarker | null>(null);
  const [filter, setFilter] = useState<'all' | 'online' | 'offline'>('all');

  useEffect(() => {
    fetchTherapists();
  }, []);

  // Convert therapists to markers with locations (simulated for demo)
  const markers: TherapistMarker[] = therapists.map((t, index) => {
    const location = generateLocation(index);
    return {
      id: t.id,
      name: `${t.user?.firstName} ${t.user?.lastName}`,
      latitude: location.latitude,
      longitude: location.longitude,
      status: t.onlineStatus || 'OFFLINE',
      completedBookings: t.completedBookings || 0,
      rating: t.rating || 0,
    };
  });

  const filteredMarkers = markers.filter(m => {
    if (filter === 'all') return true;
    if (filter === 'online') return m.status === 'ONLINE';
    return m.status !== 'ONLINE';
  });

  const onlineCount = markers.filter(m => m.status === 'ONLINE').length;
  const offlineCount = markers.filter(m => m.status !== 'ONLINE').length;

  const fitToMarkers = () => {
    if (mapRef.current && filteredMarkers.length > 0) {
      mapRef.current.fitToCoordinates(
        filteredMarkers.map(m => ({latitude: m.latitude, longitude: m.longitude})),
        {
          edgePadding: {top: 100, right: 50, bottom: 200, left: 50},
          animated: true,
        }
      );
    }
  };

  useEffect(() => {
    const timer = setTimeout(fitToMarkers, 500);
    return () => clearTimeout(timer);
  }, [filteredMarkers.length]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading therapists...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={MANILA_REGION}
        showsUserLocation
        showsMyLocationButton={false}>
        {filteredMarkers.map(marker => (
          <Marker
            key={marker.id}
            coordinate={{latitude: marker.latitude, longitude: marker.longitude}}
            onPress={() => setSelectedTherapist(marker)}>
            <View style={[
              styles.markerContainer,
              marker.status === 'ONLINE' ? styles.markerOnline : styles.markerOffline,
            ]}>
              <Text style={styles.markerText}>
                {marker.name.charAt(0)}
              </Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}>
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All ({markers.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'online' && styles.filterButtonActive]}
          onPress={() => setFilter('online')}>
          <View style={styles.onlineDot} />
          <Text style={[styles.filterText, filter === 'online' && styles.filterTextActive]}>
            Online ({onlineCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'offline' && styles.filterButtonActive]}
          onPress={() => setFilter('offline')}>
          <View style={styles.offlineDot} />
          <Text style={[styles.filterText, filter === 'offline' && styles.filterTextActive]}>
            Offline ({offlineCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Fit to Markers Button */}
      <TouchableOpacity style={styles.fitButton} onPress={fitToMarkers}>
        <Icon name="locate" size={22} color={colors.primary} />
      </TouchableOpacity>

      {/* Selected Therapist Card */}
      {selectedTherapist && (
        <View style={styles.therapistCard}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedTherapist(null)}>
            <Icon name="close" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.therapistHeader}>
            <View style={[
              styles.therapistAvatar,
              selectedTherapist.status === 'ONLINE' && styles.avatarOnline,
            ]}>
              <Text style={styles.avatarText}>
                {selectedTherapist.name.charAt(0)}
              </Text>
            </View>
            <View style={styles.therapistInfo}>
              <Text style={styles.therapistName}>{selectedTherapist.name}</Text>
              <View style={styles.statusRow}>
                <View style={[
                  styles.statusDot,
                  selectedTherapist.status === 'ONLINE' ? styles.dotOnline : styles.dotOffline,
                ]} />
                <Text style={styles.statusText}>{selectedTherapist.status}</Text>
              </View>
            </View>
          </View>
          <View style={styles.therapistStats}>
            <View style={styles.statItem}>
              <Icon name="star" size={16} color={colors.warning} />
              <Text style={styles.statValue}>{selectedTherapist.rating.toFixed(1)}</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.statValue}>{selectedTherapist.completedBookings} bookings</Text>
            </View>
          </View>
        </View>
      )}

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.dotOnline]} />
          <Text style={styles.legendText}>Online</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.dotOffline]} />
          <Text style={styles.legendText}>Offline</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  markerOnline: {
    backgroundColor: colors.success,
  },
  markerOffline: {
    backgroundColor: colors.textSecondary,
  },
  markerText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  filterContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4,
  },
  filterButtonActive: {
    backgroundColor: colors.primary + '15',
  },
  filterText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  offlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textSecondary,
  },
  fitButton: {
    position: 'absolute',
    top: 80,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  therapistCard: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  therapistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  therapistAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarOnline: {
    borderWidth: 3,
    borderColor: colors.success,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  therapistInfo: {
    flex: 1,
  },
  therapistName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotOnline: {
    backgroundColor: colors.success,
  },
  dotOffline: {
    backgroundColor: colors.textSecondary,
  },
  statusText: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  therapistStats: {
    flexDirection: 'row',
    gap: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    ...typography.body,
    color: colors.text,
  },
  legend: {
    position: 'absolute',
    bottom: 30,
    left: 16,
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 10,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
