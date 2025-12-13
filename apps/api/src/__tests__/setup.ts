import { prisma } from '../config/database.js';
import { redis } from '../config/redis.js';

beforeAll(async () => {
  // Clean up old refresh tokens to avoid unique constraint errors
  await prisma.refreshToken.deleteMany({});
});

afterAll(async () => {
  await prisma.$disconnect();
  redis.disconnect();
});
