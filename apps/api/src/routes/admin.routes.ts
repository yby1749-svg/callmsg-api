// ============================================================================
// Admin Routes
// ============================================================================

import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import * as adminController from '../controllers/admin.controller.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Providers
router.get('/providers', adminController.listProviders);
router.get('/providers/:providerId', adminController.getProviderDetail);
router.post('/providers/:providerId/approve', adminController.approveProvider);
router.post('/providers/:providerId/reject', adminController.rejectProvider);
router.post('/providers/:providerId/suspend', adminController.suspendProvider);
router.post('/providers/:providerId/unsuspend', adminController.unsuspendProvider);

// Bookings
router.get('/bookings', adminController.listBookings);
router.get('/bookings/:bookingId', adminController.getBookingDetail);

// Payouts
router.get('/payouts', adminController.listPayouts);
router.post('/payouts/:payoutId/process', adminController.processPayout);
router.post('/payouts/:payoutId/reject', adminController.rejectPayout);

// Reports
router.get('/reports', adminController.listReports);
router.get('/reports/:reportId', adminController.getReportDetail);
router.post('/reports/:reportId/assign', adminController.assignReport);
router.post('/reports/:reportId/resolve', adminController.resolveReport);
router.post('/reports/:reportId/dismiss', adminController.dismissReport);

// Users
router.get('/users', adminController.listUsers);
router.get('/users/:userId', adminController.getUserDetail);
router.post('/users/:userId/suspend', adminController.suspendUser);

// Services (CRUD)
router.get('/services', adminController.listServicesAdmin);
router.post('/services', adminController.createService);
router.patch('/services/:serviceId', adminController.updateService);
router.delete('/services/:serviceId', adminController.deleteService);

// Promotions (CRUD)
router.get('/promotions', adminController.listPromotions);
router.post('/promotions', adminController.createPromotion);
router.patch('/promotions/:promotionId', adminController.updatePromotion);
router.delete('/promotions/:promotionId', adminController.deletePromotion);

export default router;
