import {create} from 'zustand';
import Toast from 'react-native-toast-message';

interface UIState {
  isLoading: boolean;
  loadingMessage?: string;

  setLoading: (loading: boolean, message?: string) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
}

export const useUIStore = create<UIState>(set => ({
  isLoading: false,
  loadingMessage: undefined,

  setLoading: (loading, message) =>
    set({isLoading: loading, loadingMessage: message}),

  showSuccess: (title, message) => {
    Toast.show({
      type: 'success',
      text1: title,
      text2: message,
    });
  },

  showError: (title, message) => {
    Toast.show({
      type: 'error',
      text1: title,
      text2: message,
    });
  },

  showInfo: (title, message) => {
    Toast.show({
      type: 'info',
      text1: title,
      text2: message,
    });
  },
}));
