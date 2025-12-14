import {io, Socket} from 'socket.io-client';
import {SOCKET_URL} from '@config/constants';
import {getTokens} from '@api';
import {useJobStore} from '@store/jobStore';
import {useNotificationStore} from '@store/notificationStore';
import type {Booking, Notification} from '@types';

let socket: Socket | null = null;
let connectionRetries = 0;
const MAX_CONNECTION_RETRIES = 3;
const RETRY_DELAY = 1000;

export const socketService = {
  connect: async (providedToken?: string) => {
    if (socket?.connected) {
      return;
    }

    let accessToken = providedToken;

    // If no token provided, get from storage with retry
    if (!accessToken) {
      const tokens = await getTokens();
      accessToken = tokens?.accessToken;

      // Retry if tokens not available yet (race condition on first auth)
      if (!accessToken && connectionRetries < MAX_CONNECTION_RETRIES) {
        connectionRetries++;
        console.log(
          `Socket: Tokens not ready, retrying in ${RETRY_DELAY}ms (${connectionRetries}/${MAX_CONNECTION_RETRIES})`,
        );
        setTimeout(() => socketService.connect(), RETRY_DELAY);
        return;
      }

      if (!accessToken) {
        console.warn('Cannot connect to socket: no access token after retries');
        connectionRetries = 0;
        return;
      }
    }

    // Reset retry counter on successful token retrieval
    connectionRetries = 0;

    socket = io(SOCKET_URL, {
      auth: {
        token: accessToken,
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('disconnect', reason => {
      console.log('Socket disconnected:', reason);
    });

    socket.on('connect_error', error => {
      console.error('Socket connection error:', error);
    });

    // Listen for new booking requests
    socket.on('booking:new', (booking: Booking) => {
      console.log('New booking received:', booking.id);
      useJobStore.getState().fetchPendingJobs();
    });

    // Listen for booking cancellations
    socket.on('booking:cancelled', (bookingId: string) => {
      console.log('Booking cancelled:', bookingId);
      useJobStore.getState().fetchPendingJobs();
      useJobStore.getState().fetchTodayJobs();
    });

    // Listen for booking updates
    socket.on('booking:updated', (booking: Booking) => {
      console.log('Booking updated:', booking.id);
      useJobStore.getState().fetchTodayJobs();
    });

    // Listen for notifications
    socket.on('notification', (notification: Notification) => {
      console.log('Notification received:', notification.title);
      useNotificationStore.getState().addNotification(notification);
    });
  },

  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  emit: (event: string, data?: unknown) => {
    if (socket?.connected) {
      socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit:', event);
    }
  },

  // Provider goes online
  goOnline: (providerId: string) => {
    socketService.emit('provider:online', {providerId});
  },

  // Provider goes offline
  goOffline: (providerId: string) => {
    socketService.emit('provider:offline', {providerId});
  },

  // Update provider location
  updateLocation: (
    providerId: string,
    latitude: number,
    longitude: number,
    bookingId?: string,
  ) => {
    socketService.emit('provider:location', {
      providerId,
      latitude,
      longitude,
      bookingId,
    });
  },

  // Join a booking room for real-time updates
  joinBookingRoom: (bookingId: string) => {
    socketService.emit('join:booking', {bookingId});
  },

  // Leave a booking room
  leaveBookingRoom: (bookingId: string) => {
    socketService.emit('leave:booking', {bookingId});
  },

  isConnected: () => socket?.connected ?? false,
};
