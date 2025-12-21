import Config from 'react-native-config';

export const API_URL = Config.API_URL || 'http://localhost:3000/api/v1';
export const SOCKET_URL = Config.SOCKET_URL || 'http://localhost:3000';
export const GOOGLE_MAPS_API_KEY = Config.GOOGLE_MAPS_API_KEY || '';

export const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry
export const LOCATION_UPDATE_INTERVAL = 10 * 1000; // 10 seconds for providers

export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROVIDER_ASSIGNED: 'PROVIDER_ASSIGNED',
  PROVIDER_EN_ROUTE: 'PROVIDER_EN_ROUTE',
  PROVIDER_ARRIVED: 'PROVIDER_ARRIVED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const;

export const PAYOUT_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;

export const SERVICE_DURATIONS = [60, 90, 120] as const;

export const MIN_PAYOUT_AMOUNT = 500;

export const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;
