import { apiClient } from '@/shared/lib/api/client';
import type { RecipeRecommendRequest, RecipeRecommendResponse } from '../model/types';

export const recipeApi = {
  /**
   * 재료 목록으로 레시피 추천
   */
  recommend: (data: RecipeRecommendRequest): Promise<RecipeRecommendResponse> => {
    return apiClient.post('/recipe/recommend', data);
  },
};

