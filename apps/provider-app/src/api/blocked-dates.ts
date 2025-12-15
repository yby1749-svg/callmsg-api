import {apiClient} from './client';

export interface BlockedDate {
  id: string;
  providerId: string;
  date: string;
  reason?: string;
  createdAt: string;
}

export interface AddBlockedDateRequest {
  date: string;
  reason?: string;
}

export const blockedDatesApi = {
  getBlockedDates: () =>
    apiClient.get<{data: BlockedDate[]}>('/providers/me/blocked-dates'),

  addBlockedDate: (data: AddBlockedDateRequest) =>
    apiClient.post<{data: BlockedDate}>('/providers/me/blocked-dates', data),

  removeBlockedDate: (blockedDateId: string) =>
    apiClient.delete(`/providers/me/blocked-dates/${blockedDateId}`),
};
