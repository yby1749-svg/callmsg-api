import request from 'supertest';
import app from '../app.js';
import { prisma } from '../config/database.js';

describe('API Endpoints', () => {
  // Clean up refresh tokens before each test suite to avoid unique constraint errors
  beforeEach(async () => {
    await prisma.refreshToken.deleteMany({});
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/v1/services', () => {
    it('should return list of services', async () => {
      const res = await request(app).get('/api/v1/services');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/providers', () => {
    it('should return list of providers', async () => {
      const res = await request(app).get('/api/v1/providers');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should reject invalid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'invalid@test.com', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'customer@test.com', password: 'customer123!' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data).toHaveProperty('user');
    });
  });

  describe('Protected Routes', () => {
    let accessToken: string;

    beforeAll(async () => {
      // Clean tokens before getting a new one
      await prisma.refreshToken.deleteMany({});

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'customer@test.com', password: 'customer123!' });

      if (!res.body.data?.accessToken) {
        throw new Error(`Login failed: ${JSON.stringify(res.body)}`);
      }
      accessToken = res.body.data.accessToken;
    });

    it('should reject requests without token', async () => {
      const res = await request(app).get('/api/v1/users/me');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('should return user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('email', 'customer@test.com');
    });

    it('should return user addresses', async () => {
      const res = await request(app)
        .get('/api/v1/users/me/addresses')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('404 Not Found', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/api/v1/unknown-route');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Not Found');
    });
  });

  describe('Bookings', () => {
    let customerToken: string;
    let providerToken: string;
    let providerId: string;
    let createdBookingId: string;

    beforeAll(async () => {
      await prisma.refreshToken.deleteMany({});

      // Login as customer
      const customerRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'customer@test.com', password: 'customer123!' });
      customerToken = customerRes.body.data.accessToken;

      // Login as provider
      const providerRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'provider@test.com', password: 'provider123!' });
      providerToken = providerRes.body.data.accessToken;

      // Get provider ID
      const provider = await prisma.provider.findFirst({
        where: { user: { email: 'provider@test.com' } },
      });
      providerId = provider!.id;
    });

    afterAll(async () => {
      // Clean up test bookings
      if (createdBookingId) {
        await prisma.booking.deleteMany({
          where: { id: createdBookingId },
        });
      }
    });

    describe('GET /api/v1/bookings', () => {
      it('should require authentication', async () => {
        const res = await request(app).get('/api/v1/bookings');
        expect(res.status).toBe(401);
      });

      it('should return customer bookings list', async () => {
        const res = await request(app)
          .get('/api/v1/bookings')
          .set('Authorization', `Bearer ${customerToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
      });

      it('should return provider bookings list', async () => {
        const res = await request(app)
          .get('/api/v1/bookings?role=provider')
          .set('Authorization', `Bearer ${providerToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(Array.isArray(res.body.data)).toBe(true);
      });
    });

    describe('POST /api/v1/bookings', () => {
      it('should require authentication', async () => {
        const res = await request(app)
          .post('/api/v1/bookings')
          .send({});
        expect(res.status).toBe(401);
      });

      it('should create a new booking', async () => {
        const scheduledAt = new Date();
        scheduledAt.setHours(scheduledAt.getHours() + 3);

        const res = await request(app)
          .post('/api/v1/bookings')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            providerId,
            serviceId: 'svc-thai',
            duration: 60,
            scheduledAt: scheduledAt.toISOString(),
            addressText: 'Test Address, Makati City',
            latitude: 14.5586,
            longitude: 121.0178,
          });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data).toHaveProperty('booking');
        expect(res.body.data.booking).toHaveProperty('id');
        expect(res.body.data.booking).toHaveProperty('bookingNumber');
        expect(res.body.data.booking.status).toBe('PENDING');
        expect(res.body.data.booking.duration).toBe(60);
        expect(res.body.data.booking.serviceAmount).toBe(800);

        createdBookingId = res.body.data.booking.id;
      });

      it('should reject booking with invalid provider', async () => {
        const res = await request(app)
          .post('/api/v1/bookings')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            providerId: 'invalid-provider-id',
            serviceId: 'svc-thai',
            duration: 60,
            scheduledAt: new Date().toISOString(),
            addressText: 'Test Address',
            latitude: 14.5586,
            longitude: 121.0178,
          });

        expect(res.status).toBe(404);
      });

      it('should reject booking with unavailable service', async () => {
        const res = await request(app)
          .post('/api/v1/bookings')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            providerId,
            serviceId: 'svc-deep', // Provider doesn't offer this
            duration: 60,
            scheduledAt: new Date().toISOString(),
            addressText: 'Test Address',
            latitude: 14.5586,
            longitude: 121.0178,
          });

        expect(res.status).toBe(400);
      });
    });

    describe('GET /api/v1/bookings/:bookingId', () => {
      it('should return booking details', async () => {
        if (!createdBookingId) return;

        const res = await request(app)
          .get(`/api/v1/bookings/${createdBookingId}`)
          .set('Authorization', `Bearer ${customerToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data).toHaveProperty('id', createdBookingId);
        expect(res.body.data).toHaveProperty('service');
        expect(res.body.data).toHaveProperty('provider');
      });

      it('should return 404 for non-existent booking', async () => {
        const res = await request(app)
          .get('/api/v1/bookings/non-existent-id')
          .set('Authorization', `Bearer ${customerToken}`);

        expect(res.status).toBe(404);
      });
    });

    describe('Provider Booking Actions', () => {
      it('should accept a booking', async () => {
        if (!createdBookingId) return;

        const res = await request(app)
          .post(`/api/v1/bookings/${createdBookingId}/accept`)
          .set('Authorization', `Bearer ${providerToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data.status).toBe('ACCEPTED');
      });

      it('should update booking status to EN_ROUTE', async () => {
        if (!createdBookingId) return;

        const res = await request(app)
          .patch(`/api/v1/bookings/${createdBookingId}/status`)
          .set('Authorization', `Bearer ${providerToken}`)
          .send({ status: 'PROVIDER_EN_ROUTE' });

        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe('PROVIDER_EN_ROUTE');
      });

      it('should update booking status to ARRIVED', async () => {
        if (!createdBookingId) return;

        const res = await request(app)
          .patch(`/api/v1/bookings/${createdBookingId}/status`)
          .set('Authorization', `Bearer ${providerToken}`)
          .send({ status: 'PROVIDER_ARRIVED' });

        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe('PROVIDER_ARRIVED');
      });

      it('should update booking status to IN_PROGRESS', async () => {
        if (!createdBookingId) return;

        const res = await request(app)
          .patch(`/api/v1/bookings/${createdBookingId}/status`)
          .set('Authorization', `Bearer ${providerToken}`)
          .send({ status: 'IN_PROGRESS' });

        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe('IN_PROGRESS');
      });

      it('should complete booking', async () => {
        if (!createdBookingId) return;

        const res = await request(app)
          .patch(`/api/v1/bookings/${createdBookingId}/status`)
          .set('Authorization', `Bearer ${providerToken}`)
          .send({ status: 'COMPLETED' });

        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe('COMPLETED');
      });

      it('should update provider location during booking', async () => {
        // Create a new booking for location test
        const scheduledAt = new Date();
        scheduledAt.setHours(scheduledAt.getHours() + 4);

        const bookingRes = await request(app)
          .post('/api/v1/bookings')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            providerId,
            serviceId: 'svc-aroma',
            duration: 60,
            scheduledAt: scheduledAt.toISOString(),
            addressText: 'Location Test Address',
            latitude: 14.5586,
            longitude: 121.0178,
          });

        const bookingId = bookingRes.body.data.booking.id;

        // Accept the booking
        await request(app)
          .post(`/api/v1/bookings/${bookingId}/accept`)
          .set('Authorization', `Bearer ${providerToken}`);

        // Update location
        const res = await request(app)
          .post(`/api/v1/bookings/${bookingId}/location`)
          .set('Authorization', `Bearer ${providerToken}`)
          .send({
            latitude: 14.5600,
            longitude: 121.0200,
          });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('success', true);

        // Clean up
        await prisma.locationLog.deleteMany({ where: { bookingId } });
        await prisma.booking.delete({ where: { id: bookingId } });
      });
    });

    describe('Booking Cancellation', () => {
      it('should cancel a pending booking', async () => {
        // Create a new booking
        const scheduledAt = new Date();
        scheduledAt.setHours(scheduledAt.getHours() + 5);

        const bookingRes = await request(app)
          .post('/api/v1/bookings')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            providerId,
            serviceId: 'svc-swedish',
            duration: 90,
            scheduledAt: scheduledAt.toISOString(),
            addressText: 'Cancel Test Address',
            latitude: 14.5586,
            longitude: 121.0178,
          });

        const bookingId = bookingRes.body.data.booking.id;

        // Cancel the booking
        const res = await request(app)
          .post(`/api/v1/bookings/${bookingId}/cancel`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({ reason: 'Changed my mind' });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data.status).toBe('CANCELLED');
        expect(res.body.data.cancelReason).toBe('Changed my mind');

        // Clean up
        await prisma.booking.delete({ where: { id: bookingId } });
      });

      it('should not cancel a completed booking', async () => {
        if (!createdBookingId) return;

        const res = await request(app)
          .post(`/api/v1/bookings/${createdBookingId}/cancel`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({ reason: 'Too late' });

        expect(res.status).toBe(400);
      });
    });

    describe('Booking Rejection', () => {
      it('should reject a pending booking', async () => {
        // Create a new booking
        const scheduledAt = new Date();
        scheduledAt.setHours(scheduledAt.getHours() + 6);

        const bookingRes = await request(app)
          .post('/api/v1/bookings')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            providerId,
            serviceId: 'svc-thai',
            duration: 60,
            scheduledAt: scheduledAt.toISOString(),
            addressText: 'Reject Test Address',
            latitude: 14.5586,
            longitude: 121.0178,
          });

        const bookingId = bookingRes.body.data.booking.id;

        // Reject the booking
        const res = await request(app)
          .post(`/api/v1/bookings/${bookingId}/reject`)
          .set('Authorization', `Bearer ${providerToken}`)
          .send({ reason: 'Not available' });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data.status).toBe('REJECTED');

        // Clean up
        await prisma.booking.delete({ where: { id: bookingId } });
      });
    });
  });
});
