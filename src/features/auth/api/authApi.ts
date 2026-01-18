import { apiClient } from '@/shared/lib/api/client';
import type { LoginRequest, LoginResponse, RefreshRequest, RefreshResponse } from '../model/types';

export const authApi = {
  /**
   * 로그인 (Access Token + Refresh Token 발급)
   */
  login: (data: LoginRequest): Promise<LoginResponse> => {
    return apiClient.post('/auth/login', data);
  },

  /**
   * 토큰 갱신
   */
  refresh: (data: RefreshRequest): Promise<RefreshResponse> => {
    return apiClient.post('/auth/refresh', data);
  },

  /**
   * 로그아웃 (Refresh Token 무효화)
   */
  logout: (): Promise<void> => {
    return apiClient.post('/auth/logout');
  },
};

