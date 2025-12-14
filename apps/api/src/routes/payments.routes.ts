// ============================================================================
// Payment Routes
// ============================================================================

import { Router, raw } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as paymentController from '../controllers/payments.controller.js';

const router = Router();

// PayMongo webhook (no auth - verified by signature)
// Use raw body parser for webhook signature verification
router.post('/webhook', raw({ type: 'application/json' }), paymentController.handleWebhook);

// Payment callback (for redirect flows like GCash)
router.get('/callback', paymentController.handleCallback);

// Create payment intent for a booking
router.post('/intent', authenticate, paymentController.createPaymentIntent);

// Attach payment method to payment intent
router.post('/intent/:paymentIntentId/attach', authenticate, paymentController.attachPaymentMethod);

// Check payment status
router.get('/intent/:paymentIntentId/status', authenticate, paymentController.getPaymentStatus);

// Request refund
router.post('/:paymentId/refund', authenticate, paymentController.requestRefund);

// Get payment detail
router.get('/:paymentId', authenticate, paymentController.getPaymentDetail);

export default router;
