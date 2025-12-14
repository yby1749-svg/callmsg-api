import axios, {AxiosError, InternalAxiosRequestConfig} from 'axios';
import * as Keychain from 'react-native-keychain';
import {API_URL} from '@config/constants';

interface TokenData {
  accessToken: string;
  refreshToken: string;
}

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (_token: string) => void;
  reject: (_error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

export const getTokens = async (): Promise<TokenData | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({service: 'auth'});
    if (credentials) {
      return JSON.parse(credentials.password);
    }
    return null;
  } catch {
    return null;
  }
};

export const setTokens = async (tokens: TokenData): Promise<void> => {
  await Keychain.setGenericPassword('tokens', JSON.stringify(tokens), {
    service: 'auth',
  });
};

export const clearTokens = async (): Promise<void> => {
  await Keychain.resetGenericPassword({service: 'auth'});
};

// Request interceptor - attach access token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const tokens = await getTokens();
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

// Response interceptor - handle 401 and refresh token
apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({resolve, reject});
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const tokens = await getTokens();
        if (!tokens?.refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken: tokens.refreshToken,
        });

        const newTokens: TokenData = {
          accessToken: response.data.data.accessToken,
          refreshToken: response.data.data.refreshToken,
        };

        await setTokens(newTokens);
        processQueue(null, newTokens.accessToken);

        originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await clearTokens();
        // Navigate to login - will be handled by auth store subscription
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
