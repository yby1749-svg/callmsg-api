import {apiClient} from './client';
import type {Review} from '@types';

export interface ReviewsResponse {
  success: boolean;
  data: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const reviewsApi = {
  // Get reviews received by the provider
  getReceivedReviews: (params?: {page?: number; limit?: number}) =>
    apiClient.get<ReviewsResponse>('/reviews/received', {params}),

  // Reply to a review
  replyToReview: (reviewId: string, reply: string) =>
    apiClient.post<{success: boolean; data: Review}>(
      `/reviews/${reviewId}/reply`,
      {reply},
    ),
};
