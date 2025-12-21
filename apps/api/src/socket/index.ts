// ============================================================================
// Socket.IO Configuration
// ============================================================================

import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { locationCache } from '../config/redis.js';

let io: Server;

interface AuthenticatedSocket extends Socket {
  userId?: string;
  role?: string;
}

export function initializeSocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGINS?.split(',') || '*',
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
        userId: string;
        role: string;
      };

      socket.userId = decoded.userId;
      socket.role = decoded.role;
      next();
    } catch (_error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`🔌 Socket connected: ${socket.id} (User: ${socket.userId})`);

    // Join user's personal room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // =========================================================================
    // BOOKING EVENTS
    // =========================================================================

    // Join booking room (for real-time tracking)
    socket.on('join:booking', (data: { bookingId: string }) => {
      socket.join(`booking:${data.bookingId}`);
      console.log(`User ${socket.userId} joined booking room: ${data.bookingId}`);
    });

    // Leave booking room
    socket.on('leave:booking', (data: { bookingId: string }) => {
      socket.leave(`booking:${data.bookingId}`);
      console.log(`User ${socket.userId} left booking room: ${data.bookingId}`);
    });

    // =========================================================================
    // LOCATION EVENTS (Provider)
    // =========================================================================

    // Provider updates their location during active booking
    socket.on('location:update', async (data: {
      bookingId: string;
      latitude: number;
      longitude: number;
      accuracy?: number;
    }) => {
      if (socket.role !== 'PROVIDER') {
        socket.emit('error', { message: 'Only providers can update location' });
        return;
      }

      try {
        // Get booking destination for ETA calculation
        const { prisma } = await import('../config/database.js');
        const { calculateETA, estimateETA } = await import('../utils/maps.js');

        const booking = await prisma.booking.findUnique({
          where: { id: data.bookingId },
          select: { latitude: true, longitude: true },
        });

        let eta = 15; // default
        if (booking) {
          const origin = { lat: data.latitude, lng: data.longitude };
          const destination = { lat: booking.latitude, lng: booking.longitude };

          // Try Google Maps API first, fall back to estimate
          const etaResult = await calculateETA(origin, destination);
          if (etaResult) {
            eta = etaResult.durationInTrafficMinutes || etaResult.durationMinutes;
          } else {
            eta = estimateETA(origin, destination);
          }
        }

        // Store location in Redis
        await locationCache.setBookingLocation(
          data.bookingId,
          data.latitude,
          data.longitude,
          eta
        );

        // Mask location (round to ~100m precision for privacy)
        const maskedLat = Math.round(data.latitude * 1000) / 1000;
        const maskedLng = Math.round(data.longitude * 1000) / 1000;

        // Broadcast to booking room (customer)
        io.to(`booking:${data.bookingId}`).emit('location:provider', {
          bookingId: data.bookingId,
          latitude: maskedLat,
          longitude: maskedLng,
          eta,
          updatedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error updating location:', error);
        socket.emit('error', { message: 'Failed to update location' });
      }
    });

    // =========================================================================
    // PROVIDER STATUS
    // =========================================================================

    socket.on('provider:status', (data: { status: 'ONLINE' | 'OFFLINE' }) => {
      if (socket.role !== 'PROVIDER') {
        socket.emit('error', { message: 'Only providers can update status' });
        return;
      }

      if (data.status === 'ONLINE') {
        socket.join('provider:online');
      } else {
        socket.leave('provider:online');
      }

      console.log(`Provider ${socket.userId} is now ${data.status}`);
    });

    // =========================================================================
    // DISCONNECT
    // =========================================================================

    socket.on('disconnect', (reason) => {
      console.log(`🔌 Socket disconnected: ${socket.id} (Reason: ${reason})`);
    });
  });

  return io;
}

// ============================================================================
// HELPER FUNCTIONS FOR SERVER-SIDE EMISSIONS
// ============================================================================

// Send notification to specific user
export function sendNotificationToUser(userId: string, notification: {
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}) {
  if (io) {
    io.to(`user:${userId}`).emit('notification', notification);
  }
}

// Notify booking room of status change
export function notifyBookingUpdate(bookingId: string, update: {
  status: string;
  [key: string]: unknown;
}) {
  if (io) {
    io.to(`booking:${bookingId}`).emit('booking:updated', {
      bookingId,
      ...update,
    });
  }
}

// Send new booking request to provider
export function sendBookingRequest(providerId: string, booking: {
  id: string;
  customer: { firstName: string };
  service: { name: string };
  duration: number;
  totalAmount: number;
  scheduledAt: string;
  addressText: string;
}) {
  if (io) {
    io.to(`user:${providerId}`).emit('booking:new', { booking });
  }
}

// Notify booking cancellation
export function notifyBookingCancelled(bookingId: string, reason?: string) {
  if (io) {
    io.to(`booking:${bookingId}`).emit('booking:cancelled', { bookingId, reason });
  }
}

// Send chat message to booking room
export function sendChatMessage(bookingId: string, message: {
  id: string;
  bookingId: string;
  senderId: string;
  content: string;
  createdAt: string;
}) {
  if (io) {
    io.to(`booking:${bookingId}`).emit('chat:message', message);
  }
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}
