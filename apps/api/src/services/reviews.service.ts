// ============================================================================
// Reviews Service
// ============================================================================

import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { notificationService } from './notifications.service.js';
import { sendPushToUser } from '../utils/push.js';

class ReviewService {
  async createReview(authorId: string, data: { bookingId: string; rating: number; comment?: string }) {
    const booking = await prisma.booking.findUnique({
      where: { id: data.bookingId },
      include: { provider: true, service: true },
    });
    if (!booking) throw new AppError('Booking not found', 404);
    if (booking.customerId !== authorId) throw new AppError('Not authorized', 403);
    if (booking.status !== 'COMPLETED') throw new AppError('Can only review completed bookings', 400);

    const existing = await prisma.review.findUnique({ where: { bookingId: data.bookingId } });
    if (existing) throw new AppError('Review already exists', 400);

    // Get customer name for notification
    const customer = await prisma.user.findUnique({
      where: { id: authorId },
      select: { firstName: true, lastName: true },
    });

    const review = await prisma.review.create({
      data: {
        bookingId: data.bookingId,
        authorId,
        targetId: booking.provider.userId,
        rating: data.rating,
        comment: data.comment,
      },
    });

    // Update provider rating
    const reviews = await prisma.review.aggregate({
      where: { targetId: booking.provider.userId },
      _avg: { rating: true },
      _count: true,
    });
    await prisma.provider.update({
      where: { id: booking.providerId },
      data: { rating: reviews._avg.rating || 0, totalRatings: reviews._count },
    });

    // Send notification and push to provider
    const customerName = customer ? `${customer.firstName}` : 'A customer';
    const stars = '★'.repeat(data.rating) + '☆'.repeat(5 - data.rating);

    await notificationService.createNotification(
      booking.provider.userId,
      'REVIEW_RECEIVED',
      'New Review Received',
      `${customerName} left a ${data.rating}-star review for your ${booking.service.name} service`,
      { reviewId: review.id, bookingId: booking.id, rating: data.rating }
    );

    await sendPushToUser(booking.provider.userId, {
      title: `New ${data.rating}-Star Review ${stars}`,
      body: data.comment ? `"${data.comment.substring(0, 100)}${data.comment.length > 100 ? '...' : ''}"` : `${customerName} rated your service`,
      data: { reviewId: review.id, type: 'new_review' },
    });

    return review;
  }

  async replyToReview(userId: string, reviewId: string, reply: string) {
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new AppError('Review not found', 404);
    if (review.targetId !== userId) throw new AppError('Not authorized', 403);

    return prisma.review.update({ where: { id: reviewId }, data: { reply, repliedAt: new Date() } });
  }

  // Get reviews written by a customer
  async getMyReviews(userId: string, query: { limit?: string; page?: string }) {
    const limit = parseInt(query.limit || '20');
    const page = parseInt(query.page || '1');
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { authorId: userId },
        include: {
          target: { select: { firstName: true, lastName: true, avatarUrl: true } },
          booking: { include: { service: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.review.count({ where: { authorId: userId } }),
    ]);

    return {
      data: reviews,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // Get reviews received by a provider
  async getReceivedReviews(userId: string, query: { limit?: string; page?: string }) {
    const limit = parseInt(query.limit || '20');
    const page = parseInt(query.page || '1');
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { targetId: userId },
        include: {
          author: { select: { firstName: true, lastName: true, avatarUrl: true } },
          booking: { include: { service: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.review.count({ where: { targetId: userId } }),
    ]);

    return {
      data: reviews,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}

export const reviewService = new ReviewService();
