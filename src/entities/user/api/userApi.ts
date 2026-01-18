import { apiClient } from '@/shared/lib/api/client';
import type { UserMeResponse, UserSignupRequest, UserSignupResponse, UserUpdateRequest } from '../model/types';

/**
 * User Entity API
 */

export const userApi = {
  /**
   * 회원가입
   */
  signup: (data: UserSignupRequest): Promise<UserSignupResponse> => {
    return apiClient.post('/user/signup', data);
  },

  /**
   * 본인 정보 조회
   */
  getMe: (): Promise<UserMeResponse> => {
    return apiClient.get('/user/me');
  },

  /**
   * 본인 정보 수정
   */
  updateMe: (data: UserUpdateRequest): Promise<UserMeResponse> => {
    return apiClient.post('/user/me', data);
  },

  /**
   * 회원탈퇴 (소프트 삭제)
   */
  deleteMe: (): Promise<void> => {
    return apiClient.post('/user/me/delete');
  },
};

