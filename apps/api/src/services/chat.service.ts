import { prisma } from '../config/database.js';
import { sendPushToUser } from '../utils/push.js';
import { sendChatMessage, sendNotificationToUser } from '../socket/index.js';
import { notificationService } from './notifications.service.js';

export const chatService = {
  async getMessages(bookingId: string, userId: string) {
    // Verify user has access to this booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        provider: true,
      },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Check if user is customer or provider
    const isCustomer = booking.customerId === userId;
    const isProvider = booking.provider?.userId === userId;

    if (!isCustomer && !isProvider) {
      throw new Error('Access denied');
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'asc' },
    });

    return messages.map((msg) => ({
      ...msg,
      isOwn: msg.senderId === userId,
    }));
  },

  async sendMessage(bookingId: string, senderId: string, content: string) {
    // Verify user has access to this booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        provider: true,
        customer: true,
      },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Check if user is customer or provider
    const isCustomer = booking.customerId === senderId;
    const isProvider = booking.provider?.userId === senderId;

    if (!isCustomer && !isProvider) {
      throw new Error('Access denied');
    }

    // Check booking status - only allow chat during active booking
    const allowedStatuses = ['ACCEPTED', 'PROVIDER_EN_ROUTE', 'PROVIDER_ARRIVED', 'IN_PROGRESS'];
    if (!allowedStatuses.includes(booking.status)) {
      throw new Error('Chat is only available for active bookings');
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        bookingId,
        senderId,
        content,
      },
    });

    // Emit socket event for real-time update
    sendChatMessage(bookingId, {
      id: message.id,
      bookingId: message.bookingId,
      senderId: message.senderId,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
    });

    // Send push notification to other party
    const recipientId = isCustomer ? booking.provider?.userId : booking.customerId;
    const senderName = isCustomer
      ? `${booking.customer.firstName || 'Customer'}`
      : (booking.provider?.displayName || 'Therapist');

    if (recipientId) {
      const notificationTitle = `New message from ${senderName}`;
      const notificationBody = content.length > 100 ? content.substring(0, 97) + '...' : content;

      // Create notification record in database (so it appears in Inbox)
      notificationService.createNotification(
        recipientId,
        'SYSTEM', // Using SYSTEM type for chat messages
        notificationTitle,
        notificationBody,
        { type: 'chat_message', bookingId, senderId }
      ).then((notification) => {
        // Emit socket notification for real-time bell badge update
        sendNotificationToUser(recipientId, {
          type: 'SYSTEM',
          title: notificationTitle,
          body: notificationBody,
          data: { id: notification.id, bookingId, senderId, type: 'chat_message' },
        });
      }).catch((error) => {
        console.error('[Chat] Failed to create notification:', error);
      });

      // Send push notification asynchronously (don't await to not slow down response)
      sendPushToUser(recipientId, {
        title: notificationTitle,
        body: notificationBody,
        data: {
          type: 'chat_message',
          bookingId,
          senderId,
        },
      }).catch((error) => {
        console.error('[Chat] Failed to send push notification:', error);
      });
    }

    return {
      ...message,
      isOwn: true,
    };
  },

  async markAsRead(bookingId: string, userId: string) {
    // Verify user has access to this booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        provider: true,
      },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Mark all messages from other party as read
    await prisma.message.updateMany({
      where: {
        bookingId,
        senderId: { not: userId },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { success: true };
  },

  async getUnreadCount(bookingId: string, userId: string) {
    const count = await prisma.message.count({
      where: {
        bookingId,
        senderId: { not: userId },
        isRead: false,
      },
    });

    return count;
  },
};
