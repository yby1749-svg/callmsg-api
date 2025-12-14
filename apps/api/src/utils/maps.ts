// ============================================================================
// Google Maps API Service
// ============================================================================

import axios from 'axios';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';
const GOOGLE_MAPS_BASE_URL = 'https://maps.googleapis.com/maps/api';

interface LatLng {
  lat: number;
  lng: number;
}

interface DistanceMatrixResult {
  distance: {
    text: string;
    value: number; // meters
  };
  duration: {
    text: string;
    value: number; // seconds
  };
  durationInTraffic?: {
    text: string;
    value: number; // seconds
  };
}

interface ETAResult {
  distanceMeters: number;
  distanceText: string;
  durationSeconds: number;
  durationMinutes: number;
  durationText: string;
  durationInTrafficSeconds?: number;
  durationInTrafficMinutes?: number;
  durationInTrafficText?: string;
}

interface GeocodingResult {
  formattedAddress: string;
  lat: number;
  lng: number;
  placeId: string;
  components: {
    city?: string;
    province?: string;
    country?: string;
    postalCode?: string;
  };
}

/**
 * Calculate ETA between two points using Google Distance Matrix API
 */
export async function calculateETA(
  origin: LatLng,
  destination: LatLng,
  departureTime?: Date
): Promise<ETAResult | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    console.log('[Maps] Google Maps API key not configured');
    // Return mock data for development
    return {
      distanceMeters: 5000,
      distanceText: '5.0 km',
      durationSeconds: 900,
      durationMinutes: 15,
      durationText: '15 mins',
    };
  }

  try {
    const params: Record<string, string> = {
      origins: `${origin.lat},${origin.lng}`,
      destinations: `${destination.lat},${destination.lng}`,
      key: GOOGLE_MAPS_API_KEY,
      mode: 'driving',
      language: 'en',
      units: 'metric',
    };

    // Add departure time for traffic-aware results
    if (departureTime) {
      params.departure_time = Math.floor(departureTime.getTime() / 1000).toString();
      params.traffic_model = 'best_guess';
    }

    const response = await axios.get(`${GOOGLE_MAPS_BASE_URL}/distancematrix/json`, {
      params,
    });

    const data = response.data;

    if (data.status !== 'OK' || !data.rows?.[0]?.elements?.[0]) {
      console.error('[Maps] Distance Matrix API error:', data.status);
      return null;
    }

    const element: DistanceMatrixResult = data.rows[0].elements[0];

    if (element.distance === undefined || element.duration === undefined) {
      return null;
    }

    const result: ETAResult = {
      distanceMeters: element.distance.value,
      distanceText: element.distance.text,
      durationSeconds: element.duration.value,
      durationMinutes: Math.ceil(element.duration.value / 60),
      durationText: element.duration.text,
    };

    // Add traffic-aware duration if available
    if (element.durationInTraffic) {
      result.durationInTrafficSeconds = element.durationInTraffic.value;
      result.durationInTrafficMinutes = Math.ceil(element.durationInTraffic.value / 60);
      result.durationInTrafficText = element.durationInTraffic.text;
    }

    return result;
  } catch (error) {
    console.error('[Maps] ETA calculation failed:', error);
    return null;
  }
}

/**
 * Calculate distance between two points (Haversine formula - no API call)
 */
