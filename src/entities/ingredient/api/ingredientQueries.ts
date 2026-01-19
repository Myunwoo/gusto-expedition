'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ingredientApi } from './ingredientApi';
import { ingredientKeys } from './ingredientQueryKeys';
import type {
  IngredientCollection,
  CreateCollectionRequest,
  CreateCollectionResponse,
  UpdateCollectionRequest,
  AddCollectionItemRequest,
  UpdateCollectionItemOrderRequest,
} from '../model/types';

/**
 * 컬렉션 조회
 */
export const useIngredientCollection = (id: number) => {
  return useQuery({
    queryKey: ingredientKeys.detail(id),
    queryFn: () => ingredientApi.getCollectionById(id),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
    retry: 3,
    enabled: !!id,
  });
};

/**
 * 컬렉션 생성 Mutation
 */
export const useIngredientCreateCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCollectionRequest) => ingredientApi.createCollection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ingredientKeys.lists() });
    },
    retry: false,
  });
};

/**
 * 컬렉션 수정 Mutation
 */
export const useIngredientUpdateCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCollectionRequest }) =>
      ingredientApi.updateCollection(id, data),
    onSuccess: (_: IngredientCollection, variables: { id: number; data: UpdateCollectionRequest }) => {
      queryClient.invalidateQueries({ queryKey: ingredientKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: ingredientKeys.lists() });
    },
    retry: false,
  });
};

/**
 * 컬렉션 삭제 Mutation
 */
export const useIngredientDeleteCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ingredientApi.deleteCollection(id),
    onSuccess: (_: void, id: number) => {
      queryClient.removeQueries({ queryKey: ingredientKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ingredientKeys.lists() });
    },
    retry: false,
  });
};

/**
 * 컬렉션에 재료 추가 Mutation
 */
export const useIngredientAddCollectionItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ collectionId, data }: { collectionId: number; data: AddCollectionItemRequest }) =>
      ingredientApi.addCollectionItem(collectionId, data),
    onSuccess: (_: void, variables: { collectionId: number; data: AddCollectionItemRequest }) => {
      queryClient.invalidateQueries({ queryKey: ingredientKeys.detail(variables.collectionId) });
    },
    retry: false,
  });
};

/**
 * 컬렉션 아이템 순서 수정 Mutation
 */
export const useIngredientUpdateCollectionItemOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCollectionItemOrderRequest) =>
      ingredientApi.updateCollectionItemOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ingredientKeys.all() });
    },
    retry: false,
  });
};

/**
 * 컬렉션 아이템 삭제 Mutation
 */
export const useIngredientDeleteCollectionItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: number) => ingredientApi.deleteCollectionItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ingredientKeys.all() });
    },
    retry: false,
  });
};

