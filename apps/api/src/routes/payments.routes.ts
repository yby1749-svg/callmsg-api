// ============================================================================
// Payment Routes
// ============================================================================

import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as paymentController from '../controllers/payments.controller.js';

const router = Router();

// PayMongo webhook (no auth - verified by signature)
router.post('/webhook', paymentController.handleWebhook);

// Get payment detail
router.get('/:paymentId', authenticate, paymentController.getPaymentDetail);

export default router;