export function calculateDistance(origin: LatLng, destination: LatLng): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(destination.lat - origin.lat);
  const dLng = toRad(destination.lng - origin.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(origin.lat)) *
      Math.cos(toRad(destination.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Estimate ETA without API call (rough estimate based on distance)
 */
export function estimateETA(origin: LatLng, destination: LatLng): number {
  const distanceKm = calculateDistance(origin, destination);
  // Assume average speed of 25 km/h in urban traffic
  const avgSpeedKmH = 25;
  const minutes = Math.ceil((distanceKm / avgSpeedKmH) * 60);
  return Math.max(5, minutes); // Minimum 5 minutes
}

/**
 * Geocode an address to coordinates
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    console.log('[Maps] Google Maps API key not configured');
    return null;
  }

  try {
    const response = await axios.get(`${GOOGLE_MAPS_BASE_URL}/geocode/json`, {
      params: {
        address,
        key: GOOGLE_MAPS_API_KEY,
        language: 'en',
      },
    });

    const data = response.data;

    if (data.status !== 'OK' || !data.results?.[0]) {
      console.error('[Maps] Geocoding error:', data.status);
      return null;
    }

    const result = data.results[0];
    const components: GeocodingResult['components'] = {};

    // Extract address components
    for (const component of result.address_components) {
      const types = component.types as string[];
      if (types.includes('locality')) {
        components.city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        components.province = component.long_name;
      } else if (types.includes('country')) {
        components.country = component.long_name;
      } else if (types.includes('postal_code')) {
        components.postalCode = component.long_name;
      }
    }

    return {
      formattedAddress: result.formatted_address,
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      placeId: result.place_id,
      components,
    };
  } catch (error) {
    console.error('[Maps] Geocoding failed:', error);
    return null;
  }
}

/**
 * Reverse geocode coordinates to address
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodingResult | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    console.log('[Maps] Google Maps API key not configured');
    return null;
  }

  try {
    const response = await axios.get(`${GOOGLE_MAPS_BASE_URL}/geocode/json`, {
      params: {
        latlng: `${lat},${lng}`,
        key: GOOGLE_MAPS_API_KEY,
        language: 'en',
      },
    });

    const data = response.data;

    if (data.status !== 'OK' || !data.results?.[0]) {
      console.error('[Maps] Reverse geocoding error:', data.status);
      return null;
    }

    const result = data.results[0];
    const components: GeocodingResult['components'] = {};

    for (const component of result.address_components) {
      const types = component.types as string[];
      if (types.includes('locality')) {
        components.city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        components.province = component.long_name;
      } else if (types.includes('country')) {
        components.country = component.long_name;
      } else if (types.includes('postal_code')) {
        components.postalCode = component.long_name;
      }
    }

    return {
      formattedAddress: result.formatted_address,
      lat,
      lng,
      placeId: result.place_id,
      components,
    };
  } catch (error) {
    console.error('[Maps] Reverse geocoding failed:', error);
    return null;
  }
}

/**
 * Get place predictions for autocomplete
 */
export async function getPlacePredictions(
  input: string,
  sessionToken?: string,
  location?: LatLng,
  radius?: number
): Promise<Array<{ description: string; placeId: string }>> {
  if (!GOOGLE_MAPS_API_KEY) {
    console.log('[Maps] Google Maps API key not configured');
    return [];
  }

  try {
    const params: Record<string, string> = {
      input,
      key: GOOGLE_MAPS_API_KEY,
      language: 'en',
      components: 'country:ph', // Restrict to Philippines
    };

    if (sessionToken) {
      params.sessiontoken = sessionToken;
    }

    if (location) {
      params.location = `${location.lat},${location.lng}`;
      params.radius = (radius || 50000).toString(); // Default 50km radius
    }

    const response = await axios.get(`${GOOGLE_MAPS_BASE_URL}/place/autocomplete/json`, {
      params,
    });

    const data = response.data;

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('[Maps] Place autocomplete error:', data.status);
      return [];
    }

    return (data.predictions || []).map((p: { description: string; place_id: string }) => ({
      description: p.description,
      placeId: p.place_id,
    }));
  } catch (error) {
    console.error('[Maps] Place autocomplete failed:', error);
    return [];
  }
}

/**
 * Get place details by place ID
 */
export async function getPlaceDetails(
  placeId: string,
  sessionToken?: string
): Promise<GeocodingResult | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    console.log('[Maps] Google Maps API key not configured');
    return null;
  }

  try {
    const params: Record<string, string> = {
      place_id: placeId,
      key: GOOGLE_MAPS_API_KEY,
      fields: 'formatted_address,geometry,address_components',
    };

    if (sessionToken) {
      params.sessiontoken = sessionToken;
    }

    const response = await axios.get(`${GOOGLE_MAPS_BASE_URL}/place/details/json`, {
      params,
    });

    const data = response.data;

    if (data.status !== 'OK' || !data.result) {
      console.error('[Maps] Place details error:', data.status);
      return null;
    }

    const result = data.result;
    const components: GeocodingResult['components'] = {};

    for (const component of result.address_components || []) {
      const types = component.types as string[];
      if (types.includes('locality')) {
        components.city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        components.province = component.long_name;
      } else if (types.includes('country')) {
        components.country = component.long_name;
      } else if (types.includes('postal_code')) {
        components.postalCode = component.long_name;
      }
    }

    return {
      formattedAddress: result.formatted_address,
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      placeId,
      components,
    };
  } catch (error) {
    console.error('[Maps] Place details failed:', error);
    return null;
  }
}

/**
 * Check if a point is within a service area (circular)
 */
export function isWithinServiceArea(
  point: LatLng,
  center: LatLng,
  radiusKm: number
): boolean {
  const distance = calculateDistance(point, center);
  return distance <= radiusKm;
}

/**
 * Find the nearest service area
 */
export function findNearestServiceArea(
  point: LatLng,
  areas: Array<{ id: string; centerLat: number; centerLng: number; radius: number }>
): { id: string; distance: number } | null {
  let nearest: { id: string; distance: number } | null = null;

  for (const area of areas) {
    const distance = calculateDistance(point, { lat: area.centerLat, lng: area.centerLng });

    if (distance <= area.radius) {
      if (!nearest || distance < nearest.distance) {
        nearest = { id: area.id, distance };
      }
    }
  }

  return nearest;
}
