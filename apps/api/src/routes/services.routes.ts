// ============================================================================
// Service Routes
// ============================================================================

import { Router } from 'express';
import * as serviceController from '../controllers/services.controller.js';

const router = Router();

// Public routes
router.get('/', serviceController.listServices);
router.get('/:serviceId', serviceController.getServiceDetail);

// Service areas
router.get('/areas', serviceController.getServiceAreas);

// Promotions
router.post('/promotions/validate', serviceController.validatePromoCode);

export default router;
