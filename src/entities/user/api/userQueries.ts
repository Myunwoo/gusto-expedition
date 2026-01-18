'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from './userApi';
import { userKeys } from './userQueryKeys';
import type { UserMeResponse, UserSignupRequest, UserSignupResponse, UserUpdateRequest } from '../model/types';

/**
 * 본인 정보 조회
 */
export const useUserMe = () => {
  return useQuery({
    queryKey: userKeys.detail('me'),
    queryFn: () => userApi.getMe(),
    staleTime: 5 * 60 * 1000, // 5분
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

/**
 * 회원가입 Mutation
 */
export const useUserSignup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserSignupRequest) => userApi.signup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all() });
    },
    retry: false,
  });
};

/**
 * 본인 정보 수정 Mutation
 */
export const useUserUpdateMe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserUpdateRequest) => userApi.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail('me') });
    },
    retry: false,
  });
};

/**
 * 회원탈퇴 Mutation
 */
export const useUserDeleteMe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => userApi.deleteMe(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all() });
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    },
    retry: false,
  });
};

