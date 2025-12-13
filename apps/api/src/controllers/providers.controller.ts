// ============================================================================
// Providers Controller
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { providerService } from '../services/providers.service.js';

// Public
export const listProviders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await providerService.listProviders(req.query);
    res.json({ success: true, ...result });
  } catch (error) { next(error); }
};

export const getProviderDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const provider = await providerService.getProviderDetail(req.params.providerId);
    res.json({ success: true, data: provider });
  } catch (error) { next(error); }
};

export const getProviderReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await providerService.getProviderReviews(req.params.providerId, req.query);
    res.json({ success: true, ...result });
  } catch (error) { next(error); }
};

export const getProviderAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const slots = await providerService.getProviderAvailability(req.params.providerId, req.query.date as string);
    res.json({ success: true, data: slots });
  } catch (error) { next(error); }
};

// Provider Management
export const registerAsProvider = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const provider = await providerService.registerAsProvider(req.user!.id, req.body);
    res.status(201).json({ success: true, data: provider });
  } catch (error) { next(error); }
};

export const getMyProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const provider = await providerService.getMyProfile(req.user!.id);
    res.json({ success: true, data: provider });
  } catch (error) { next(error); }
};

export const updateMyProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const provider = await providerService.updateMyProfile(req.user!.id, req.body);
    res.json({ success: true, data: provider });
  } catch (error) { next(error); }
};

export const getMyDocuments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const docs = await providerService.getMyDocuments(req.user!.id);
    res.json({ success: true, data: docs });
  } catch (error) { next(error); }
};

export const uploadDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // TODO: Handle file upload
    res.status(201).json({ success: true, message: 'Document uploaded' });
  } catch (error) { next(error); }
};

export const getMyServices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const services = await providerService.getMyServices(req.user!.id);
    res.json({ success: true, data: services });
  } catch (error) { next(error); }
};

export const setService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const service = await providerService.setService(req.user!.id, req.body);
    res.json({ success: true, data: service });
  } catch (error) { next(error); }
};

export const removeService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await providerService.removeService(req.user!.id, req.params.serviceId);
    res.status(204).send();
  } catch (error) { next(error); }
};

export const getMyAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const availability = await providerService.getMyAvailability(req.user!.id);
    res.json({ success: true, data: availability });
  } catch (error) { next(error); }
};

export const setMyAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const availability = await providerService.setMyAvailability(req.user!.id, req.body);
    res.json({ success: true, data: availability });
  } catch (error) { next(error); }
};

export const updateOnlineStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await providerService.updateOnlineStatus(req.user!.id, req.body.status);
    res.json({ success: true, message: 'Status updated' });
  } catch (error) { next(error); }
};

export const updateLocation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await providerService.updateLocation(req.user!.id, req.body);
    res.json({ success: true, message: 'Location updated' });
  } catch (error) { next(error); }
};

export const updateBankAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await providerService.updateBankAccount(req.user!.id, req.body);
    res.json({ success: true, message: 'Bank account updated' });
  } catch (error) { next(error); }
};

export const getEarnings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const earnings = await providerService.getEarnings(req.user!.id, req.query);
    res.json({ success: true, data: earnings });
  } catch (error) { next(error); }
};

export const getEarningsSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const summary = await providerService.getEarningsSummary(req.user!.id);
    res.json({ success: true, data: summary });
  } catch (error) { next(error); }
};

export const getPayouts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const payouts = await providerService.getPayouts(req.user!.id);
    res.json({ success: true, data: payouts });
  } catch (error) { next(error); }
};

export const requestPayout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const payout = await providerService.requestPayout(req.user!.id, req.body);
    res.status(201).json({ success: true, data: payout });
  } catch (error) { next(error); }
};
