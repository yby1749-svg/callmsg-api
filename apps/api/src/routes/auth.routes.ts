// ============================================================================
// Auth Routes
// ============================================================================

import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as authController from '../controllers/auth.controller.js';

const router = Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.post('/verify-phone', authenticate, authController.sendPhoneOTP);
router.post('/verify-phone/confirm', authenticate, authController.verifyPhoneOTP);
router.post('/verify-email', authenticate, authController.sendEmailVerification);
router.post('/verify-email/confirm', authController.verifyEmail);

export default router;
