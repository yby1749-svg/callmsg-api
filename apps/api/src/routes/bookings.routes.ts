// ============================================================================
// Booking Routes
// ============================================================================

import { Router } from 'express';
import { authenticate, requireProvider } from '../middleware/auth.js';
import * as bookingController from '../controllers/bookings.controller.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ============================================================================
// CUSTOMER ROUTES
// ============================================================================

// List my bookings (as customer or provider based on query param)
router.get('/', bookingController.listBookings);

// Create new booking
router.post('/', bookingController.createBooking);

// Get booking detail
router.get('/:bookingId', bookingController.getBookingDetail);

// Cancel booking
router.post('/:bookingId/cancel', bookingController.cancelBooking);

// Get provider location (during active booking)
router.get('/:bookingId/location', bookingController.getProviderLocation);

// SOS
router.post('/:bookingId/sos', bookingController.triggerSOS);

// ============================================================================
// PROVIDER ROUTES
// ============================================================================

// Accept booking
router.post('/:bookingId/accept', requireProvider, bookingController.acceptBooking);

// Reject booking
router.post('/:bookingId/reject', requireProvider, bookingController.rejectBooking);

// Update booking status (en_route, arrived, in_progress, completed)
router.patch('/:bookingId/status', requireProvider, bookingController.updateBookingStatus);

// Update location during booking
router.post('/:bookingId/location', requireProvider, bookingController.updateBookingLocation);

export default router;
