import {create} from 'zustand';
import Geolocation from '@react-native-community/geolocation';
import {providersApi} from '@api';
import {LOCATION_UPDATE_INTERVAL} from '@config/constants';

interface StatusState {
  isOnline: boolean;
  currentLocation: {latitude: number; longitude: number} | null;
  locationWatchId: number | null;
  isUpdating: boolean;
  error: string | null;

  goOnline: () => Promise<void>;
  goOffline: () => Promise<void>;
  startLocationTracking: () => void;
  stopLocationTracking: () => void;
  updateLocation: () => Promise<void>;
  clearError: () => void;
}

export const useStatusStore = create<StatusState>((set, get) => ({
  isOnline: false,
  currentLocation: null,
  locationWatchId: null,
  isUpdating: false,
  error: null,

  goOnline: async () => {
    set({isUpdating: true, error: null});
    try {
      await providersApi.updateStatus(true);
      set({isOnline: true, isUpdating: false});

      // Start location tracking
      get().startLocationTracking();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to go online';
      set({error: message, isUpdating: false});
      throw error;
    }
  },

  goOffline: async () => {
    set({isUpdating: true, error: null});
    try {
      await providersApi.updateStatus(false);
      set({isOnline: false, isUpdating: false});

      // Stop location tracking
      get().stopLocationTracking();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to go offline';
      set({error: message, isUpdating: false});
      throw error;
    }
  },

  startLocationTracking: () => {
    const {locationWatchId} = get();

    // Already tracking
    if (locationWatchId !== null) {
      return;
    }

    const watchId = Geolocation.watchPosition(
      position => {
        const {latitude, longitude} = position.coords;
        set({currentLocation: {latitude, longitude}});

        // Send to server
        providersApi.updateLocation(latitude, longitude).catch(console.error);
      },
      error => {
        console.error('Location error:', error);
        set({error: error.message});
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 50, // meters
        interval: LOCATION_UPDATE_INTERVAL,
        fastestInterval: LOCATION_UPDATE_INTERVAL / 2,
      },
    );

    set({locationWatchId: watchId});
  },

  stopLocationTracking: () => {
    const {locationWatchId} = get();
    if (locationWatchId !== null) {
      Geolocation.clearWatch(locationWatchId);
      set({locationWatchId: null});
    }
  },

  updateLocation: async () => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        async position => {
          const {latitude, longitude} = position.coords;
          set({currentLocation: {latitude, longitude}});

          try {
            await providersApi.updateLocation(latitude, longitude);
            resolve();
          } catch (error) {
            reject(error);
          }
        },
        error => {
          set({error: error.message});
          reject(error);
        },
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
    });
  },

  clearError: () => set({error: null}),
}));
