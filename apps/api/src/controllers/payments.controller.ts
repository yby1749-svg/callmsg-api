// ============================================================================
// Payments Controller
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/payments.service.js';

export const handleWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await paymentService.handleWebhook(req.body, req.headers['paymongo-signature'] as string);
    res.json({ success: true });
  } catch (error) { next(error); }
};

export const getPaymentDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const payment = await paymentService.getPaymentDetail(req.user!.id, req.params.paymentId);
    res.json({ success: true, data: payment });
  } catch (error) { next(error); }
};
