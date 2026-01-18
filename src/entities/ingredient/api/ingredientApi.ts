import { apiClient } from '@/shared/lib/api/client';
import type {
  AddCollectionItemRequest,
  CreateCollectionRequest,
  CreateCollectionResponse,
  IngredientCollection,
  UpdateCollectionItemOrderRequest,
  UpdateCollectionRequest,
} from '../model/types';

/**
 * Ingredient Entity API
 */

export const ingredientApi = {
  /**
   * 컬렉션 생성
   */
  createCollection: (data: CreateCollectionRequest): Promise<CreateCollectionResponse> => {
    return apiClient.post('/ingredient/createCollection', data);
  },

  /**
   * 컬렉션 조회
   */
  getCollectionById: (id: number): Promise<IngredientCollection> => {
    return apiClient.get(`/ingredient/selectCollectionById?id=${id}`);
  },

  /**
   * 컬렉션 수정
   */
  updateCollection: (id: number, data: UpdateCollectionRequest): Promise<IngredientCollection> => {
    return apiClient.post(`/ingredient/updateCollection?id=${id}`, data);
  },

  /**
   * 컬렉션 삭제 (포함된 아이템도 함께 삭제)
   */
  deleteCollection: (id: number): Promise<void> => {
    return apiClient.post(`/ingredient/deleteCollection?id=${id}`);
  },

  /**
   * 컬렉션에 재료 추가
   */
  addCollectionItem: (collectionId: number, data: AddCollectionItemRequest): Promise<void> => {
    return apiClient.post(`/ingredient/addCollectionItem?collectionId=${collectionId}`, data);
  },

  /**
   * 컬렉션 아이템 순서 수정
   */
  updateCollectionItemOrder: (data: UpdateCollectionItemOrderRequest): Promise<void> => {
    return apiClient.post('/ingredient/updateCollectionItemOrder', data);
  },

  /**
   * 컬렉션 아이템 삭제
   */
  deleteCollectionItem: (itemId: number): Promise<void> => {
    return apiClient.post(`/ingredient/deleteCollectionItem?itemId=${itemId}`);
  },
};

