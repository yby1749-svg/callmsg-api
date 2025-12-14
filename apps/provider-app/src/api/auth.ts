import {apiClient} from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<{data: AuthResponse}>('/auth/login', {
      ...data,
      role: 'PROVIDER',
    }),

  register: (data: RegisterRequest) =>
    apiClient.post<{data: AuthResponse}>('/auth/register', {
      ...data,
      role: 'PROVIDER',
    }),

  refreshToken: (refreshToken: string) =>
    apiClient.post<{data: {accessToken: string; refreshToken: string}}>(
      '/auth/refresh',
      {refreshToken},
    ),

  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', {email}),

  resetPassword: (token: string, password: string) =>
    apiClient.post('/auth/reset-password', {token, password}),

  verifyPhone: (phone: string, code: string) =>
    apiClient.post('/auth/verify-phone', {phone, code}),
};
