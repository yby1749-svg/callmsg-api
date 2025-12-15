// ============================================================================
// Blocked Dates Controller
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { blockedDatesService } from '../services/blocked-dates.service.js';

export const getMyBlockedDates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const blockedDates = await blockedDatesService.getMyBlockedDates(req.user!.id);
    res.json({ success: true, data: blockedDates });
  } catch (error) { next(error); }
};

export const addBlockedDate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const blockedDate = await blockedDatesService.addBlockedDate(req.user!.id, req.body);
    res.status(201).json({ success: true, data: blockedDate });
  } catch (error) { next(error); }
};

export const removeBlockedDate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await blockedDatesService.removeBlockedDate(req.user!.id, req.params.blockedDateId);
    res.status(204).send();
  } catch (error) { next(error); }
};
