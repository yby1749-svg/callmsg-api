// ============================================================================
// User Routes
// ============================================================================

import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as userController from '../controllers/users.controller.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Profile
router.get('/me', userController.getProfile);
router.patch('/me', userController.updateProfile);
router.post('/me/avatar', userController.uploadAvatar);
router.patch('/me/password', userController.changePassword);
router.patch('/me/fcm-token', userController.updateFcmToken);

// Addresses
router.get('/me/addresses', userController.getAddresses);
router.post('/me/addresses', userController.addAddress);
router.patch('/me/addresses/:addressId', userController.updateAddress);
router.delete('/me/addresses/:addressId', userController.deleteAddress);

export default router;
