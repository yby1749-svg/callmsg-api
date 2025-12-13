// ============================================================================
// Provider Routes
// ============================================================================

import { Router } from 'express';
import { authenticate, optionalAuth, requireProvider } from '../middleware/auth.js';
import * as providerController from '../controllers/providers.controller.js';

const router = Router();

// ============================================================================
// PUBLIC ROUTES (Customer browsing providers)
// ============================================================================

// List providers (with filters)
router.get('/', optionalAuth, providerController.listProviders);

// Get provider detail
router.get('/:providerId', optionalAuth, providerController.getProviderDetail);

// Get provider reviews
router.get('/:providerId/reviews', providerController.getProviderReviews);

// Get provider availability for a date
router.get('/:providerId/availability', providerController.getProviderAvailability);

// ============================================================================
// PROVIDER REGISTRATION & MANAGEMENT (Requires auth)
// ============================================================================

// Register as provider
router.post('/register', authenticate, providerController.registerAsProvider);

// Provider profile management (requires provider role)
router.get('/me/profile', authenticate, requireProvider, providerController.getMyProfile);
router.patch('/me/profile', authenticate, requireProvider, providerController.updateMyProfile);

// Documents
router.get('/me/documents', authenticate, providerController.getMyDocuments);
router.post('/me/documents', authenticate, providerController.uploadDocument);

// Services
router.get('/me/services', authenticate, requireProvider, providerController.getMyServices);
router.post('/me/services', authenticate, requireProvider, providerController.setService);
router.delete('/me/services/:serviceId', authenticate, requireProvider, providerController.removeService);

// Availability schedule
router.get('/me/availability', authenticate, requireProvider, providerController.getMyAvailability);
router.put('/me/availability', authenticate, requireProvider, providerController.setMyAvailability);

// Online/Offline status
router.patch('/me/status', authenticate, requireProvider, providerController.updateOnlineStatus);

// Location update
router.patch('/me/location', authenticate, requireProvider, providerController.updateLocation);

// Bank account
router.patch('/me/bank-account', authenticate, requireProvider, providerController.updateBankAccount);

// Earnings
router.get('/me/earnings', authenticate, requireProvider, providerController.getEarnings);
router.get('/me/earnings/summary', authenticate, requireProvider, providerController.getEarningsSummary);

// Payouts
router.get('/me/payouts', authenticate, requireProvider, providerController.getPayouts);
router.post('/me/payouts', authenticate, requireProvider, providerController.requestPayout);

export default router;
