import {create} from 'zustand';
import {earningsApi, type PayoutRequestData} from '@api/earnings';
import type {Earning, EarningsSummary, Payout} from '@types';

interface EarningsState {
  summary: EarningsSummary | null;
  earnings: Earning[];
  payouts: Payout[];
  isLoading: boolean;
  error: string | null;

  fetchSummary: () => Promise<void>;
  fetchEarnings: (params?: {
    startDate?: string;
    endDate?: string;
  }) => Promise<void>;
  fetchPayouts: () => Promise<void>;
  requestPayout: (data: PayoutRequestData) => Promise<void>;
  clearError: () => void;
}

export const useEarningsStore = create<EarningsState>((set, _get) => ({
  summary: null,
  earnings: [],
  payouts: [],
  isLoading: false,
  error: null,

  fetchSummary: async () => {
    set({isLoading: true, error: null});
    try {
      const response = await earningsApi.getSummary();
      set({summary: response.data.data, isLoading: false});
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch summary';
      set({error: message, isLoading: false});
    }
  },

  fetchEarnings: async params => {
    set({isLoading: true, error: null});
    try {
      const response = await earningsApi.getEarnings(params);
      set({earnings: response.data.data, isLoading: false});
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch earnings';
      set({error: message, isLoading: false});
    }
  },

  fetchPayouts: async () => {
    set({isLoading: true, error: null});
    try {
      const response = await earningsApi.getPayouts();
      set({payouts: response.data.data, isLoading: false});
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch payouts';
      set({error: message, isLoading: false});
    }
  },

  requestPayout: async (data: PayoutRequestData) => {
    set({isLoading: true, error: null});
    try {
      const response = await earningsApi.requestPayout(data);
      set(state => ({
        payouts: [response.data.data, ...state.payouts],
        summary: state.summary
          ? {
              ...state.summary,
              availableBalance: state.summary.availableBalance - data.amount,
              pendingBalance: state.summary.pendingBalance + data.amount,
            }
          : null,
        isLoading: false,
      }));
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to request payout';
      set({error: message, isLoading: false});
      throw error;
    }
  },

  clearError: () => set({error: null}),
}));
