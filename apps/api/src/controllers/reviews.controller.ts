// ============================================================================
// Reviews Controller
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { reviewService } from '../services/reviews.service.js';

export const createReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const review = await reviewService.createReview(req.user!.id, req.body);
    res.status(201).json({ success: true, data: review });
  } catch (error) { next(error); }
};

export const replyToReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const review = await reviewService.replyToReview(req.user!.id, req.params.reviewId, req.body.reply);
    res.json({ success: true, data: review });
  } catch (error) { next(error); }
};
