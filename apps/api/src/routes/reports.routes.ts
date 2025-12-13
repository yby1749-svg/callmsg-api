// ============================================================================
// Report Routes
// ============================================================================

import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as reportController from '../controllers/reports.controller.js';

const router = Router();

router.use(authenticate);

// Create report
router.post('/', reportController.createReport);

// Upload evidence
router.post('/upload-evidence', reportController.uploadEvidence);

// Get my reports
router.get('/me', reportController.getMyReports);

export default router;
