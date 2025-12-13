// ============================================================================
// Reports Controller
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { reportService } from '../services/reports.service.js';

export const createReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const report = await reportService.createReport(req.user!.id, req.body);
    res.status(201).json({ success: true, data: report });
  } catch (error) { next(error); }
};

export const uploadEvidence = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // TODO: Handle file upload
    res.json({ success: true, url: 'https://example.com/evidence.jpg' });
  } catch (error) { next(error); }
};

export const getMyReports = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const reports = await reportService.getMyReports(req.user!.id);
    res.json({ success: true, data: reports });
  } catch (error) { next(error); }
};
