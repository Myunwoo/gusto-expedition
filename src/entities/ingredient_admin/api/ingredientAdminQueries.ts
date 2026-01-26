'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ingredientAdminApi } from './ingredientAdminApi';
import { ingredientAdminKeys } from './ingredientAdminQueryKeys';
import type {
  CreateIngredientBasicReqDto,
  UpdateIngredientBasicReqDto,
  UpdateIngredientI18nReqDto,
  CreateAliasReqDto,
  UpdateAliasAllReqDto,
  CreateIngredientBasicResDto,
  UpdateIngredientBasicResDto,
} from '../model/types';

/**
 * 재료 기본정보 조회
 */
export const useIngredientAdmin = (id: number) => {
  return useQuery({
    queryKey: ingredientAdminKeys.detail(id),
    queryFn: () => ingredientAdminApi.selectIngredient(id),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
    retry: 3,
    enabled: !!id,
  });
};

/**
 * 재료 목록 조회
 */
export const useIngredientList = () => {
  return useQuery({
    queryKey: ingredientAdminKeys.lists(),
    queryFn: () => ingredientAdminApi.selectAll(),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
  });
};

/**
 * 재료 기본정보 생성 Mutation
 */
export const useCreateIngredient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateIngredientBasicReqDto) =>
      ingredientAdminApi.createIngredient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ingredientAdminKeys.lists() });
    },
    retry: false,
  });
};

/**
 * 재료 기본정보 수정 Mutation
 */
export const useUpdateIngredient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateIngredientBasicReqDto) =>
      ingredientAdminApi.updateIngredient(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ingredientAdminKeys.detail(variables.ingredientId) });
      queryClient.invalidateQueries({ queryKey: ingredientAdminKeys.lists() });
    },
    retry: false,
  });
};

/**
 * 재료 i18n 정보 저장 Mutation (upsert: 없으면 생성, 있으면 수정)
 */
export const useUpdateIngredientI18n = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateIngredientI18nReqDto) =>
      ingredientAdminApi.updateIngredientI18n(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ingredientAdminKeys.detail(variables.ingredientId) });
    },
    retry: false,
  });
};

/**
 * 재료 별칭 생성 Mutation
 */
export const useCreateAlias = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAliasReqDto) =>
      ingredientAdminApi.createAlias(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ingredientAdminKeys.detail(variables.ingredientId) });
    },
    retry: false,
  });
};

/**
 * 재료 별칭 일괄 수정 Mutation
 */
export const useUpdateAliasAll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAliasAllReqDto) =>
      ingredientAdminApi.updateAliasAll(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ingredientAdminKeys.detail(variables.ingredientId) });
    },
    retry: false,
  });
};

/**
 * 재료 삭제 Mutation
 */
export const useDeleteIngredient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ingredientAdminApi.deleteIngredient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ingredientAdminKeys.lists() });
    },
    retry: false,
  });
};