// ============================================================================
// Review Routes
// ============================================================================

import { Router } from 'express';
import { authenticate, requireProvider } from '../middleware/auth.js';
import * as reviewController from '../controllers/reviews.controller.js';

const router = Router();

// Create review (customer)
router.post('/', authenticate, reviewController.createReview);

// Reply to review (provider)
router.post('/:reviewId/reply', authenticate, requireProvider, reviewController.replyToReview);

export default router;
