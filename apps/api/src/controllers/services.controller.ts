// ============================================================================
// Services Controller
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { serviceService } from '../services/services.service.js';

export const listServices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const services = await serviceService.listServices(req.query);
    res.json({ success: true, data: services });
  } catch (error) { next(error); }
};

export const getServiceDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const service = await serviceService.getServiceDetail(req.params.serviceId);
    res.json({ success: true, data: service });
  } catch (error) { next(error); }
};

export const getServiceAreas = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const areas = await serviceService.getServiceAreas();
    res.json({ success: true, data: areas });
  } catch (error) { next(error); }
};

export const validatePromoCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await serviceService.validatePromoCode(req.body.code, req.body.amount);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};
