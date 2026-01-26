'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recipeAdminApi } from './recipeAdminApi';
import { recipeAdminKeys } from './recipeAdminQueryKeys';
import type {
  CreateRecipeReqDto,
  UpdateRecipeReqDto,
  CreateRecipeResDto,
  UpdateRecipeResDto,
  UpdateRecipeI18nReqDto,
  CreateAliasReqDto,
  UpdateAliasAllReqDto,
  CreateRecipeIngredientReqDto,
  UpdateRecipeIngredientReqDto,
} from '../model/types';

/**
 * 레시피 조회
 */
export const useRecipeAdmin = (id: number) => {
  return useQuery({
    queryKey: recipeAdminKeys.detail(id),
    queryFn: () => recipeAdminApi.selectRecipe(id),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
    retry: 3,
    enabled: !!id,
  });
};

/**
 * 레시피 목록 조회
 */
export const useRecipeList = () => {
  return useQuery({
    queryKey: recipeAdminKeys.lists(),
    queryFn: () => recipeAdminApi.selectAll(),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
  });
};

/**
 * 레시피 생성 Mutation
 */
export const useCreateRecipe = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRecipeReqDto) => recipeAdminApi.createRecipe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recipeAdminKeys.lists() });
    },
  });
};

/**
 * 레시피 수정 Mutation
 */
export const useUpdateRecipe = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateRecipeReqDto) => recipeAdminApi.updateRecipe(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: recipeAdminKeys.lists() });
      queryClient.invalidateQueries({ queryKey: recipeAdminKeys.detail(variables.recipeId) });
    },
  });
};

/**
 * 레시피 삭제 Mutation
 */
export const useDeleteRecipe = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => recipeAdminApi.deleteRecipe(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recipeAdminKeys.lists() });
    },
  });
};

/**
 * 레시피 Locale별 정보 수정 Mutation
 */
export const useUpdateRecipeI18n = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateRecipeI18nReqDto) => recipeAdminApi.updateRecipeI18n(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: recipeAdminKeys.detail(variables.recipeId) });
    },
  });
};

/**
 * 레시피 별칭 생성 Mutation
 */
export const useCreateAlias = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAliasReqDto) => recipeAdminApi.createAlias(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: recipeAdminKeys.detail(variables.recipeId) });
    },
  });
};

/**
 * 레시피 별칭 일괄 수정 Mutation
 */
export const useUpdateAliasAll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateAliasAllReqDto) => recipeAdminApi.updateAliasAll(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: recipeAdminKeys.detail(variables.recipeId) });
    },
  });
};

/**
 * 레시피 재료 목록 조회
 */
export const useRecipeIngredients = (recipeId: number) => {
  return useQuery({
    queryKey: [...recipeAdminKeys.detail(recipeId), 'ingredients'],
    queryFn: () => recipeAdminApi.selectRecipeIngredientsByRecipeId(recipeId),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
    enabled: !!recipeId,
  });
};

/**
 * 레시피 재료 추가 Mutation
 */
export const useCreateRecipeIngredient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRecipeIngredientReqDto) => recipeAdminApi.createRecipeIngredient(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...recipeAdminKeys.detail(variables.recipeId), 'ingredients'] });
      queryClient.invalidateQueries({ queryKey: recipeAdminKeys.detail(variables.recipeId) });
    },
  });
};

/**
 * 레시피 재료 수정 Mutation
 */
export const useUpdateRecipeIngredient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateRecipeIngredientReqDto) => recipeAdminApi.updateRecipeIngredient(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [...recipeAdminKeys.detail(response.recipeId), 'ingredients'] });
      queryClient.invalidateQueries({ queryKey: recipeAdminKeys.detail(response.recipeId) });
    },
  });
};

/**
 * 레시피 재료 삭제 Mutation
 */
export const useDeleteRecipeIngredient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (recipeIngredientId: number) => recipeAdminApi.deleteRecipeIngredient(recipeIngredientId),
    onSuccess: () => {
      // recipeId를 알 수 없으므로 모든 레시피 쿼리를 무효화
      queryClient.invalidateQueries({ queryKey: recipeAdminKeys.all });
    },
  });
};

