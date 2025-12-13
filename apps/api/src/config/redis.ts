// ============================================================================
// Redis Configuration
// ============================================================================

import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('connect', () => {
  console.log('🔗 Redis connecting...');
});

redis.on('ready', () => {
  console.log('✅ Redis ready');
});

redis.on('error', (error) => {
  console.error('❌ Redis error:', error.message);
});

redis.on('close', () => {
  console.log('🔌 Redis connection closed');
});

// Cache utilities
export const cache = {
  // Get cached value
  async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  },

  // Set cached value with expiration (seconds)
  async set(key: string, value: unknown, expiresIn: number = 3600): Promise<void> {
    await redis.set(key, JSON.stringify(value), 'EX', expiresIn);
  },

  // Delete cached value
  async del(key: string): Promise<void> {
    await redis.del(key);
  },

  // Delete multiple keys by pattern
  async delPattern(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  },
};

// Location tracking utilities
export const locationCache = {
  // Store provider location
  async setProviderLocation(
    providerId: string, 
    lat: number, 
    lng: number
  ): Promise<void> {
    const key = `location:provider:${providerId}`;
    await redis.hset(key, {
      lat: lat.toString(),
      lng: lng.toString(),
      updatedAt: Date.now().toString(),
    });
    await redis.expire(key, 300); // 5 minutes TTL
  },

  // Get provider location
  async getProviderLocation(providerId: string): Promise<{
    lat: number;
    lng: number;
    updatedAt: number;
  } | null> {
    const key = `location:provider:${providerId}`;
    const data = await redis.hgetall(key);
    if (!data || !data.lat) return null;
    return {
      lat: parseFloat(data.lat),
      lng: parseFloat(data.lng),
      updatedAt: parseInt(data.updatedAt),
    };
  },

  // Store booking location (for tracking)
  async setBookingLocation(
    bookingId: string,
    lat: number,
    lng: number,
    eta?: number
  ): Promise<void> {
    const key = `location:booking:${bookingId}`;
    await redis.hset(key, {
      lat: lat.toString(),
      lng: lng.toString(),
      eta: eta?.toString() || '',
      updatedAt: Date.now().toString(),
    });
    await redis.expire(key, 7200); // 2 hours TTL
  },

  // Get booking location
  async getBookingLocation(bookingId: string): Promise<{
    lat: number;
    lng: number;
    eta: number | null;
    updatedAt: number;
  } | null> {
    const key = `location:booking:${bookingId}`;
    const data = await redis.hgetall(key);
    if (!data || !data.lat) return null;
    return {
      lat: parseFloat(data.lat),
      lng: parseFloat(data.lng),
      eta: data.eta ? parseInt(data.eta) : null,
      updatedAt: parseInt(data.updatedAt),
    };
  },
};

export default redis;
