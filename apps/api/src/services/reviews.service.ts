// ============================================================================
// Reviews Service
// ============================================================================

import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

class ReviewService {
  async createReview(authorId: string, data: { bookingId: string; rating: number; comment?: string }) {
    const booking = await prisma.booking.findUnique({
      where: { id: data.bookingId },
      include: { provider: true },
    });
    if (!booking) throw new AppError('Booking not found', 404);
    if (booking.customerId !== authorId) throw new AppError('Not authorized', 403);
    if (booking.status !== 'COMPLETED') throw new AppError('Can only review completed bookings', 400);
    
    const existing = await prisma.review.findUnique({ where: { bookingId: data.bookingId } });
    if (existing) throw new AppError('Review already exists', 400);
    
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
    
    return review;
  }

  async replyToReview(userId: string, reviewId: string, reply: string) {
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new AppError('Review not found', 404);
    if (review.targetId !== userId) throw new AppError('Not authorized', 403);
    
    return prisma.review.update({ where: { id: reviewId }, data: { reply, repliedAt: new Date() } });
  }
}

export const reviewService = new ReviewService();
