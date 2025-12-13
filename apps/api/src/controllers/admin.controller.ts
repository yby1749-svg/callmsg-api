// ============================================================================
// Admin Controller
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service.js';

export const getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await adminService.getDashboard();
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

export const listProviders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await adminService.listProviders(req.query);
    res.json({ success: true, ...result });
  } catch (error) { next(error); }
};

export const getProviderDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const provider = await adminService.getProviderDetail(req.params.providerId);
    res.json({ success: true, data: provider });
  } catch (error) { next(error); }
};

export const approveProvider = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await adminService.approveProvider(req.params.providerId, req.user!.id);
    res.json({ success: true, message: 'Provider approved' });
  } catch (error) { next(error); }
};

export const rejectProvider = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await adminService.rejectProvider(req.params.providerId, req.body.reason);
    res.json({ success: true, message: 'Provider rejected' });
  } catch (error) { next(error); }
};

export const suspendProvider = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await adminService.suspendProvider(req.params.providerId, req.body);
    res.json({ success: true, message: 'Provider suspended' });
  } catch (error) { next(error); }
};

export const unsuspendProvider = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await adminService.unsuspendProvider(req.params.providerId);
    res.json({ success: true, message: 'Provider unsuspended' });
  } catch (error) { next(error); }
};

export const listBookings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await adminService.listBookings(req.query);
    res.json({ success: true, ...result });
  } catch (error) { next(error); }
};

export const getBookingDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const booking = await adminService.getBookingDetail(req.params.bookingId);
    res.json({ success: true, data: booking });
  } catch (error) { next(error); }
};

export const listPayouts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await adminService.listPayouts(req.query);
    res.json({ success: true, ...result });
  } catch (error) { next(error); }
};

export const processPayout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await adminService.processPayout(req.params.payoutId, req.user!.id, req.body);
    res.json({ success: true, message: 'Payout processed' });
  } catch (error) { next(error); }
};

export const rejectPayout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await adminService.rejectPayout(req.params.payoutId, req.body.reason);
    res.json({ success: true, message: 'Payout rejected' });
  } catch (error) { next(error); }
};

export const listReports = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await adminService.listReports(req.query);
    res.json({ success: true, ...result });
  } catch (error) { next(error); }
};

export const getReportDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const report = await adminService.getReportDetail(req.params.reportId);
    res.json({ success: true, data: report });
  } catch (error) { next(error); }
};

export const assignReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await adminService.assignReport(req.params.reportId, req.user!.id);
    res.json({ success: true, message: 'Report assigned' });
  } catch (error) { next(error); }
};

export const resolveReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await adminService.resolveReport(req.params.reportId, req.user!.id, req.body);
    res.json({ success: true, message: 'Report resolved' });
  } catch (error) { next(error); }
};

export const dismissReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await adminService.dismissReport(req.params.reportId, req.user!.id, req.body.reason);
    res.json({ success: true, message: 'Report dismissed' });
  } catch (error) { next(error); }
};

export const listUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await adminService.listUsers(req.query);
    res.json({ success: true, ...result });
  } catch (error) { next(error); }
};

export const getUserDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await adminService.getUserDetail(req.params.userId);
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
};

export const suspendUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await adminService.suspendUser(req.params.userId, req.body);
    res.json({ success: true, message: 'User suspended' });
  } catch (error) { next(error); }
};

export const listServicesAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const services = await adminService.listServices();
    res.json({ success: true, data: services });
  } catch (error) { next(error); }
};

export const createService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const service = await adminService.createService(req.body);
    res.status(201).json({ success: true, data: service });
  } catch (error) { next(error); }
};

export const updateService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const service = await adminService.updateService(req.params.serviceId, req.body);
    res.json({ success: true, data: service });
  } catch (error) { next(error); }
};

export const deleteService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await adminService.deleteService(req.params.serviceId);
    res.status(204).send();
  } catch (error) { next(error); }
};

export const listPromotions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const promotions = await adminService.listPromotions();
    res.json({ success: true, data: promotions });
  } catch (error) { next(error); }
};

export const createPromotion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const promotion = await adminService.createPromotion(req.body);
    res.status(201).json({ success: true, data: promotion });
  } catch (error) { next(error); }
};

export const updatePromotion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const promotion = await adminService.updatePromotion(req.params.promotionId, req.body);
    res.json({ success: true, data: promotion });
  } catch (error) { next(error); }
};

export const deletePromotion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await adminService.deletePromotion(req.params.promotionId);
    res.status(204).send();
  } catch (error) { next(error); }
};
