'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ingredientAdminApi } from './ingredientAdminApi';
import { ingredientAdminKeys } from './ingredientAdminQueryKeys';

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