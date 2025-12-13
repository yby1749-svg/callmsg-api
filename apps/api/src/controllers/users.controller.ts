// ============================================================================
// Users Controller
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/users.service.js';

export const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await userService.getProfile(req.user!.id);
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await userService.updateProfile(req.user!.id, req.body);
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
};

export const uploadAvatar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // TODO: Handle file upload with multer
    res.json({ success: true, message: 'Avatar uploaded' });
  } catch (error) { next(error); }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await userService.changePassword(req.user!.id, req.body.currentPassword, req.body.newPassword);
    res.json({ success: true, message: 'Password changed' });
  } catch (error) { next(error); }
};

export const updateFcmToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await userService.updateFcmToken(req.user!.id, req.body.fcmToken);
    res.json({ success: true, message: 'FCM token updated' });
  } catch (error) { next(error); }
};

export const getAddresses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const addresses = await userService.getAddresses(req.user!.id);
    res.json({ success: true, data: addresses });
  } catch (error) { next(error); }
};

export const addAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const address = await userService.addAddress(req.user!.id, req.body);
    res.status(201).json({ success: true, data: address });
  } catch (error) { next(error); }
};

export const updateAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const address = await userService.updateAddress(req.user!.id, req.params.addressId, req.body);
    res.json({ success: true, data: address });
  } catch (error) { next(error); }
};

export const deleteAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await userService.deleteAddress(req.user!.id, req.params.addressId);
    res.status(204).send();
  } catch (error) { next(error); }
};
