import {apiClient} from './client';
import type {Earning, EarningsSummary, Payout} from '@types';

export interface EarningsListParams {
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface PayoutRequestData {
  amount: number;
  method: 'bank_transfer' | 'gcash' | 'paymaya';
  accountDetails?: {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    mobileNumber?: string;
  };
}

export const earningsApi = {
  // Get earnings summary
  getSummary: () =>
    apiClient.get<{data: EarningsSummary}>('/providers/me/earnings/summary'),

  // Get earnings list
  getEarnings: (params?: EarningsListParams) =>
    apiClient.get<{
      data: Earning[];
      meta: {total: number; page: number; limit: number};
    }>('/providers/me/earnings', {params}),

  // Get payout history
  getPayouts: () => apiClient.get<{data: Payout[]}>('/providers/me/payouts'),

  // Request payout
  requestPayout: (data: PayoutRequestData) =>
    apiClient.post<{data: Payout}>('/providers/me/payouts', data),

  // Get single payout
  getPayout: (payoutId: string) =>
    apiClient.get<{data: Payout}>(`/providers/me/payouts/${payoutId}`),
};
