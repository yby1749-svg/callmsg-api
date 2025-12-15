// ============================================================================
// Blocked Dates Service
// ============================================================================

import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { startOfDay } from 'date-fns';

interface BlockedDateData {
  date: string; // ISO date string
  reason?: string;
}

class BlockedDatesService {
  async getMyBlockedDates(userId: string) {
    const provider = await prisma.provider.findUnique({ where: { userId } });
    if (!provider) throw new AppError('Provider not found', 404);

    return prisma.providerBlockedDate.findMany({
      where: {
        providerId: provider.id,
        date: { gte: startOfDay(new Date()) },
      },
      orderBy: { date: 'asc' },
    });
  }

  async addBlockedDate(userId: string, data: BlockedDateData) {
    const provider = await prisma.provider.findUnique({ where: { userId } });
    if (!provider) throw new AppError('Provider not found', 404);

    const date = startOfDay(new Date(data.date));

    // Check if date is in the past
    if (date < startOfDay(new Date())) {
      throw new AppError('Cannot block a date in the past', 400);
    }

    // Check if already blocked
    const existing = await prisma.providerBlockedDate.findFirst({
      where: { providerId: provider.id, date },
    });
    if (existing) {
      throw new AppError('Date is already blocked', 400);
    }

    // Check for existing bookings on this date
    const bookingsOnDate = await prisma.booking.count({
      where: {
        providerId: provider.id,
        scheduledAt: {
          gte: date,
          lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
        },
        status: { in: ['PENDING', 'ACCEPTED', 'PROVIDER_EN_ROUTE', 'PROVIDER_ARRIVED', 'IN_PROGRESS'] },
      },
    });

    if (bookingsOnDate > 0) {
      throw new AppError('Cannot block date with existing bookings', 400);
    }

    return prisma.providerBlockedDate.create({
      data: {
        providerId: provider.id,
        date,
        reason: data.reason,
      },
    });
  }

  async removeBlockedDate(userId: string, blockedDateId: string) {
    const provider = await prisma.provider.findUnique({ where: { userId } });
    if (!provider) throw new AppError('Provider not found', 404);

    const blockedDate = await prisma.providerBlockedDate.findUnique({
      where: { id: blockedDateId },
    });

    if (!blockedDate) {
      throw new AppError('Blocked date not found', 404);
    }

    if (blockedDate.providerId !== provider.id) {
      throw new AppError('Not authorized to delete this blocked date', 403);
    }

    await prisma.providerBlockedDate.delete({
      where: { id: blockedDateId },
    });
  }

  async isDateBlocked(providerId: string, date: Date): Promise<boolean> {
    const dateOnly = startOfDay(date);
    const blocked = await prisma.providerBlockedDate.findFirst({
      where: { providerId, date: dateOnly },
    });
    return !!blocked;
  }
}

export const blockedDatesService = new BlockedDatesService();
